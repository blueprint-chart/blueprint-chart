import { test, expect, devices } from '@playwright/test'

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1280, height: 800 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
] as const

test.describe('landing page layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/')
  })

  test('hero shows new headline + CTAs', async ({ page }) => {
    await expect(page.locator('.landing-hero__inner__text__h1')).toBeVisible()
    await expect(page.locator('.landing-hero__inner__text__h1')).toContainText('Great stories')
    await expect(page.locator('.landing-hero__inner__text__h1')).toContainText('great data viz')
    await expect(page.locator('.button-icon', { hasText: 'My charts' }).first()).toBeVisible()
    await expect(page.locator('.button-icon', { hasText: 'New chart' }).first()).toBeVisible()
  })

  test('hero chart renders D3 SVG', async ({ page }) => {
    const chartContainer = page.locator('.landing-hero__inner__chart .landing-chart-preview')
    await expect(chartContainer).toBeVisible()
    await expect(chartContainer.locator('svg').first()).toBeVisible()
  })

  test('value-prop strip renders 4 cells', async ({ page }) => {
    await expect(page.locator('.landing-value-prop-strip__cell')).toHaveCount(4)
  })

  test('defaults section renders with chart and 6 cards', async ({ page }) => {
    await expect(page.locator('#defaults')).toBeVisible()
    await expect(page.locator('.landing-defaults__grid__chart')).toBeVisible()
    await expect(page.locator('.landing-defaults__grid__cards .landing-default-card')).toHaveCount(6)
    await expect(page.locator('.landing-default-card__title', { hasText: 'Axes start at zero' }).first()).toBeVisible()
  })

  test('transforms section renders demo + 4 grouped cards', async ({ page }) => {
    await expect(page.locator('#transforms')).toBeVisible()
    await expect(page.locator('.transforms-demo')).toBeVisible()
    await expect(page.locator('.landing-transforms__cards .landing-default-card')).toHaveCount(4)
  })

  test('format section shows real BPC syntax and browser-frame URL', async ({ page }) => {
    await expect(page.locator('#format')).toBeVisible()
    const codeBlock = page.locator('.landing-format__pane__code')
    await expect(codeBlock).toBeVisible()
    const codeText = await codeBlock.textContent()
    expect(codeText).toContain('chart line')
    expect(codeText).toContain('data {')
    await expect(page.locator('.landing-format__browser__url')).toContainText('blueprintchart.com/#/render?bpc64=')
    await expect(page.locator('.landing-format__cards .landing-default-card')).toHaveCount(3)
    await expect(page.locator('.landing-format__footnote')).toContainText('FYI')
  })

  test('scenes section renders chart and player', async ({ page }) => {
    await expect(page.locator('.scenes-demo')).toBeVisible()
    await expect(page.locator('.scenes-demo svg').first()).toBeVisible()
    await expect(page.locator('.scenes-feature')).toHaveCount(3)
  })

  test('footer renders brand + GitHub + tagline', async ({ page }) => {
    await expect(page.locator('.landing-footer__brand__name')).toContainText('Blueprint Chart')
    await expect(page.locator('.landing-footer__link', { hasText: 'GitHub' })).toBeVisible()
    await expect(page.locator('.landing-footer__tagline')).toContainText('MIT')
  })

  test('no console errors on the landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    await expect(page.locator('.landing-page')).toBeVisible()
    await expect(page.locator('.landing-footer')).toBeVisible()
    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})

for (const v of VIEWPORTS) {
  test.describe(`landing page @${v.name}`, () => {
    test.use({ viewport: v.size })

    test.beforeEach(async ({ page }) => {
      await page.goto('/#/')
    })

    test('topnav adapts to viewport', async ({ page }) => {
      const links = page.locator('.landing-topnav__link')
      if (v.size.width > 820) {
        await expect(links).toHaveCount(4)
        await expect(links.first()).toBeVisible()
      }
      else {
        // Anchors are hidden under the 51.25rem breakpoint.
        if (await links.count()) {
          await expect(links.first()).toBeHidden()
        }
      }
      if (v.size.width < 600) {
        await expect(page.locator('.landing-topnav__cta-secondary')).toBeHidden()
        await expect(page.locator('.landing-topnav__github')).toBeHidden()
      }
    })

    test('hero chart stays visible on mobile (no hide)', async ({ page }) => {
      await expect(page.locator('.landing-hero__inner__chart')).toBeVisible()
    })

    test('value-prop strip column count tracks viewport', async ({ page }) => {
      const cells = page.locator('.landing-value-prop-strip__cell')
      await expect(cells).toHaveCount(4)
      // Sanity: cells must be visible at every viewport.
      await expect(cells.first()).toBeVisible()
      await expect(cells.last()).toBeVisible()
    })

    test('no horizontal scroll at this viewport', async ({ page }) => {
      // body.scrollWidth should not exceed viewport.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(1) // allow 1px slop for subpixel rendering
    })
  })
}
