import type { Page } from '@playwright/test'

// The absolute URL of every image and srcset candidate on the page.
export function imageURLs(page: Page) {
  return page.evaluate(() => {
    const candidates = [...document.querySelectorAll('img, source')].flatMap((element) => [
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
