// @vitest-environment node
import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { beforeAll, describe, expect, it } from 'vitest'

// The web app loads this config too. Schema push in dev would let either app
// change the database, so the schema only changes through migrations.
describe('database adapter', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it('disables schema push', () => {
    expect((payload.db as PostgresAdapter).push).toBe(false)
  })
})
