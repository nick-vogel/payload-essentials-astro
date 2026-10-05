// Exists only for the #3 deploy spike, to record whether the web app reaches
// the CMS over localhost. The port removes it.
import type { APIRoute } from 'astro'

export const GET = (async () => {
  const base = process.env.PAYLOAD_URL
  const url = base ? `${base}/api/posts?limit=1` : null
  let result: { status: number } | { error: string }

  if (!url) {
    result = { error: 'PAYLOAD_URL is not set' }
  } else {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
      result = { status: res.status }
    } catch (err) {
      const cause = err instanceof Error && err.cause instanceof Error ? `: ${err.cause.message}` : ''
      result = { error: err instanceof Error ? `${err.message}${cause}` : String(err) }
    }
  }

  return new Response(JSON.stringify({ url, ...result }), {
    headers: { 'Content-Type': 'application/json' },
  })
}) satisfies APIRoute
