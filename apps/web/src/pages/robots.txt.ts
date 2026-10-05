import type { APIRoute } from 'astro'

// Without SITE_URL, the sitemap URL falls back to the request's own origin, as the layout does.
export const GET = (({ site, url }) => {
  const sitemap = new URL('/sitemap.xml', site ?? url.origin)
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap.href}`, ''].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}) satisfies APIRoute
