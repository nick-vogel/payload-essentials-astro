// The home page lives at the root, every other page at its slug.
export function pageHref(slug: string | null | undefined): string {
  return !slug || slug === 'home' ? '/' : `/${slug}`
}
