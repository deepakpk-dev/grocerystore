import { google } from 'googleapis';
import { itemSchema, type Category, type Item, type StockLevel } from './schema';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const REQUIRED_HEADERS = ['name', 'category', 'stock', 'price', 'unit'] as const;

const CATEGORY_VALUES: Record<string, Category> = {
  vegetables: 'vegetables',
  fruits: 'fruits',
  fish: 'fish',
  meat: 'meat',
  'dry goods': 'dry-goods',
  'dry-goods': 'dry-goods',
};

const STOCK_VALUES: Record<string, StockLevel> = {
  'in stock': 'in-stock',
  'in-stock': 'in-stock',
  low: 'low',
  'out of stock': 'out-of-stock',
  'out-of-stock': 'out-of-stock',
};

export type CatalogParseResult = {
  items: Item[];
  errors: string[];
};

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parsePrice(value: unknown): number {
  if (typeof value === 'number') return value;
  return Number(String(value ?? '').trim().replace(',', '.'));
}

function parseFeatured(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  return ['true', 'yes', '1', 'x'].includes(String(value ?? '').trim().toLowerCase());
}

function optionalText(value: unknown): string | undefined {
  const text = String(value ?? '').trim();
  return text || undefined;
}

export function parseCatalogRows(values: unknown[][]): CatalogParseResult {
  if (values.length === 0) throw new Error('The catalog sheet is empty.');

  const headers = values[0].map((value) => String(value ?? '').trim().toLowerCase());
  const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
  const missing = REQUIRED_HEADERS.filter((header) => headerIndex[header] === undefined);
  if (missing.length > 0) {
    throw new Error(`Catalog sheet is missing required columns: ${missing.join(', ')}`);
  }

  const items: Item[] = [];
  const errors: string[] = [];
  const slugs = new Set<string>();

  for (const [offset, row] of values.slice(1).entries()) {
    const rowNumber = offset + 2;
    const name = String(row[headerIndex.name] ?? '').trim();
    if (!name) continue;

    const categoryValue = String(row[headerIndex.category] ?? '').trim().toLowerCase();
    const stockValue = String(row[headerIndex.stock] ?? '').trim().toLowerCase();
    const slug = slugify(name);
    const result = itemSchema.safeParse({
      slug,
      name,
      category: CATEGORY_VALUES[categoryValue],
      stock: STOCK_VALUES[stockValue],
      price: parsePrice(row[headerIndex.price]),
      unit: String(row[headerIndex.unit] ?? '').trim(),
      origin: optionalText(row[headerIndex.origin]),
      photoUrl: optionalText(row[headerIndex.photo_url]),
      featured: parseFeatured(row[headerIndex.featured]),
    });

    if (!result.success) {
      errors.push(`Row ${rowNumber}: ${result.error.issues.map((issue) => issue.message).join('; ')}`);
      continue;
    }
    if (slugs.has(result.data.slug)) {
      errors.push(`Row ${rowNumber}: duplicate item name creates slug "${result.data.slug}"`);
      continue;
    }

    slugs.add(result.data.slug);
    items.push(result.data);
  }

  if (items.length === 0) throw new Error('The catalog sheet contains no valid product rows.');
  return { items, errors };
}

function requireSheetConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const encodedKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!spreadsheetId || !clientEmail || !encodedKey) {
    throw new Error('Google Sheets credentials are incomplete.');
  }

  const privateKey = Buffer.from(encodedKey, 'base64').toString('utf8');
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not a base64-encoded private key.');
  }
  return { spreadsheetId, clientEmail, privateKey };
}

export function hasSheetConfig(): boolean {
  const values = [
    process.env.GOOGLE_SHEETS_ID,
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  ];
  if (values.every((value) => !value)) return false;
  if (values.some((value) => !value)) throw new Error('Google Sheets credentials are incomplete.');
  return true;
}

export async function fetchCatalogFromSheets(): Promise<Item[]> {
  const { spreadsheetId, clientEmail, privateKey } = requireSheetConfig();
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [SHEETS_SCOPE],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'A:I' });
  const { items, errors } = parseCatalogRows(response.data.values ?? []);

  for (const error of errors) {
    console.warn(JSON.stringify({ level: 'warn', message: 'Skipped invalid catalog row', error }));
  }
  return items;
}
