import type { CollectionBeforeChangeHook } from 'payload'
import sharp from 'sharp'
import type { Media } from '@/payload-types'

export const generateBlurData: CollectionBeforeChangeHook<Media> = async ({
  req: { file },
  data,
}) => {
  if (!data.blurDataUrl) {
    if (!file || !file.data) {
      return data
    }
    const mimetype = file.mimetype
    const isValidImage = mimetype.startsWith('image/') && mimetype !== 'image/svg+xml'
    if (!isValidImage) {
      return data
    }
    const buffer = await sharp(file.data).resize({width: 8}).toFormat('webp').toBuffer()
    const base64 = buffer.toString('base64')
    data.blurDataUrl = `data:${mimetype};base64,${base64}`
    return data
  }
  return data
}
