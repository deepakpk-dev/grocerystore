import { CatalogSchema, type Catalog } from "./schema";
import { MOCK_ITEMS } from "./mock-catalog";

// Phase 0: returns mock fixture. Phase 1 will swap this for a Google Sheets
// fetch wrapped in `unstable_cache` with tag 'catalog'.
export async function getCatalog(): Promise<Catalog> {
  return CatalogSchema.parse({
    items: MOCK_ITEMS,
    updatedAt: new Date().toISOString(),
  });
}
