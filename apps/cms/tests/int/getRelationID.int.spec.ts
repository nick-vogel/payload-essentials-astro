import { describe, expect, it } from 'vitest'
import type { Category } from '@/payload-types'
import { getRelationID } from '@/utilities/getRelationID'

// Postgres rejects a populated relationship in a `where` clause
// ("invalid input syntax for type uuid"), so queries must pass the ID.
describe('getRelationID', () => {
  const id = 'cbba6823-9b15-4763-9fe4-eab9f3f91d32'

  it('returns the ID of a populated relationship', () => {
    const category = { id, name: 'Smoke' } as Category
    expect(getRelationID(category)).toBe(id)
  })

  it('returns an unpopulated ID as is', () => {
    expect(getRelationID(id)).toBe(id)
  })

  it('returns null for an empty relationship', () => {
    expect(getRelationID(null)).toBeNull()
    expect(getRelationID(undefined)).toBeNull()
  })
})
