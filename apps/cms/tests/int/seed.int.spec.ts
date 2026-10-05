// @vitest-environment node
import fs from 'fs'
import path from 'path'
import { createLocalReq, type Payload } from 'payload'
import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrations } from '@/migrations'
import { seed } from '@/seed'
import { getServerSideURL } from '@/utilities/getUrl'

// The seed needs an empty database, so this file runs on a throwaway one.
// The postgres adapter creates it on connect, and afterAll drops it.
const laneURL = new URL(process.env.DATABASE_URL!)
const testURL = new URL(laneURL)
testURL.pathname = `${laneURL.pathname}-seed-test-${process.pid}`
process.env.DATABASE_URL = testURL.toString()

describe('seed', () => {
  let payload: Payload

  beforeAll(async () => {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    await payload.db.migrate({ migrations })
    await seed({ payload, admin: { email: 'seed-test@example.com', password: 'seed-test' } })
  }, 120_000)

  afterAll(async () => {
    if (!payload) return
    // Dropping the database leaves the uploads behind, so remove them from staticDir first.
    const staticDir = payload.collections.media.config.upload.staticDir
    const { docs } = await payload.find({ collection: 'media', limit: 0, depth: 0 })
    for (const media of docs) {
      const filenames = [media.filename, ...Object.values(media.sizes ?? {}).map((size) => size?.filename)]
      for (const filename of filenames) if (filename) fs.rmSync(path.join(staticDir, filename), { force: true })
    }
    // The adapter never releases its first pool client, so FORCE closes the open connections.
    // Those connections then emit errors that would fail the run.
    const { pg, pool } = payload.db as PostgresAdapter
    pool.on('error', () => {})
    const client = new pg.Client({ connectionString: laneURL.toString() })
    await client.connect()
    await client.query(`DROP DATABASE IF EXISTS "${testURL.pathname.slice(1)}" WITH (FORCE)`)
    await client.end()
  })

  it('creates the expected number of documents in each collection', async () => {
    const expected = { users: 1, media: 5, categories: 3, pages: 4, posts: 12 } as const
    const actual: Record<string, number> = {}
    for (const collection of Object.keys(expected) as (keyof typeof expected)[]) {
      actual[collection] = (await payload.count({ collection })).totalDocs
    }
    expect(actual).toEqual(expected)
  })

  it('sets both globals', async () => {
    const settings = await payload.findGlobal({ slug: 'settings', depth: 1 })
    expect(settings.siteName).toBeTruthy()
    expect(settings.gtmCode).toMatch(/^GTM-/)
    expect(settings.logoColor).toHaveProperty('url')
    expect(settings.logoWhite).toHaveProperty('url')

    const nav = await payload.findGlobal({ slug: 'nav', depth: 1 })
    expect(nav.navItems?.length).toBeGreaterThan(0)
    for (const item of nav.navItems ?? []) expect(item.link).toHaveProperty('slug')
  })

  it('creates the pages the front end routes to', async () => {
    const { docs } = await payload.find({ collection: 'pages', limit: 0, depth: 0 })
    expect(docs.map((page) => page.slug)).toEqual(expect.arrayContaining(['home', 'blog']))
  })

  it('writes each canonical URL at the path the web app serves', async () => {
    const base = getServerSideURL()
    const pages = await payload.find({ collection: 'pages', limit: 0, depth: 0 })
    const posts = await payload.find({ collection: 'posts', limit: 0, depth: 0 })
    for (const page of pages.docs) {
      expect(page.meta?.canonicalUrl).toBe(page.slug === 'home' ? `${base}/` : `${base}/${page.slug}`)
    }
    for (const post of posts.docs) expect(post.meta?.canonicalUrl).toBe(`${base}/blog/${post.slug}`)
  })

  it('features exactly one post and gives every post its own date', async () => {
    const { docs } = await payload.find({ collection: 'posts', limit: 0, depth: 0 })
    expect(docs.filter((post) => post.featured)).toHaveLength(1)
    expect(new Set(docs.map((post) => post.date)).size).toBe(docs.length)
  })

  it('gives one post every rich text node the front end renders', async () => {
    const { docs } = await payload.find({ collection: 'posts', limit: 0, depth: 0 })
    const nodeKinds = (post: (typeof docs)[number]) => {
      const kinds = new Set<string>()
      const walk = (nodes: { type: string; children?: unknown; fields?: { blockType?: string } }[]) => {
        for (const node of nodes) {
          kinds.add(node.type === 'block' ? `block:${node.fields?.blockType}` : node.type)
          if (Array.isArray(node.children)) walk(node.children)
        }
      }
      walk(post.body.root.children)
      return kinds
    }
    expect(
      docs.some((post) =>
        ['upload', 'link', 'block:cards', 'block:textAndImage'].every((kind) => nodeKinds(post).has(kind)),
      ),
    ).toBe(true)
  })

  it('writes every media file and its image sizes to staticDir', async () => {
    const staticDir = payload.collections.media.config.upload.staticDir
    const { docs } = await payload.find({ collection: 'media', limit: 0, depth: 0 })
    for (const media of docs) {
      expect(media.url).toBe(`/api/media/file/${media.filename}`)
      expect(fs.existsSync(path.join(staticDir, media.filename!))).toBe(true)
      for (const size of Object.values(media.sizes ?? {})) {
        if (size?.filename) expect(fs.existsSync(path.join(staticDir, size.filename))).toBe(true)
      }
    }
  })

  // A Local API save from a script or the web app has no Next.js request around it.
  it('saves a page, a post and both globals outside a Next.js request', async () => {
    const req = await createLocalReq({}, payload)
    const [page] = (await payload.find({ collection: 'pages', limit: 1, depth: 0, req })).docs
    const [post] = (await payload.find({ collection: 'posts', limit: 1, depth: 0, req })).docs
    const { siteName } = await payload.findGlobal({ slug: 'settings', depth: 0, req })
    const { navItems } = await payload.findGlobal({ slug: 'nav', depth: 0, req })

    // Each save writes back the values the document already has, so later tests see the seeded data.
    await expect(
      payload.update({ collection: 'pages', id: page.id, data: { title: page.title }, depth: 0, req }),
    ).resolves.toMatchObject({ title: page.title })
    await expect(
      payload.update({ collection: 'posts', id: post.id, data: { title: post.title }, depth: 0, req }),
    ).resolves.toMatchObject({ title: post.title })
    await expect(
      payload.updateGlobal({ slug: 'settings', data: { siteName }, depth: 0, req }),
    ).resolves.toMatchObject({ siteName })
    await expect(
      payload.updateGlobal({ slug: 'nav', data: { navItems }, depth: 0, req }),
    ).resolves.toMatchObject({ navItems })
  })

  // The admin form sends the stored canonical URL back unchanged with a new slug.
  it('moves a generated canonical URL with its slug and leaves a custom one alone', async () => {
    const req = await createLocalReq({}, payload)
    const base = getServerSideURL()
    const [{ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, slug: _slug, meta: _meta, ...post }] = (
      await payload.find({ collection: 'posts', limit: 1, depth: 0, req })
    ).docs
    const create = (newSlug: string, canonicalUrl?: string) =>
      payload.create({
        collection: 'posts',
        data: { ...post, featured: false, date: new Date().toISOString(), slug: newSlug, meta: { canonicalUrl } },
        depth: 0,
        req,
      })
    const rename = (doc: { id: string; meta?: { canonicalUrl?: string | null } }, newSlug: string) =>
      payload.update({ collection: 'posts', id: doc.id, data: { slug: newSlug, meta: doc.meta }, depth: 0, req })

    const generated = await create('canonical-generated')
    const custom = await create('canonical-custom', 'https://example.com/elsewhere')
    try {
      expect(generated.meta?.canonicalUrl).toBe(`${base}/blog/canonical-generated`)
      expect((await rename(generated, 'canonical-renamed')).meta?.canonicalUrl).toBe(`${base}/blog/canonical-renamed`)
      expect((await rename(custom, 'canonical-custom-renamed')).meta?.canonicalUrl).toBe('https://example.com/elsewhere')
    } finally {
      await payload.delete({ collection: 'posts', where: { id: { in: [generated.id, custom.id] } }, req })
    }
  })

  it('refuses to run on a database that already has content', async () => {
    await expect(
      seed({ payload, admin: { email: 'seed-test-2@example.com', password: 'seed-test' } }),
    ).rejects.toThrow(/not empty/)
  })
})
