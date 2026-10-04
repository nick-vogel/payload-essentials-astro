import type {SerializedLinkNode} from '@payloadcms/richtext-lexical'
import type {CollectionSlug} from 'payload'

export const internalDocToHref = ({linkNode}: {linkNode: SerializedLinkNode}) => {
  const {value, relationTo} = linkNode.fields.doc!

  if (typeof value !== 'object') throw new Error ('Expected an object')

  const slug = value.slug

  switch (relationTo as CollectionSlug) {
    case 'posts':
      return `/blog/${slug}`
    case 'pages':
      return `/${slug === 'home' ? '/' : slug}`
    default:
      return `/${relationTo}/${slug}`
  }
}