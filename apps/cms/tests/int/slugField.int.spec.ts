import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Payload 3.90.2 validates the required slug before slugField's hook sets it,
// so every create without a slug fails (payloadcms/payload#18334).
describe('slugField', () => {
  let payload: Payload
  let id: string | undefined

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    if (id) await payload.delete({ collection: 'categories', id })
  })

  it('generates the slug when a document is created without one', async () => {
    const category = await payload.create({
      collection: 'categories',
      // slugField marks slug required, so the generated Category type demands it.
      // An empty slug is what the admin form sends, and the hook treats it as missing.
      data: { name: 'Slug Field Test', slug: '' },
    })
    id = category.id
    expect(category.slug).toBe('slug-field-test')
  })
})
