import { MetadataRoute } from 'next'
export const dynamic = 'force-static'
import { SITE_ORIGIN, routePath, allSitemapPages } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return allSitemapPages().map((page) => ({
    url: `${SITE_ORIGIN}${routePath(page.path)}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
