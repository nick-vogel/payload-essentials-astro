import { findBySlug } from './cms'

// A page with every media field its blocks and metadata use: the hero and TextAndImage
// images at fullSize, the card images at card, and the featured image at og.
// Payload builds the original's url from its filename, and mediaFile falls back to the
// original for an image too small for the size, so the filename has to come along.
export function findPage(slug: string) {
  return findBySlug('pages', slug, {
    populate: {
      media: {
        filename: true,
        url: true,
        width: true,
        height: true,
        alt: true,
        sizes: { fullSize: true, card: true, og: true },
      },
    },
  })
}
