import type { Page, Post } from 'cms/types'
import { isMedia, mediaFile } from './media'

// The metadata a route hands to the base layout. The layout fills the gaps from the Settings global.
export type PageMeta = {
  title?: string
  description?: string | null
  canonical?: string | null
  image?: string | null
}

// The SEO fields win, then the document's own fields, as in the Next.js generateMeta.
export function docMeta(doc: Page | Post): PageMeta {
  const image = doc.meta?.image || doc.featuredImage
  return {
    title: doc.meta?.title || doc.title,
    description: doc.meta?.description || ('summary' in doc ? doc.summary : null),
    canonical: doc.meta?.canonicalUrl,
    image: isMedia(image) ? mediaFile(image, 'og')?.url : null,
  }
}
