import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getUrl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = getServerSideURL()
  try {
    const payload = await getPayload({ config })

    const pages = await payload.find({
      collection: 'pages',
      where: {
        'meta.addToSitemap': {
          equals: true,
        },
      },
      limit: 0,
      select: {
        'meta.addToSitemap': true,
        updatedAt: true,
        slug: true,
      },
    })

    const posts = await payload.find({
      collection: 'posts',
      where: {
        'meta.addToSitemap': {
          equals: true,
        },
      },
      select: {
        'meta.addToSitemap': true,
        updatedAt: true,
        slug: true,
      },
      limit: 0,
    })
    const pageEntries: MetadataRoute.Sitemap = pages.docs.map(
      (page) => ({
        url: `${baseURL}/${page.slug === 'home' ? '' : page.slug}`,
        lastModified: new Date(page.updatedAt),
      }),
    )
    const postEntries: MetadataRoute.Sitemap = posts.docs.map(
      (post) => ({
        url: `${baseURL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
      }),
    )

    return [...pageEntries, ...postEntries]
  } catch {
    return [{ url: baseURL }]
  }
}
