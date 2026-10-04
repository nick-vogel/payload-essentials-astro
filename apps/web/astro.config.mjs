// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { fileURLToPath } from 'url'

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    resolve: {
      alias: {
        // The CMS config imports its own modules through the cms tsconfig's @/ path.
        '@': fileURLToPath(new URL('../cms/src', import.meta.url)),
        'next/cache': fileURLToPath(new URL('./src/stubs/next-cache.ts', import.meta.url)),
      },
    },
  },
})
