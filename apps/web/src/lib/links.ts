import type { Nav, Page } from 'cms/types'

// The slug of the page that renders at the root.
export const HOME_SLUG = 'home'

// The home page lives at the root, every other page at its slug.
export function pageHref(slug: string | null | undefined): string {
  return !slug || slug === HOME_SLUG ? '/' : `/${slug}`
}

export function postHref(slug: string): string {
  return `/blog/${slug}`
}

// The linked pages of the navigation, skipping any link the query left unpopulated.
export function navLinks(navItems: Nav['navItems']): Page[] {
  return (navItems ?? []).flatMap(({ link }) => (typeof link === 'object' ? [link] : []))
}

// The base for absolute URLs. SITE_URL sets `site`. The request origin is the last resort, and is wrong behind a proxy.
export function siteOrigin({ site, url }: { site: URL | undefined; url: URL }): string {
  return site?.href ?? url.origin
}

// The blog list at a page and a category. Page 1 and no category leave their param out.
export function blogHref({ page = 1, category }: { page?: number; category?: string | null } = {}): string {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/blog?${query}` : '/blog'
}
