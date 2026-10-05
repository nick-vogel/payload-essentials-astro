// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { loadEnv } from 'payload/node'

// Astro loads .env into import.meta.env only, but the CMS config reads
// process.env. This loads the .env files into process.env, as Payload's
// examples/astro does. The built server reads the real process env instead.
loadEnv()

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    resolve: {
      // The CMS config imports its own modules through the cms tsconfig's @/ path.
      // Vite applies a tsconfig's paths only to files that tsconfig includes, so
      // @/ resolves to apps/cms/src for CMS files and stays free for the web app.
      tsconfigPaths: true,
    },
  },
})
