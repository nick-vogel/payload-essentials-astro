import { expect, test } from '@playwright/test'

import { headMeta, imageURLs, sectionByHeading } from './helpers'

// Every expected value below comes from the seed in apps/cms/src/seed.

test.describe('pages at their slug', () => {
  test('the about page shows its Hero, Text and TextAndImage blocks', async ({ page }) => {
    const response = await page.goto('/about')
    expect(response?.status()).toBe(200)

    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 1, name: 'About the course' })).toBeVisible()
    await expect(sectionByHeading(page, 'Why Payload Essentials')).toContainText(
      'Payload Essentials teaches you to build a content managed site from an empty folder to a live deployment.',
    )

    const textAndImage = sectionByHeading(page, 'Learn by building')
    await expect(textAndImage).toContainText(
      'Each lesson adds one feature to this site, so you always have something that works.',
    )
    await expect(textAndImage.getByRole('img', { name: 'A forested mountain ridge wrapped in low cloud' })).toBeVisible()
    await expect(textAndImage.locator('[data-layout]')).toHaveAttribute('data-layout', 'left')
  })

  test('the contact page shows its Hero and Text blocks', async ({ page }) => {
    const response = await page.goto('/contact')
    expect(response?.status()).toBe(200)

    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 1, name: 'Get in touch' })).toBeVisible()
    await expect(main).toContainText(
      'Send a question about the course and we will get back to you within two working days.',
    )
  })

  // Only the home page has TextAndImage on the right and Cards in the seed, and it renders at the root.
  test('the home page shows its TextAndImage and Cards blocks', async ({ page }) => {
    await page.goto('/')

    const textAndImage = sectionByHeading(page, 'Everything in one admin panel')
    await expect(textAndImage).toContainText('Pages, posts, media and settings all live in one place')
    await expect(textAndImage.getByRole('img', { name: /^A wooden desk/ })).toBeVisible()
    await expect(textAndImage.locator('[data-layout]')).toHaveAttribute('data-layout', 'right')

    const cards = sectionByHeading(page, 'What you will learn').getByRole('article')
    await expect(cards).toHaveCount(3)
    for (const [index, { title, body, alt }] of [
      { title: 'Content modeling', body: 'Collections, fields and blocks.', alt: /^A wooden desk/ },
      { title: 'Access control', body: 'Who can read and change what.', alt: 'A forested mountain ridge wrapped in low cloud' },
      { title: 'Deployment', body: 'Ship the site and keep it running.', alt: 'Tall grass in a meadow, backlit by a low golden sun' },
    ].entries()) {
      const card = cards.nth(index)
      await expect(card.getByRole('heading', { level: 3, name: title })).toBeVisible()
      await expect(card).toContainText(body)
      await expect(card.getByRole('img', { name: alt })).toBeVisible()
    }
  })

  for (const path of ['/about', '/contact', '/']) {
    test(`serves every image URL on ${path}`, async ({ page, request }) => {
      await page.goto(path)

      const urls = await imageURLs(page)
      // At least the two logos in the navigation and the footer.
      expect(urls.length).toBeGreaterThanOrEqual(2)
      for (const url of urls) {
        const response = await request.get(url)
        expect(response.status(), url).toBe(200)
      }
    })
  }

  test('sends the home slug to the root, so the home page has one URL', async ({ request }) => {
    const response = await request.get('/home', { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe('/')
  })

  test('answers an unknown slug with the 404 page', async ({ page }) => {
    const response = await page.goto('/no-such-page')
    expect(response?.status()).toBe(404)

    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/')
    await expect(page).toHaveTitle('Page not found | Payload Essentials')
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  })

  test("puts the about page's own title, canonical, Open Graph and Twitter tags in the head", async ({
    page,
    request,
    baseURL,
  }) => {
    await page.goto('/about')
    const head = page.locator('head')
    const meta = headMeta(page)

    const title = 'About'
    // The about page has no description of its own, so the Settings default fills it.
    const description = 'Learn everything you need to get started with Payload.'
    const canonical = `${baseURL}/about`

    await expect(page).toHaveTitle(`${title} | Payload Essentials`)
    expect(await meta('name', 'description')).toBe(description)
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)

    expect(await meta('property', 'og:title')).toBe(title)
    expect(await meta('property', 'og:description')).toBe(description)
    expect(await meta('property', 'og:url')).toBe(canonical)
    const ogImage = await meta('property', 'og:image')
    // The about page's own featured image, the mountain, not the meadow of the home page.
    expect(ogImage).toMatch(/^https?:\/\/.*\/360-picsum-photos[^/]*\.webp$/)
    expect((await request.get(ogImage!)).status()).toBe(200)

    expect(await meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(await meta('name', 'twitter:title')).toBe(title)
    expect(await meta('name', 'twitter:description')).toBe(description)
    expect(await meta('name', 'twitter:image')).toBe(ogImage)
  })
})
