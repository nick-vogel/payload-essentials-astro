import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from '@/seed'

// Entry for `pnpm payload run src/seed/run.ts`. The CLI exits once this module finishes.
const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(12).toString('base64url')

const payload = await getPayload({ config })
await seed({ payload, admin: { email, password } })

payload.logger.info(`Seed complete. Log in at /admin as ${email}`)
if (!process.env.SEED_ADMIN_PASSWORD) payload.logger.info(`Generated password: ${password}`)
