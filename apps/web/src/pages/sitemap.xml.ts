import type { APIRoute } from 'astro'
import { find } from '../lib/cms'
import { pageHref, postHref } from '../lib/links'

// Only the documents an editor left in the sitemap, through the SEO tab's checkbox.
const options = {
  where: { 'meta.addToSitemap': { equals: true } },
  select: { slug: true, updatedAt: true },
  pagination: false,
} as const

const escapeXML = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos' }[char]};`)

// Without SITE_URL, the URLs fall back to the request's own origin, as the layout does.
export const GET = (async ({ site, url }) => {
  const origin = site ?? url.origin
  const [pages, posts] = await Promise.all([find('pages', options), find('posts', options)])

  const entries = [
    ...pages.docs.map(({ slug, updatedAt }) => ({ path: pageHref(slug), updatedAt })),
    ...posts.docs.map(({ slug, updatedAt }) => ({ path: postHref(slug), updatedAt })),
  ]
  const urls = entries.map(
    ({ path, updatedAt }) =>
      `  <url>\n    <loc>${escapeXML(new URL(path, origin).href)}</loc>\n    <lastmod>${updatedAt}</lastmod>\n  </url>`,
  )
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}) satisfies APIRoute
