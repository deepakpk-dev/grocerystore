import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchCatalogFromSheets, revalidateTag } = vi.hoisted(() => ({
  fetchCatalogFromSheets: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/sheets', () => ({ fetchCatalogFromSheets }));
vi.mock('next/cache', () => ({
  revalidateTag,
  unstable_cache: (callback: unknown) => callback,
}));

import { GET } from '@/app/api/refresh/route';

describe('/api/refresh', () => {
  beforeEach(() => {
    vi.stubEnv('REFRESH_TOKEN', 'manual-secret');
    vi.stubEnv('CRON_SECRET', 'cron-secret');
    fetchCatalogFromSheets.mockResolvedValue([{ slug: 'okra' }]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('rejects an invalid manual token', async () => {
    const response = await GET(new Request('https://example.com/api/refresh?t=wrong'));
    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toMatch(/text\/html/);
    expect(fetchCatalogFromSheets).not.toHaveBeenCalled();
  });

  it('validates and immediately expires the catalog for a manual refresh', async () => {
    const response = await GET(
      new Request('https://example.com/api/refresh?t=manual-secret'),
    );
    expect(response.status).toBe(200);
    expect(fetchCatalogFromSheets).toHaveBeenCalledOnce();
    expect(revalidateTag).toHaveBeenCalledWith('catalog', { expire: 0 });
  });

  it('accepts Vercel cron bearer authorization', async () => {
    const response = await GET(
      new Request('https://example.com/api/refresh', {
        headers: { authorization: 'Bearer cron-secret' },
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, itemCount: 1 });
  });
});
