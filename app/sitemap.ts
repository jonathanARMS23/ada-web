import type { MetadataRoute } from 'next'
import { NAV_ITEMS } from '@/lib/docs-nav'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    ...NAV_ITEMS.map(item => ({
      url: item.slug === '' ? `${SITE_URL}/docs` : `${SITE_URL}/docs/${item.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
