import { MetadataRoute } from 'next'
export const dynamic = 'force-static'
import { SITE_ORIGIN, SITE_BASE_PATH } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_ORIGIN}${SITE_BASE_PATH}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
