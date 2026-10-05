import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { beforeAll, describe, expect, it } from 'vitest'

// The Astro web app reads through the Local API with overrideAccess false and no user,
// so a visitor gets exactly what these read rules allow.
describe('public read access', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it.each(['pages', 'posts', 'categories', 'media'] as const)('lets a visitor read %s', async (collection) => {
    await expect(payload.find({ collection, limit: 1, depth: 0, overrideAccess: false })).resolves.toBeDefined()
  })

  it.each(['settings', 'nav'] as const)('lets a visitor read the %s global', async (slug) => {
    await expect(payload.findGlobal({ slug, depth: 0, overrideAccess: false })).resolves.toBeDefined()
  })

  it('does not let a visitor create a category', async () => {
    await expect(
      payload.create({ collection: 'categories', data: { name: 'Visitor Category', slug: 'visitor-category' }, overrideAccess: false }),
    ).rejects.toThrow()
  })
})
