import type { Media } from 'cms/types'
import { payloadURL } from './payloadURL'

type Size = keyof NonNullable<Media['sizes']>

type MediaFile = { url: string; width: number; height: number; alt: string }

// Payload stores media URLs relative to the CMS, as /api/media/file/<name>.
function mediaURL(url: string): string {
  return new URL(url, payloadURL).href
}

// The image size if Payload generated it, else the original. Payload skips a size
// that is larger than the upload, so a small image has no URL for it.
// A relationship is an ID until the query populates it, and an unpopulated one gives null.
export function mediaFile(media: Media | string | null | undefined, size?: Size): MediaFile | null {
  if (!media || typeof media !== 'object') return null
  const file = size ? media.sizes?.[size] : undefined
  const chosen = file?.url ? file : media
  if (!chosen.url || !chosen.width || !chosen.height) return null
  return { url: mediaURL(chosen.url), width: chosen.width, height: chosen.height, alt: media.alt || '' }
}
