import type { APIRoute } from 'astro'
import { siteOrigin } from '../lib/links'
import { linesResponse } from '../lib/response'

export const GET = ((context) => {
  const sitemap = new URL('/sitemap.xml', siteOrigin(context))

  return linesResponse(['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap.href}`], 'text/plain; charset=utf-8')
}) satisfies APIRoute
