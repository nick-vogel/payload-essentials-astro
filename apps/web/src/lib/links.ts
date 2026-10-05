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
