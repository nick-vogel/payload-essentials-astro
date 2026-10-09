import type { APIRoute } from 'astro'
import { find } from '../lib/cms'
import { pageHref, postHref, siteOrigin } from '../lib/links'
import { linesResponse } from '../lib/response'

// Only the documents an editor left in the sitemap, through the SEO tab's checkbox.
const sitemapQuery = {
  where: { 'meta.addToSitemap': { equals: true } },
  select: { slug: true, updatedAt: true },
  pagination: false,
} as const

const XML_ENTITIES: Record<string, string> = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos' }

const escapeXML = (value: string) => value.replace(/[&<>"']/g, (char) => `&${XML_ENTITIES[char]};`)

export const GET = (async (context) => {
  const origin = siteOrigin(context)
  const [pages, posts] = await Promise.all([find('pages', sitemapQuery), find('posts', sitemapQuery)])

  const entries = [
    ...pages.docs.map(({ slug, updatedAt }) => ({ path: pageHref(slug), updatedAt })),
    ...posts.docs.map(({ slug, updatedAt }) => ({ path: postHref(slug), updatedAt })),
  ]
  const urls = entries.map(
    ({ path, updatedAt }) =>
      `  <url>\n    <loc>${escapeXML(new URL(path, origin).href)}</loc>\n    <lastmod>${updatedAt}</lastmod>\n  </url>`,
  )

  return linesResponse(
    ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>'],
    'application/xml; charset=utf-8',
  )
}) satisfies APIRoute
