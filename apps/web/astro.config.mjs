// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { loadEnv } from 'payload/node'

// Astro loads .env into import.meta.env only, but the CMS config reads
// process.env. This loads the .env files into process.env, as Payload's
// examples/astro does. The built server reads the real process env instead.
loadEnv()

// Imported after loadEnv, so it sees PAYLOAD_URL from the .env files.
const { payloadURL } = await import('./src/lib/payloadURL.ts')

export default defineConfig({
  // The public URL of the web app, for og:url when a page has no canonical and for the sitemap.
  // Optional: without it, the layout falls back to the request's own origin.
  site: process.env.SITE_URL || undefined,
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  image: {
    // The media files live on the CMS, so Astro may fetch and optimize images from its host only.
    remotePatterns: [
      {
        protocol: payloadURL.protocol.slice(0, -1),
        hostname: payloadURL.hostname,
        port: payloadURL.port,
        pathname: '/api/media/file/**',
      },
    ],
  },
  vite: {
    resolve: {
      // The CMS config imports its own modules through the cms tsconfig's @/ path.
      // Vite applies a tsconfig's paths only to files that tsconfig includes, so
      // @/ resolves to apps/cms/src for CMS files and stays free for the web app.
      tsconfigPaths: true,
    },
  },
})
