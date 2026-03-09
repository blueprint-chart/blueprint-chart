import { test, expect } from '@playwright/test'

test('debug landing page scroll and sections', async ({ page }) => {
  await page.goto('/#/')
  await page.waitForTimeout(2000)

  // Check the scrollable container
  const scrollContainer = page.locator('.d-flex.flex-grow-1.overflow-auto')
  const scrollHeight = await scrollContainer.evaluate(el => el.scrollHeight)
  const clientHeight = await scrollContainer.evaluate(el => el.clientHeight)
  console.log(`Scroll container: scrollHeight=${scrollHeight}, clientHeight=${clientHeight}`)

  // Check landing page dimensions
  const landingPage = page.locator('.landing-page')
  const lpBox = await landingPage.boundingBox()
  console.log(`Landing page box:`, lpBox)

  // Scroll down and take screenshots at intervals
  const scrollEl = scrollContainer
  await scrollEl.evaluate(el => el.scrollTop = 0)
  await page.screenshot({ path: 'test-results/landing-0.png' })

  await scrollEl.evaluate(el => el.scrollTop = 800)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-800.png' })

  await scrollEl.evaluate(el => el.scrollTop = 1200)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-1200.png' })

  await scrollEl.evaluate(el => el.scrollTop = 1600)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-1600.png' })

  await scrollEl.evaluate(el => el.scrollTop = 2400)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-2400.png' })

  await scrollEl.evaluate(el => el.scrollTop = 3200)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-3200.png' })

  await scrollEl.evaluate(el => el.scrollTop = 4000)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-4000.png' })

  await scrollEl.evaluate(el => el.scrollTop = 99999)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-bottom.png' })

  // Check all sections exist
  const sections = ['#features', '#transforms', '#bpc', '#stories', '#open-source']
  for (const sel of sections) {
    const el = page.locator(sel)
    const exists = await el.count()
    console.log(`Section ${sel}: count=${exists}`)
  }

  // Check for elements that should be visible
  const heroH1 = page.locator('.landing-hero__h1')
  console.log('Hero h1 visible:', await heroH1.isVisible())

  const philosophyGrid = page.locator('.philosophy-grid')
  console.log('Philosophy grid count:', await philosophyGrid.count())

  const formatGrid = page.locator('.format-grid')
  console.log('Format grid count:', await formatGrid.count())

  const scenesGrid = page.locator('.scenes-grid')
  console.log('Scenes grid count:', await scenesGrid.count())

  const practicesGrid = page.locator('.practices-grid')
  console.log('Practices grid count:', await practicesGrid.count())

  const footer = page.locator('.landing-footer')
  console.log('Footer count:', await footer.count())
})
