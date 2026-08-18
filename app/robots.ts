import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';
import { siteUrl } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: business.isMock
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: siteUrl('/sitemap.xml'),
  };
}
