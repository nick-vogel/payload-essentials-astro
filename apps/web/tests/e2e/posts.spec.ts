import { expect, test, type Page } from '@playwright/test'

import { headMeta, imageURLs } from './helpers'

// Every expected value below comes from the seed in apps/cms/src/seed.

// The seeded posts in date order, a week apart, four to a category.
const posts = [
  { slug: 'model-your-content-with-collections', title: 'Model your content with collections', summary: 'Collections are the backbone of a Payload project. Here is how to plan them.' },
  { slug: 'reuse-layouts-with-blocks', title: 'Reuse layouts with blocks', summary: 'Blocks let editors build pages from parts you design once.' },
  { slug: 'lock-down-data-with-access-control', title: 'Lock down data with access control', summary: 'Access functions decide who can read and change each document.' },
  { slug: 'run-side-effects-with-hooks', title: 'Run side effects with hooks', summary: 'Hooks run your code at each step of a document lifecycle.' },
  { slug: 'image-sizes-for-every-screen', title: 'Image sizes for every screen', summary: 'Each upload now comes with thumbnail, card, full size and social sharing versions.' },
  { slug: 'blur-placeholders-while-images-load', title: 'Blur placeholders while images load', summary: 'Every image gets a tiny blurred preview so pages never jump while they load.' },
  { slug: 'canonical-urls-out-of-the-box', title: 'Canonical URLs out of the box', summary: 'Pages and posts now fill in their own canonical URL when you save them.' },
  { slug: 'a-sitemap-you-can-control', title: 'A sitemap you can control', summary: 'Pick which pages and posts appear in the sitemap with one checkbox.' },
  { slug: 'questions-from-the-first-cohort', title: 'Questions from the first cohort', summary: 'The most common questions from the first group of students, with answers.' },
  { slug: 'projects-built-by-students', title: 'Projects built by students', summary: 'A tour of sites that students shipped after finishing the course.' },
  { slug: 'how-to-ask-for-help', title: 'How to ask for help', summary: 'Get a faster answer by sharing the right details up front.' },
  { slug: 'office-hours-recap', title: 'Office hours recap', summary: 'Notes from the latest live session, from schema design to deployment.' },
]

// The post body, named by the post's h1.
function body(page: Page, title: string) {
  return page.getByRole('main').getByRole('article', { name: title, exact: true })
}

test.describe('posts at /blog/<slug>', () => {
  for (const { slug, title, summary } of posts) {
    test(`serves ${slug} with its body`, async ({ page }) => {
      const response = await page.goto(`/blog/${slug}`)
      expect(response?.status()).toBe(200)

      await expect(page.getByRole('main').getByRole('heading', { level: 1, name: title })).toBeVisible()
      const article = body(page, title)
      await expect(article).toContainText(summary)
      await expect(article.getByRole('heading', { name: 'Where to go next' })).toBeVisible()
    })
  }

  // Every post body holds an upload and two internal links. The first post also holds two blocks.
  test('renders the upload and the internal links in the body', async ({ page }) => {
    const { slug, title } = posts[0]
    await page.goto(`/blog/${slug}`)
    const article = body(page, title)

    // An even post holds the meadow.
    await expect(article.getByRole('img', { name: 'Tall grass in a meadow, backlit by a low golden sun' })).toBeVisible()
    await expect(article.getByRole('link', { name: 'about the course' })).toHaveAttribute('href', '/about')
    await expect(article.getByRole('link', { name: 'ask us a question' })).toHaveAttribute('href', '/contact')
    await expect(article).not.toContainText('unknown node')
  })

  test('renders the mountain upload in an odd post', async ({ page }) => {
    const { slug, title } = posts[1]
    await page.goto(`/blog/${slug}`)

    await expect(
      body(page, title).getByRole('img', { name: 'A forested mountain ridge wrapped in low cloud' }),
    ).toBeVisible()
  })

  for (const { slug } of [posts[0], posts[1]]) {
    test(`serves every image URL on /blog/${slug}`, async ({ page, request }) => {
      await page.goto(`/blog/${slug}`)

      const urls = await imageURLs(page)
      // The two logos and the featured image at least. The first post's body upload is its featured
      // image too, so the two share one URL.
      expect(urls.length).toBeGreaterThanOrEqual(3)
      for (const url of urls) {
        const response = await request.get(url)
        expect(response.status(), url).toBe(200)
      }
    })
  }

  // The previous and next links follow the post dates, across categories.
  function postNavigation(page: Page) {
    return page.getByRole('navigation', { name: 'Post navigation' })
  }

  test('links a middle post to the post before and the post after it', async ({ page }) => {
    const [previous, current, next] = posts.slice(4, 7)
    await page.goto(`/blog/${current.slug}`)

    const nav = postNavigation(page)
    await expect(nav.getByRole('link', { name: `Previous post: ${previous.title}` })).toHaveAttribute(
      'href',
      `/blog/${previous.slug}`,
    )
    await expect(nav.getByRole('link', { name: `Next post: ${next.title}` })).toHaveAttribute('href', `/blog/${next.slug}`)
  })

  test('gives the first post a next link only', async ({ page }) => {
    await page.goto(`/blog/${posts[0].slug}`)

    const nav = postNavigation(page)
    await expect(nav.getByRole('link')).toHaveCount(1)
    await expect(nav.getByRole('link', { name: `Next post: ${posts[1].title}` })).toBeVisible()
  })

  test('gives the last post a previous link only', async ({ page }) => {
    await page.goto(`/blog/${posts[11].slug}`)

    const nav = postNavigation(page)
    await expect(nav.getByRole('link')).toHaveCount(1)
    await expect(nav.getByRole('link', { name: `Previous post: ${posts[10].title}` })).toBeVisible()
  })

  test('shows the other posts in the same category, newest first', async ({ page }) => {
    // Image sizes for every screen is a release. The other three releases follow it in date order.
    const [current, ...others] = posts.slice(4, 8)
    await page.goto(`/blog/${current.slug}`)

    const related = page
      .getByRole('main')
      .locator('section', { has: page.getByRole('heading', { name: 'Related Posts', exact: true }) })
    const cards = related.getByRole('article')
    await expect(cards).toHaveCount(3)
    for (const [index, { slug, title }] of others.reverse().entries()) {
      const card = cards.nth(index)
      await expect(card.getByRole('heading', { level: 3, name: title })).toBeVisible()
      await expect(related.getByRole('link').nth(index)).toHaveAttribute('href', `/blog/${slug}`)
    }
  })

  test('answers an unknown post slug with the 404 page', async ({ page }) => {
    const response = await page.goto('/blog/no-such-post')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
  })

  test("puts the post's own title, canonical, Open Graph and Twitter tags in the head", async ({
    page,
    request,
    baseURL,
  }) => {
    const { slug, title, summary } = posts[4]
    await page.goto(`/blog/${slug}`)
    const head = page.locator('head')
    const meta = headMeta(page)

    // The post has no SEO fields of its own, so its title and summary fill them.
    const canonical = `${baseURL}/blog/${slug}`

    await expect(page).toHaveTitle(`${title} | Payload Essentials`)
    expect(await meta('name', 'description')).toBe(summary)
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)

    expect(await meta('property', 'og:type')).toBe('article')
    expect(await meta('property', 'og:title')).toBe(title)
    expect(await meta('property', 'og:description')).toBe(summary)
    expect(await meta('property', 'og:url')).toBe(canonical)
    const ogImage = await meta('property', 'og:image')
    // The fifth post's featured image, the desk.
    expect(ogImage).toMatch(/^https?:\/\/.*\/320[^/]*\.webp$/)
    expect((await request.get(ogImage!)).status()).toBe(200)
    expect(await meta('property', 'article:published_time')).toBe('2026-02-02T14:00:00.000Z')
    expect(await meta('property', 'article:author')).toBe('Admin')
    expect(await meta('property', 'article:section')).toBe('Releases')

    expect(await meta('name', 'twitter:card')).toBe('summary_large_image')
    expect(await meta('name', 'twitter:title')).toBe(title)
    expect(await meta('name', 'twitter:description')).toBe(summary)
    expect(await meta('name', 'twitter:image')).toBe(ogImage)
  })
})
