// The public URL of the CMS. The web app reads data through the Local API,
// but the browser loads media files from the CMS host.
// Only astro dev may fall back to localhost: it sets NODE_ENV to development before it loads the config.
// astro build and check set production, and the built server reads NODE_ENV and PAYLOAD_URL at runtime,
// so a build or a deploy without PAYLOAD_URL stops here instead of pointing media URLs at localhost.
if (!process.env.PAYLOAD_URL && process.env.NODE_ENV !== 'development') {
  throw new Error('Set PAYLOAD_URL to the public URL of the CMS. Only astro dev falls back to localhost:3000.')
}

export const payloadURL = new URL(process.env.PAYLOAD_URL || 'http://localhost:3000')
