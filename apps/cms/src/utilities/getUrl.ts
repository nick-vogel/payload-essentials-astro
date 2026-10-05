export const getServerSideURL = () => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

// The path the web app serves a document at: the home page at the root, posts under /blog.
// Keep in step with pageHref and postHref in apps/web/src/lib/links.ts.
export const getDocPath = (collectionSlug: string | undefined, slug: string | null | undefined) => {
  if (collectionSlug === 'posts') return `/blog/${slug}`
  return !slug || slug === 'home' ? '/' : `/${slug}`
}
