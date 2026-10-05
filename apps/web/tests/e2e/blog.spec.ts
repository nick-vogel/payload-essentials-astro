import { expect, test, type Page } from '@playwright/test'

import { headMeta, imageURLs } from './helpers'

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
const RELEASES = [
  'A sitemap you can control',
  'Canonical URLs out of the box',
  'Blur placeholders while images load',
  'Image sizes for every screen',
]

// The section that holds the given heading.
function section(page: Page, heading: string) {
  return page.getByRole('main').locator('section', { has: page.getByRole('heading', { name: heading, exact: true }) })
}

// The titles of the cards in the grid, in order.
function gridTitles(page: Page) {
  return section(page, 'More posts').getByRole('article').getByRole('heading', { level: 3 })
}

const pagination = (page: Page) => page.getByRole('navigation', { name: 'Pagination' })

test.describe('the blog list', () => {
  test('lists the featured post and the first page of the other posts', async ({ page }) => {
    const response = await page.goto('/blog')
    expect(response?.status()).toBe(200)

    await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
    const featured = section(page, 'Featured post')
    await expect(featured.getByRole('heading', { level: 3, name: FEATURED })).toBeVisible()
    await expect(featured.getByRole('link')).toHaveAttribute('href', '/blog/model-your-content-with-collections')

    await expect(gridTitles(page)).toHaveText(PAGE_ONE)
    await expect(section(page, 'More posts').getByRole('link', { name: /Office hours recap/ })).toHaveAttribute(
      'href',
      '/blog/office-hours-recap',
    )
    await expect(pagination(page).locator('[aria-current="page"]')).toHaveText('1')
  })

  test('moves to page 2 with the pagination links, and back', async ({ page }) => {
    await page.goto('/blog')

    await pagination(page).getByRole('link', { name: '2', exact: true }).click()
    await expect(page).toHaveURL('/blog?page=2')
    await expect(gridTitles(page)).toHaveText(PAGE_TWO)
    await expect(pagination(page).locator('[aria-current="page"]')).toHaveText('2')
    // The featured post stays above the grid on every page.
    await expect(section(page, 'Featured post').getByRole('heading', { name: FEATURED })).toBeVisible()

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
    })
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
    await expect(section(page, 'More posts')).toContainText('No posts in this category yet.')
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
