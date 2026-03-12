import { test, expect } from '@playwright/test'

test('debug landing page scroll and sections', async ({ page }) => {
  await page.goto('/#/')
  await page.waitForTimeout(2000)

  // Check landing page dimensions
  const landingPage = page.locator('.landing-page')
  const lpBox = await landingPage.boundingBox()
  console.log(`Landing page box:`, lpBox)

  // Scroll down and take screenshots at intervals
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/landing-0.png' })

  await page.evaluate(() => window.scrollTo(0, 800))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-800.png' })

  await page.evaluate(() => window.scrollTo(0, 1200))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-1200.png' })

  await page.evaluate(() => window.scrollTo(0, 1600))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-1600.png' })

  await page.evaluate(() => window.scrollTo(0, 2400))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-2400.png' })

  await page.evaluate(() => window.scrollTo(0, 3200))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-3200.png' })

  await page.evaluate(() => window.scrollTo(0, 4000))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/landing-4000.png' })

  await page.evaluate(() => window.scrollTo(0, 99999))
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

  const philosophyGrid = page.locator('.philosophy__grid')
  console.log('Philosophy grid count:', await philosophyGrid.count())

  const formatGrid = page.locator('.format__grid')
  console.log('Format grid count:', await formatGrid.count())

  const scenesGrid = page.locator('.scenes__grid')
  console.log('Scenes grid count:', await scenesGrid.count())

  const practicesGrid = page.locator('.practices__grid')
  console.log('Practices grid count:', await practicesGrid.count())

  const footer = page.locator('.landing-footer')
  console.log('Footer count:', await footer.count())
})
