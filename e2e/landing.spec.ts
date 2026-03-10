import { test, expect } from '@playwright/test'

test.describe('landing page layout', () => {
  test('page renders with correct structure', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/landing-viewport.png' })
    await page.screenshot({ path: 'test-results/landing-full.png', fullPage: true })

    // Navbar should be visible with brand
    await expect(page.locator('.bc-brand-gradient')).toBeVisible()

    // Landing page sections should render
    await expect(page.locator('.landing-page')).toBeVisible()
  })

  test('navbar shows anchor links on landing page', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    const anchors = page.locator('.shell-navbar__anchors a')
    await expect(anchors).toHaveCount(5)
    await expect(anchors.nth(0)).toContainText('Features')
    await expect(anchors.nth(1)).toContainText('Transforms')
    await expect(anchors.nth(2)).toContainText('BPC Format')
  })

  test('hero section renders heading and CTA', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    await expect(page.locator('.landing-hero__h1')).toBeVisible()
    await expect(page.locator('.landing-hero__h1')).toContainText('Turn data into')
    await expect(page.locator('.landing-hero__btn--ghost')).toContainText('My Charts')
    await expect(page.locator('.landing-hero__btn--primary')).toContainText('New')
  })

  test('hero chart renders real D3 chart', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(2000)

    const chartContainer = page.locator('.landing-hero__chart .landing-chart-preview')
    await expect(chartContainer).toBeVisible()

    // D3 should have rendered SVG content
    const svg = chartContainer.locator('svg').first()
    await expect(svg).toBeVisible()
  })

  test('philosophy section renders with chart', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    await expect(page.locator('#features')).toBeVisible()
    await expect(page.locator('text=Direct labels by default')).toBeVisible()

    // Chart tile should exist
    await expect(page.locator('.philosophy-chart-tile')).toBeVisible()
  })

  test('BPC format section shows real BPC syntax', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    const codeBlock = page.locator('.format-pane__code')
    await expect(codeBlock).toBeVisible()

    const codeText = await codeBlock.textContent()
    expect(codeText).toContain('chart bar-vertical')
    expect(codeText).toContain('data {')
  })

  test('scenes section renders chart and player', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(2000)

    // Scenes demo chart container should be visible
    await expect(page.locator('.scenes-demo__chart')).toBeVisible()

    // Should have rendered an SVG chart
    const svg = page.locator('.scenes-demo__chart svg').first()
    await expect(svg).toBeVisible()
  })

  test('practices section shows 6 cards', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    const cards = page.locator('.practice-card')
    await expect(cards).toHaveCount(6)
  })

  test('open source section renders stats', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    const stats = page.locator('.oss-stat')
    await expect(stats).toHaveCount(4)
  })

  test('footer renders', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    await expect(page.locator('.landing-footer')).toBeVisible()
    await expect(page.locator('.landing-footer')).toContainText('Blueprint Chart')
  })

  test('no console errors on landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/#/')
    await page.waitForTimeout(3000)

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })

  test('layout has correct visual dimensions', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(2000)

    // Landing page should fill viewport
    const landingPage = page.locator('.landing-page')
    const box = await landingPage.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(900)

    // Hero should have a grid layout with two columns
    const heroInner = page.locator('.landing-hero__inner')
    const heroBox = await heroInner.boundingBox()
    expect(heroBox).not.toBeNull()
    expect(heroBox!.width).toBeGreaterThan(600)
  })

  test('anchor navigation scrolls to sections', async ({ page }) => {
    await page.goto('/#/')
    await page.waitForTimeout(1000)

    // Click "BPC Format" anchor
    await page.locator('.shell-navbar__anchors a', { hasText: 'BPC Format' }).click()
    await page.waitForTimeout(500)

    // BPC section should be near the top of the viewport
    const bpcSection = page.locator('#bpc')
    await expect(bpcSection).toBeVisible()
  })
})
