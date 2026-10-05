import type { Media } from 'cms/types'
import { payloadURL } from './payloadURL'

type Size = keyof NonNullable<Media['sizes']>

export type MediaFile = { url: string; width: number; height: number }

// A relationship is an ID until the query populates it.
export function isMedia(value: unknown): value is Media {
  return value !== null && typeof value === 'object'
}

// Payload stores media URLs relative to the CMS, as /api/media/file/<name>.
export function mediaURL(url: string): string {
  return new URL(url, payloadURL).href
}

// The image size if Payload generated it, else the original. Payload skips a size
// that is larger than the upload, so a small image has no URL for it.
export function mediaFile(media: Media, size?: Size): MediaFile | null {
  const file = size ? media.sizes?.[size] : undefined
  const chosen = file?.url ? file : media
  if (!chosen.url || !chosen.width || !chosen.height) return null
  return { url: mediaURL(chosen.url), width: chosen.width, height: chosen.height }
}
