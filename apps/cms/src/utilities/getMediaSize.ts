import {Media} from '@/payload-types'

type Size = keyof NonNullable<Media['sizes']>

export function getMediaSize(doc: Media, size?: Size) {
  if (!size) return doc
  if (doc.sizes) {
    switch (size) {
      case 'og':
        return doc.sizes.og || doc
      case 'thumbnail':
        return doc.sizes.thumbnail || doc
      case 'card':
        return doc.sizes.card || doc
      case 'fullSize':
        return doc.sizes.fullSize || doc
      default:
        return doc
    }
  } else {
    return doc
  }
}