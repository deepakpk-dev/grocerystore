import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { CATALOG_TAG } from '@/lib/catalog';
import { fetchCatalogFromSheets } from '@/lib/sheets';

export const runtime = 'nodejs';

function secretsMatch(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function htmlResponse(message: string, status: number): Response {
  return new Response(
    `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Catalog refresh</title><body style="font:16px system-ui;padding:2rem"><p>${message}</p></body></html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function GET(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const isManualRequest = url.searchParams.has('t');
  const isCron = secretsMatch(
    request.headers.get('authorization'),
    process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined,
  );
  const isManual = secretsMatch(url.searchParams.get('t'), process.env.REFRESH_TOKEN);
  const requestId = request.headers.get('x-vercel-id');

  console.log(JSON.stringify({ level: 'info', message: 'Catalog refresh started', requestId }));

  if (!isCron && !isManual) {
    console.warn(JSON.stringify({ level: 'warn', message: 'Unauthorized catalog refresh', requestId }));
    return isManualRequest
      ? htmlResponse('Refresh link is not authorized.', 401)
      : Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const items = await fetchCatalogFromSheets();
    revalidateTag(CATALOG_TAG, { expire: 0 });
    const updatedAt = new Date().toISOString();
    console.log(
      JSON.stringify({
        level: 'info',
        message: 'Catalog refresh completed',
        requestId,
        itemCount: items.length,
        durationMs: Date.now() - startedAt,
      }),
    );

    if (isManual) {
      const time = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(updatedAt));
      return htmlResponse(`✓ Catalog updated at ${time}. ${items.length} items validated.`, 200);
    }
    return Response.json({ ok: true, updatedAt, itemCount: items.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'Catalog refresh failed',
        requestId,
        error: message,
        durationMs: Date.now() - startedAt,
      }),
    );
    return isManual
      ? htmlResponse('Catalog refresh failed. Please try again or contact support.', 500)
      : Response.json({ ok: false, error: 'Catalog refresh failed' }, { status: 500 });
  }
}

export const POST = GET;
