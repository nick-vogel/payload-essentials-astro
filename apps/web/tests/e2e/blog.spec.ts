import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

import { headMeta, imageURLs, sectionByHeading } from './helpers'

// Every expected value below comes from the seed in apps/cms/src/seed. The seed dates its 12 posts a
// week apart in seed order and features the oldest, so the grid lists the other 11 newest first.
const FEATURED = 'Model your content with collections'
const PAGE_ONE = [
  'Office hours recap',
  'How to ask for help',
  'Projects built by students',
  'Questions from the first cohort',
  'A sitemap you can control',
  'Canonical URLs out of the box',
  'Blur placeholders while images load',
  'Image sizes for every screen',
]
const PAGE_TWO = ['Run side effects with hooks', 'Lock down data with access control', 'Reuse layouts with blocks']
// With no post featured, the latest post takes its place above the grid, and the oldest joins the grid.
const UNFEATURED_PAGE_ONE = [
  'How to ask for help',
  'Projects built by students',
  'Questions from the first cohort',
  'A sitemap you can control',
  'Canonical URLs out of the box',
  'Blur placeholders while images load',
  'Image sizes for every screen',
  'Run side effects with hooks',
]
const UNFEATURED_PAGE_TWO = ['Lock down data with access control', 'Reuse layouts with blocks', FEATURED]
const RELEASES = [
  'A sitemap you can control',
  'Canonical URLs out of the box',
  'Blur placeholders while images load',
  'Image sizes for every screen',
]

// The titles of the cards in the grid, in order.
function gridTitles(page: Page) {
  return sectionByHeading(page, 'More posts').getByRole('article').getByRole('heading', { level: 3 })
}

const pagination = (page: Page) => page.getByRole('navigation', { name: 'Pagination' })

test.describe('the blog list', () => {
  test('lists the featured post and the first page of the other posts', async ({ page }) => {
    const response = await page.goto('/blog')
    expect(response?.status()).toBe(200)

    await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
    const featured = sectionByHeading(page, 'Featured post')
    await expect(featured.getByRole('heading', { level: 3, name: FEATURED })).toBeVisible()
    await expect(featured.getByRole('link')).toHaveAttribute('href', '/blog/model-your-content-with-collections')

    await expect(gridTitles(page)).toHaveText(PAGE_ONE)
    await expect(
      sectionByHeading(page, 'More posts').getByRole('link', { name: /Office hours recap/ }),
    ).toHaveAttribute('href', '/blog/office-hours-recap')
    await expect(pagination(page).locator('[aria-current="page"]')).toHaveText('1')
  })

  test('moves to page 2 with the pagination links, and back', async ({ page }) => {
    await page.goto('/blog')

    await pagination(page).getByRole('link', { name: '2', exact: true }).click()
    await expect(page).toHaveURL('/blog?page=2')
    await expect(gridTitles(page)).toHaveText(PAGE_TWO)
    await expect(pagination(page).locator('[aria-current="page"]')).toHaveText('2')
    // The featured post stays above the grid on every page.
    await expect(sectionByHeading(page, 'Featured post').getByRole('heading', { name: FEATURED })).toBeVisible()

    await pagination(page).getByRole('link', { name: 'Previous page' }).click()
    await expect(page).toHaveURL('/blog')
    await expect(gridTitles(page)).toHaveText(PAGE_ONE)
  })

  test('offers every category with a post besides the featured post', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByLabel('Category').locator('option')).toHaveText([
      'All categories',
      'Community',
      'Guides',
      'Releases',
    ])
  })

  test('narrows the list to a category as soon as one is picked', async ({ page }) => {
    await page.goto('/blog')

    await page.getByLabel('Category').selectOption('releases')
    await expect(page).toHaveURL('/blog?category=releases')
    await expect(gridTitles(page)).toHaveText(RELEASES)
    await expect(page.getByLabel('Category')).toHaveValue('releases')
    // Four posts fit on one page.
    await expect(pagination(page)).toHaveCount(0)

    // The featured post is in Guides, so the grid leaves it out there too.
    await page.getByLabel('Category').selectOption('guides')
    await expect(page).toHaveURL('/blog?category=guides')
    await expect(gridTitles(page)).toHaveText(PAGE_TWO)

    await page.getByLabel('Category').selectOption('')
    await expect(page).toHaveURL('/blog')
    await expect(gridTitles(page)).toHaveText(PAGE_ONE)
  })

  test.describe('with JavaScript disabled', () => {
    test.use({ javaScriptEnabled: false })

    test('narrows the list when the filter form is submitted', async ({ page }) => {
      await page.goto('/blog')

      await page.getByLabel('Category').selectOption('releases')
      await page.getByRole('button', { name: 'Filter' }).click()
      await expect(page).toHaveURL('/blog?category=releases')
      await expect(gridTitles(page)).toHaveText(RELEASES)

      // The form submits an empty category, which the page redirects to the bare URL.
      await page.getByLabel('Category').selectOption('')
      await page.getByRole('button', { name: 'Filter' }).click()
      await expect(page).toHaveURL('/blog')
      await expect(gridTitles(page)).toHaveText(PAGE_ONE)
    })
  })

  test('redirects an empty category to the same page without it', async ({ request }) => {
    for (const [path, location] of [
      ['/blog?category=', '/blog'],
      ['/blog?category=&page=2', '/blog?page=2'],
    ]) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), path).toBe(302)
      expect(response.headers().location, path).toBe(location)
    }
  })

  test('answers a page past the last one, or a page that is not a number, with the 404 page', async ({ page }) => {
    expect((await page.goto('/blog?page=3'))?.status()).toBe(404)
    expect((await page.goto('/blog?page=two'))?.status()).toBe(404)
    expect((await page.goto('/blog?page=0'))?.status()).toBe(404)
  })

  test('says so when a category has no other posts', async ({ page }) => {
    const response = await page.goto('/blog?category=no-such-category')
    expect(response?.status()).toBe(200)
    await expect(gridTitles(page)).toHaveCount(0)
    await expect(sectionByHeading(page, 'More posts')).toContainText('No posts in this category yet.')
  })

  test("puts the blog page's own title, canonical, Open Graph and Twitter tags in the head", async ({
    page,
    request,
    baseURL,
  }) => {
    await page.goto('/blog')
    const meta = headMeta(page)

    const title = 'Blog'
    // The blog page has no description of its own, so the Settings default fills it.
    const description = 'Learn everything you need to get started with Payload.'
    const canonical = `${baseURL}/blog`

    await expect(page).toHaveTitle(`${title} | Payload Essentials`)
    expect(await meta('name', 'description')).toBe(description)
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', canonical)

    expect(await meta('property', 'og:title')).toBe(title)
    expect(await meta('property', 'og:description')).toBe(description)
    expect(await meta('property', 'og:url')).toBe(canonical)
    const ogImage = await meta('property', 'og:image')
    // The blog page's own featured image, the desk.
    expect(ogImage).toMatch(/^https?:\/\/.*\/320[^/]*\.webp$/)
    expect((await request.get(ogImage!)).status()).toBe(200)

    expect(await meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(await meta('name', 'twitter:title')).toBe(title)
    expect(await meta('name', 'twitter:description')).toBe(description)
    expect(await meta('name', 'twitter:image')).toBe(ogImage)
  })

  for (const path of ['/blog', '/blog?page=2']) {
    test(`serves every image URL on ${path}`, async ({ page, request }) => {
      await page.goto(path)

      const urls = await imageURLs(page)
      // The two logos, the featured post and at least one card.
      expect(urls.length).toBeGreaterThanOrEqual(4)
      for (const url of urls) {
        const response = await request.get(url)
        expect(response.status(), url).toBe(200)
      }
    })
  }
})

// Logs in to the CMS REST API as the seeded admin, finds the seeded featured post and updates it.
async function editFeaturedPost(request: APIRequestContext) {
  // Mirrors playwright.config.ts, which also sets the seeded admin's credentials in process.env.
  const cmsURL = `http://127.0.0.1:${process.env.E2E_CMS_PORT || 3100}`
  const login = await request.post(`${cmsURL}/api/users/login`, {
    data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD },
  })
  expect(login.ok()).toBe(true)
  const headers = { Authorization: `JWT ${(await login.json()).token}` }

  const found = await request.get(`${cmsURL}/api/posts?where[slug][equals]=model-your-content-with-collections&depth=0`)
  const post: { id: string; category: string } = (await found.json()).docs[0]
  const update = (data: Record<string, unknown>) =>
    request.patch(`${cmsURL}/api/posts/${post.id}?depth=0`, { headers, data })

  return { cmsURL, headers, post, update }
}

// These tests change the featured post through the CMS REST API and put it back in a finally block.
// Other spec files run at the same time on the same database, but only /blog reads a post's featured
// flag or category, and only this file opens /blog. The sitemap in seo.spec.ts lists posts by slug,
// which stays the same, and only checks that lastmod is a date. The config does not set fullyParallel,
// so the rest of this file runs before these tests on the same worker. Serial keeps the two apart.
test.describe('the blog list after an editor changes the featured post', () => {
  test.describe.configure({ mode: 'serial' })

  test('leaves out a category whose only post is the featured post', async ({ page, request }) => {
    const { cmsURL, headers, post, update } = await editFeaturedPost(request)
    const created = await request.post(`${cmsURL}/api/categories`, {
      headers,
      data: { name: 'Featured only', slug: 'featured-only' },
    })
    expect(created.status()).toBe(201)
    const categoryID = (await created.json()).doc.id

    try {
      expect((await update({ category: categoryID })).status()).toBe(200)

      await page.goto('/blog')
      // The featured post shows its new category, so the move reached the page.
      await expect(sectionByHeading(page, 'Featured post')).toContainText('Featured only')
      await expect(page.getByLabel('Category').locator('option')).toHaveText([
        'All categories',
        'Community',
        'Guides',
        'Releases',
      ])
    } finally {
      // Soft, so a failed clean-up shows up next to the error that sent the test here, not in its place.
      expect.soft((await update({ category: post.category })).status()).toBe(200)
      expect.soft((await request.delete(`${cmsURL}/api/categories/${categoryID}`, { headers })).status()).toBe(200)
    }
  })

  test('shows the latest post above the grid when no post is featured', async ({ page, request }) => {
    const { update } = await editFeaturedPost(request)

    try {
      expect((await update({ featured: false })).status()).toBe(200)

      await page.goto('/blog')
      await expect(sectionByHeading(page, 'Featured post')).toHaveCount(0)
      const latest = sectionByHeading(page, 'Latest post')
      await expect(latest.getByRole('heading', { level: 3, name: 'Office hours recap' })).toBeVisible()
      // The grid leaves out the latest post instead, and the post that was featured joins it on page 2.
      await expect(gridTitles(page)).toHaveText(UNFEATURED_PAGE_ONE)

      await pagination(page).getByRole('link', { name: '2', exact: true }).click()
      await expect(page).toHaveURL('/blog?page=2')
      await expect(gridTitles(page)).toHaveText(UNFEATURED_PAGE_TWO)
      // The latest post stays above the grid on every page.
      await expect(latest.getByRole('heading', { level: 3, name: 'Office hours recap' })).toBeVisible()
    } finally {
      // The CMS allows one featured post, and this test unset the only one.
      expect.soft((await update({ featured: true })).status()).toBe(200)
    }
  })
})
