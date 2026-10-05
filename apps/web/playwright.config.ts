import os from 'os'
import path from 'path'
import { defineConfig, devices } from '@playwright/test'

// The suite runs the web app against a CMS on its own database and media folder,
// so every run starts from the seed and never touches your development content.
if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
  throw new Error('Set DATABASE_URL and PAYLOAD_SECRET before you run the end-to-end tests.')
}

const database = new URL(process.env.DATABASE_URL)
database.pathname = `${database.pathname}-e2e`
const mediaDir = path.join(os.tmpdir(), `${path.basename(database.pathname)}-media`)

const cmsPort = Number(process.env.E2E_CMS_PORT || 3100)
const webPort = Number(process.env.E2E_WEB_PORT || 4400)
const cmsURL = `http://127.0.0.1:${cmsPort}`
const webURL = `http://127.0.0.1:${webPort}`

const env = { ...process.env, DATABASE_URL: database.toString(), MEDIA_DIR: mediaDir } as Record<string, string>

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: webURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      name: 'cms',
      // migrate:fresh drops everything in the test database, so the seed always runs on an empty one.
      // The canonical URLs the seed writes point at the web app, as they do in production.
      command: [
        `node -e "fs.rmSync(process.env.MEDIA_DIR, { recursive: true, force: true })"`,
        'pnpm --filter cms payload migrate:fresh --force-accept-warning',
        'pnpm --filter cms payload run src/seed/run.ts',
        'pnpm --filter cms dev',
      ].join(' && '),
      env: { ...env, PORT: String(cmsPort), NEXT_PUBLIC_SERVER_URL: webURL },
      url: `${cmsURL}/api/media?limit=1`,
      reuseExistingServer: false,
      timeout: 300_000,
      stdout: 'ignore',
    },
    {
      name: 'web',
      // --ignore-lock lets the suite run next to your own dev server. It also keeps Astro
      // in the foreground when an AI agent runs the tests, so Playwright can stop it.
      command: `pnpm exec astro dev --ignore-lock --host 127.0.0.1 --port ${webPort}`,
      env: { ...env, PAYLOAD_URL: cmsURL },
      // A static file, so the readiness check never queries the database before the seed has run.
      url: `${webURL}/pe-icon.png`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
