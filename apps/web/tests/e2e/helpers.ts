import type { Locator, Page } from '@playwright/test'

// The absolute URL of every image and srcset candidate on the page, or inside the given element.
export function imageURLs(page: Page, within: Locator = page.locator(':root')) {
  return within.evaluate((root) => {
    const candidates = [...root.querySelectorAll('img, source')].flatMap((element) => [
      element.getAttribute('src'),
      ...(element.getAttribute('srcset') ?? '').split(',').map((entry) => entry.trim().split(/\s+/)[0]),
    ])
    return [...new Set(candidates.filter(Boolean).map((url) => new URL(url!, location.href).href))]
  })
}

// Reads the content of a meta tag in the head by its name or property.
export function headMeta(page: Page) {
  const head = page.locator('head')
  return (attribute: 'name' | 'property', key: string) =>
    head.locator(`meta[${attribute}="${key}"]`).getAttribute('content')
}

// The section in the main landmark that holds the given heading.
export function sectionByHeading(page: Page, heading: string) {
  return page.getByRole('main').locator('section', { has: page.getByRole('heading', { name: heading, exact: true }) })
}

// The text of every script in the head that loads Google Tag Manager. Playwright's text filters skip
// script contents, so this reads them from the DOM.
export function gtmScripts(page: Page) {
  return page
    .locator('head script')
    .evaluateAll((scripts) =>
      scripts.map((script) => script.textContent ?? '').filter((text) => text.includes('googletagmanager.com/gtm.js')),
    )
}
