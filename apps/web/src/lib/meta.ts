import type { Page, Post } from 'cms/types'
import { mediaFile } from './media'

// The metadata a route hands to the base layout. The layout fills the gaps from the Settings global.
export type PageMeta = {
  title?: string
  description?: string | null
  canonical?: string | null
  image?: string | null
  // A post is an Open Graph article, with these article tags. Every other page is a website.
  article?: ArticleMeta
}

export type ArticleMeta = {
  publishedTime?: string | null
  modifiedTime?: string | null
  author?: string | null
  section?: string | null
}

// The SEO fields win, then the document's own fields, as in the Next.js generateMeta.
export function docMeta(doc: Page | Post): PageMeta {
  const image = doc.meta?.image || doc.featuredImage
  return {
    title: doc.meta?.title || doc.title,
    description: doc.meta?.description || ('summary' in doc ? doc.summary : null),
    canonical: doc.meta?.canonicalUrl,
    image: mediaFile(image, 'og')?.url,
  }
}

// A post's metadata, plus the article tags the Next.js generateArticleMeta set.
export function postMeta(post: Post): PageMeta {
  return {
    ...docMeta(post),
    article: {
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
      author: post.populatedAuthor?.name,
      section: typeof post.category === 'object' ? post.category?.name : null,
    },
  }
}
