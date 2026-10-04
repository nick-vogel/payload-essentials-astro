import { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getUrl'

export default function robots(): MetadataRoute.Robots {
  const baseURL = getServerSideURL()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${baseURL}/sitemap.xml`,
  }
}
