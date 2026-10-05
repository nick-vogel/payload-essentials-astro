import { expect, test } from '@playwright/test'

// Every expected value below comes from the seed in apps/cms/src/seed.
// The suite sets no SITE_URL, so the absolute URLs fall back to the request's own origin.
const pagePaths = ['/', '/blog', '/about', '/contact']
const postPaths = [
  'model-your-content-with-collections',
  'reuse-layouts-with-blocks',
  'lock-down-data-with-access-control',
  'run-side-effects-with-hooks',
  'image-sizes-for-every-screen',
  'blur-placeholders-while-images-load',
  'canonical-urls-out-of-the-box',
  'a-sitemap-you-can-control',
  'questions-from-the-first-cohort',
  'projects-built-by-students',
  'how-to-ask-for-help',
  'office-hours-recap',
].map((slug) => `/blog/${slug}`)

test.describe('sitemap.xml and robots.txt', () => {
  test('sitemap.xml lists every seeded page and post as valid XML', async ({ page, request, baseURL }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/xml')

    const xml = await response.text()
    const sitemap = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, 'application/xml')
      return {
        parseError: doc.querySelector('parsererror')?.textContent ?? null,
        namespace: doc.documentElement.namespaceURI,
        root: doc.documentElement.localName,
        urls: Array.from(doc.getElementsByTagName('url'), (url) => ({
          loc: url.getElementsByTagName('loc')[0]?.textContent,
          lastmod: url.getElementsByTagName('lastmod')[0]?.textContent,
        })),
      }
    }, xml)

    expect(sitemap.parseError).toBeNull()
    expect(sitemap.root).toBe('urlset')
    expect(sitemap.namespace).toBe('http://www.sitemaps.org/schemas/sitemap/0.9')

    const expected = [...pagePaths, ...postPaths].map((path) => `${baseURL}${path}`)
    expect(sitemap.urls.map(({ loc }) => loc).sort()).toEqual(expected.sort())
    for (const { lastmod } of sitemap.urls) {
      expect(Number.isNaN(Date.parse(lastmod ?? ''))).toBe(false)
    }
  })

  test('sitemap.xml leaves out a page whose editor unticked Add to sitemap', async ({ request, baseURL }) => {
    // Mirrors playwright.config.ts, which also sets the seeded admin's credentials in process.env.
    const cmsURL = `http://127.0.0.1:${process.env.E2E_CMS_PORT || 3100}`
    const login = await request.post(`${cmsURL}/api/users/login`, {
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
    })
    expect(login.ok()).toBe(true)
    const headers = { Authorization: `JWT ${(await login.json()).token}` }

    const media = await request.get(`${cmsURL}/api/media?limit=1&depth=0`)
    const featuredImage = (await media.json()).docs[0].id

    // A control page left in the sitemap proves a page created here does reach it.
    const created: string[] = []
    const createPage = async (slug: string, addToSitemap: boolean) => {
      const response = await request.post(`${cmsURL}/api/pages`, {
        headers,
        data: { title: slug, slug, featuredImage, meta: { addToSitemap } },
      })
      expect(response.status()).toBe(201)
      created.push((await response.json()).doc.id)
    }

    try {
      await createPage('sitemap-kept', true)
      await createPage('sitemap-opted-out', false)

      // Still a published page anyone can read, only kept out of the sitemap.
      const optedOut = await request.get(`${cmsURL}/api/pages?where[slug][equals]=sitemap-opted-out&depth=0`)
      expect((await optedOut.json()).docs).toHaveLength(1)

      const xml = await (await request.get('/sitemap.xml')).text()
      expect(xml).toContain(`<loc>${baseURL}/sitemap-kept</loc>`)
      expect(xml).not.toContain(`<loc>${baseURL}/sitemap-opted-out</loc>`)
    } finally {
      for (const id of created) {
        await request.delete(`${cmsURL}/api/pages/${id}`, { headers })
      }
    }
  })

  test('robots.txt allows crawlers and points at the sitemap', async ({ request, baseURL }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')

    const lines = (await response.text()).split('\n')
    expect(lines).toContain('User-agent: *')
    expect(lines).toContain('Allow: /')
    expect(lines).toContain(`Sitemap: ${baseURL}/sitemap.xml`)
  })
})
