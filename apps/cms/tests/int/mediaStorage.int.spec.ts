// @vitest-environment node
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Uploads go to the server disk, not S3, so they must land in staticDir.
describe('media storage', () => {
  let payload: Payload
  let id: string | undefined

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    if (id) await payload.delete({ collection: 'media', id })
  })

  it('writes an upload and its image sizes to staticDir', async () => {
    const data = await sharp({
      create: { width: 1920, height: 1080, channels: 3, background: '#336699' },
    })
      .png()
      .toBuffer()

    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Media storage test' },
      file: { data, mimetype: 'image/png', name: 'media-storage-test.png', size: data.length },
    })
    id = media.id

    const staticDir = payload.collections.media.config.upload.staticDir
    expect(path.isAbsolute(staticDir)).toBe(true)
    expect(media.url).toBe(`/api/media/file/${media.filename}`)
    expect(media.blurDataUrl).toMatch(/^data:image\//)
    expect(fs.existsSync(path.join(staticDir, media.filename!))).toBe(true)
    expect(fs.existsSync(path.join(staticDir, media.sizes!.card!.filename!))).toBe(true)
  })
})
