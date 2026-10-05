// The public URL of the CMS. The web app reads data through the Local API,
// but the browser loads media files from the CMS host.
export const payloadURL = new URL(process.env.PAYLOAD_URL || 'http://localhost:3000')
