import { expect, test } from '@playwright/test'

import { gtmScripts, headMeta, imageURLs } from './helpers'

// Every expected value below comes from the seed in apps/cms/src/seed.
test.describe('home page', () => {
  test('shows the seeded Hero and Text blocks, the navigation and the footer', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)

    const main = page.getByRole('main')
    await expect(main.getByRole('heading', { level: 1, name: 'Build a real site with Payload' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Blog', exact: true })).toHaveAttribute('href', '/blog')
    await expect(main.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('href', '/about')

    await expect(main.getByRole('heading', { level: 2, name: 'Start reading' })).toBeVisible()
    await expect(main.getByText('New posts land on the blog every week.')).toBeVisible()
    await expect(main.getByRole('link', { name: 'the blog' })).toHaveAttribute('href', '/blog')

    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(nav.getByRole('link', { name: 'Payload Essentials logo' })).toHaveAttribute('href', '/')
    for (const [name, href] of [
      ['Blog', '/blog'],
      ['About', '/about'],
      ['Contact', '/contact'],
    ]) {
      await expect(nav.getByRole('menuitem', { name })).toHaveAttribute('href', href)
    }

    const footer = page.getByRole('contentinfo')
    await expect(footer.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link')).toHaveText([
      'Blog',
      'About',
      'Contact',
    ])
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Nick Vogel. All rights reserved`)
  })

  test('serves every image URL on the page', async ({ page, request }) => {
    await page.goto('/')

    const urls = await imageURLs(page)

    // The hero image and the two logos in the navigation and the footer.
    expect(urls.length).toBeGreaterThanOrEqual(3)
    for (const url of urls) {
      const response = await request.get(url)
      expect(response.status(), url).toBe(200)
    }
  })

  // The seeded logo is a square icon. A logo sized by width alone grows as tall as it is wide.
  test('keeps both logos to a fixed height whatever the image shape', async ({ page }) => {
    await page.goto('/')

    const logos = [
      [page.getByRole('navigation', { name: 'Main navigation' }), 40],
      [page.getByRole('contentinfo'), 48],
    ] as const
    for (const [region, height] of logos) {
      const box = await region.getByRole('img', { name: 'Payload Essentials logo' }).boundingBox()
      expect(box?.height).toBe(height)
    }
  })

  test('opens the mobile menu, keeps focus inside it and closes it on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    // The only button in the navigation. Its name changes when the menu opens.
    const toggle = nav.getByRole('button')
    const blogLink = nav.getByRole('menuitem', { name: 'Blog' })
    await expect(toggle).toHaveAccessibleName('Open menu')
    await expect(blogLink).not.toBeInViewport()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAccessibleName('Close menu')
    await expect(blogLink).toBeInViewport()
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')

    // More presses than the menu has focusable elements, in both directions.
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let press = 0; press < 8; press++) {
        await page.keyboard.press(key)
        expect(await nav.evaluate((element) => element.contains(document.activeElement)), `${key} ${press}`).toBe(true)
      }
    }

    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    // Focus returns to the button that opened the menu, so keyboard users keep their place.
    await expect(toggle).toBeFocused()
    await expect(toggle).toHaveAccessibleName('Open menu')
    await expect(blogLink).not.toBeInViewport()
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden')
  })

  test('puts the title, description, canonical, Open Graph, Twitter and GTM tags in the head', async ({
    page,
    request,
    baseURL,
  }) => {
    await page.goto('/')
    const head = page.locator('head')
    const meta = headMeta(page)

    const title = 'Home'
    const description = 'Learn everything you need to get started with Payload.'
    const canonical = `${baseURL}/`

    await expect(page).toHaveTitle(`${title} | Payload Essentials`)
    expect(await meta('name', 'description')).toBe(description)
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
    await expect(head.locator('link[rel="icon"]')).toHaveCount(2)

    expect(await meta('property', 'og:title')).toBe(title)
    expect(await meta('property', 'og:description')).toBe(description)
    expect(await meta('property', 'og:url')).toBe(canonical)
    expect(await meta('property', 'og:site_name')).toBe('Payload Essentials')
    expect(await meta('property', 'og:locale')).toBe('en_US')
    expect(await meta('property', 'og:type')).toBe('website')
    const ogImage = await meta('property', 'og:image')
    expect(ogImage).toMatch(/^https?:\/\//)
    expect((await request.get(ogImage!)).status()).toBe(200)

    expect(await meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(await meta('name', 'twitter:title')).toBe(title)
    expect(await meta('name', 'twitter:description')).toBe(description)
    expect(await meta('name', 'twitter:image')).toBe(ogImage)

    // The GTM container ID is the site settings' seeded gtmCode.
    const gtm = await gtmScripts(page)
    expect(gtm).toHaveLength(1)
    expect(gtm[0]).toContain('GTM-XXXXXXX')
  })
})
