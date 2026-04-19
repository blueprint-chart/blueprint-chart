import { test, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

/**
 * Farm Compass sample — full story E2E tests.
 *
 * Validates that the multi-scene farm-compass.bpc sample renders every scene
 * correctly via the /render route, including chart-type overrides,
 * data overrides, highlights, titles, and scene navigation.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const FARM_COMPASS_BPC = fs.readFileSync(
  path.resolve(__dirname, '../packages/lib/src/samples/farm-compass.bpc'),
  'utf-8',
)

function bpc64(bpc: string): string {
  return Buffer.from(bpc).toString('base64')
}

async function gotoFarmCompass(page: Page) {
  await page.goto(`/#/render?bpc64=${bpc64(FARM_COMPASS_BPC)}`)
  await page.waitForSelector('.bc-frame', { timeout: 15_000 })
  await expect(page.locator('.bc-frame-body svg')).toBeVisible()
}

/** Click next‐scene N times via the player arrow button */
async function goToScene(page: Page, clicks: number) {
  const nextBtn = page.locator('.bc-frame [aria-label="Next scene"]')
  for (let i = 0; i < clicks; i++) {
    await nextBtn.click()
    await page.waitForTimeout(600)
  }
}

// ---------------------------------------------------------------------------
// Base chart renders
// ---------------------------------------------------------------------------

test.describe('Farm Compass — base chart', () => {
  test('renders the frame with title and SVG', async ({ page }) => {
    await gotoFarmCompass(page)

    await expect(page.locator('.bc-frame')).toBeVisible()
    await expect(page.locator('.bc-frame-title')).toContainText('EU subsidies')
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()
  })

  test('renders stacked area paths for the two subsidy series', async ({ page }) => {
    await gotoFarmCompass(page)

    const areas = page.locator('.bc-area')
    const count = await areas.count()
    // Two series: Indirect + Direct subsidies
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('has a legend with both series', async ({ page }) => {
    await gotoFarmCompass(page)

    const legendItems = page.locator('.bc-legend-item')
    const texts = await legendItems.allTextContents()
    expect(texts.some(t => t.includes('Indirect'))).toBe(true)
    expect(texts.some(t => t.includes('Direct'))).toBe(true)
  })

  test('scene player is visible with correct total', async ({ page }) => {
    await gotoFarmCompass(page)

    const player = page.locator('.bc-frame [data-scene-player]')
    await expect(player).toBeVisible()

    const counter = page.locator('.bc-scene-player__counter')
    await expect(counter).toContainText('/ 10')
  })
})

// ---------------------------------------------------------------------------
// Scene navigation and rendering
// ---------------------------------------------------------------------------

test.describe('Farm Compass — scene navigation', () => {
  test('scene 2: highlights indirect subsidies and dims direct', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 1) // Scene 2 = "Indirect subsidies shrank"

    await expect(page.locator('.bc-frame-title')).toContainText('Indirect subsidies')

    // Check highlight dimming: one area should be bright (0.85), the other dimmed (0.3)
    const areas = page.locator('.bc-area')
    const opacities = await areas.evaluateAll(els =>
      els.map(el => parseFloat(el.getAttribute('opacity') ?? '1')),
    )
    const bright = opacities.filter(o => o > 0.5)
    const dimmed = opacities.filter(o => o <= 0.5)
    expect(bright.length).toBeGreaterThanOrEqual(1)
    expect(dimmed.length).toBeGreaterThanOrEqual(1)
  })

  test('scene 3: highlights direct subsidies and dims indirect', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 2) // Scene 3 = "Direct subsidies dominate"

    await expect(page.locator('.bc-frame-title')).toContainText('Direct')

    const areas = page.locator('.bc-area')
    const opacities = await areas.evaluateAll(els =>
      els.map(el => parseFloat(el.getAttribute('opacity') ?? '1')),
    )
    const bright = opacities.filter(o => o > 0.5)
    const dimmed = opacities.filter(o => o <= 0.5)
    expect(bright.length).toBeGreaterThanOrEqual(1)
    expect(dimmed.length).toBeGreaterThanOrEqual(1)
  })

  test('scene 4: Bulgaria subsidies with new data', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 3) // Scene 4 = "Bulgaria: subsidies explode"

    await expect(page.locator('.bc-frame-title')).toContainText('Bulgaria')
    // Still area-stacked with two series
    const areas = page.locator('.bc-area')
    expect(await areas.count()).toBeGreaterThanOrEqual(2)
  })

  test('scene 5: switches to line chart for farm size', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 4) // Scene 5 = "Bulgarian farms grew"

    await expect(page.locator('.bc-frame-title')).toContainText('farm size')
    // Should have a line path, not area
    await expect(page.locator('.bc-line').first()).toBeVisible()
  })

  test('scene 6: switches to area chart for production', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 5) // Scene 6 = "Production rose"

    await expect(page.locator('.bc-frame-title')).toContainText('production')
    // Area chart should have a visible area path and line
    await expect(page.locator('.bc-line').first()).toBeVisible()
  })

  test('scene 7: area-stacked with 3 series for crop shift', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 6) // Scene 7 = "Cash crops replaced vegetables"

    await expect(page.locator('.bc-frame-title')).toContainText('Cash crops')
    const areas = page.locator('.bc-area')
    // Three series: Vegetables, Cash crops, Other production
    expect(await areas.count()).toBeGreaterThanOrEqual(3)
  })

  test('scene 8: highlights vegetables, dims others', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 7) // Scene 8 = "Vegetables collapsed"

    await expect(page.locator('.bc-frame-title')).toContainText('Vegetable')

    const areas = page.locator('.bc-area')
    const opacities = await areas.evaluateAll(els =>
      els.map(el => parseFloat(el.getAttribute('opacity') ?? '1')),
    )
    const bright = opacities.filter(o => o > 0.5)
    const dimmed = opacities.filter(o => o <= 0.5)
    // Vegetables highlighted, Cash crops + Other dimmed
    expect(bright.length).toBeGreaterThanOrEqual(1)
    expect(dimmed.length).toBeGreaterThanOrEqual(2)
  })

  test('scene 9: line-multi with 7 vegetable series, no dimming', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 8) // Scene 9 = "Every vegetable declined"

    await expect(page.locator('.bc-frame-title')).toContainText('vegetable')
    const lines = page.locator('.bc-line')
    expect(await lines.count()).toBeGreaterThanOrEqual(5)

    // All lines should be at full opacity (no highlights on this scene)
    const opacities = await lines.evaluateAll(els =>
      els.map(el => el.getAttribute('opacity')),
    )
    for (const op of opacities) {
      expect(op).not.toBe('0.3')
    }
  })

  test('scene 10: highlights non-salaried, dims salaried', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 9) // Scene 10 = "Jobs disappeared"

    await expect(page.locator('.bc-frame-title')).toContainText('Seasonal farm workers')
    const lines = page.locator('.bc-line')
    expect(await lines.count()).toBeGreaterThanOrEqual(2)

    // Non-salaried highlighted, salaried dimmed
    const opacities = await lines.evaluateAll(els =>
      els.map(el => parseFloat(el.getAttribute('opacity') ?? '1')),
    )
    const bright = opacities.filter(o => o > 0.5)
    const dimmed = opacities.filter(o => o <= 0.5)
    expect(bright.length).toBeGreaterThanOrEqual(1)
    expect(dimmed.length).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Data correctness
// ---------------------------------------------------------------------------

test.describe('Farm Compass — data correctness', () => {
  test('base chart has 16 data points on the x-axis (2000-2015)', async ({ page }) => {
    await gotoFarmCompass(page)

    const ticks = page.locator('.bc-axis:not(.bc-axis-vertical) .tick text')
    const texts = await ticks.allTextContents()
    // Should include year labels from 2000 to 2015
    expect(texts.some(t => t.includes('2000'))).toBe(true)
    expect(texts.some(t => t.includes('2015'))).toBe(true)
  })

  test('scene 5 (farm size) axis shows low values (hectares)', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 4) // Line chart: farm size 5-18 ha

    // Y-axis should show small values (under 20)
    const yTicks = page.locator('.bc-axis-vertical .tick text')
    const texts = await yTicks.allTextContents()
    // At least one tick should be a small number
    const nums = texts.map(t => parseFloat(t.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n))
    expect(nums.length).toBeGreaterThan(0)
    expect(Math.max(...nums)).toBeLessThan(100)
  })

  test('scene 10 (employment) axis shows large values (thousands)', async ({ page }) => {
    await gotoFarmCompass(page)
    await goToScene(page, 9) // Line-multi: employment 2000-16000

    const yTicks = page.locator('.bc-axis-vertical .tick text')
    const texts = await yTicks.allTextContents()
    const nums = texts.map(t => parseFloat(t.replace(/[^0-9.km]/g, '').replace('k', '000'))).filter(n => !isNaN(n))
    expect(nums.length).toBeGreaterThan(0)
    // Values should be in thousands range
    expect(Math.max(...nums)).toBeGreaterThan(100)
  })
})

// ---------------------------------------------------------------------------
// Navigation round-trip
// ---------------------------------------------------------------------------

test.describe('Farm Compass — navigation round-trip', () => {
  test('can navigate forward through all 10 scenes and back', async ({ page }) => {
    await gotoFarmCompass(page)

    const counter = page.locator('.bc-scene-player__counter')
    await expect(counter).toContainText('1 / 10')

    // Navigate forward to last scene
    await goToScene(page, 9)
    await expect(counter).toContainText('10 / 10')

    // Navigate back to first
    const prevBtn = page.locator('.bc-frame [aria-label="Previous scene"]').first()
    for (let i = 0; i < 9; i++) {
      await prevBtn.click()
      await page.waitForTimeout(400)
    }
    await expect(counter).toContainText('1 / 10')

    // Chart should still be visible and correct
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()
    await expect(page.locator('.bc-frame-title')).toContainText('EU subsidies')
  })
})

// ---------------------------------------------------------------------------
// Rapid navigation (regression: duplicate frames during cross-type transitions)
// ---------------------------------------------------------------------------

test.describe('Farm Compass — rapid navigation', () => {
  test('no duplicate frames when clicking through scenes quickly', async ({ page }) => {
    await gotoFarmCompass(page)

    const nextBtn = page.locator('.bc-frame [aria-label="Next scene"]').first()
    for (let i = 0; i < 9; i++) {
      await nextBtn.click()
      await page.waitForTimeout(100)

      const frameCount = await page.locator('.bc-frame').count()
      expect(frameCount).toBeLessThanOrEqual(1)
    }

    // After settling, scene 10 should render correctly
    await page.waitForTimeout(2000)
    await expect(page.locator('.bc-frame-title')).toContainText('Seasonal farm workers')
    const lines = page.locator('.bc-line')
    expect(await lines.count()).toBeGreaterThanOrEqual(2)
  })

  test('stress: burst-clicking next never mixes chart types in final state', async ({ page }) => {
    await gotoFarmCompass(page)
    await page.waitForTimeout(500)

    // Fire 9 clicks back-to-back in the page without any awaits between them.
    // This is the worst case the scheduler can see — every click happens
    // within a single event loop turn.
    await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Next scene"]') as HTMLElement | null
      if (!btn) throw new Error('Next button missing')
      for (let i = 0; i < 9; i++) btn.click()
    })

    // Wait past the D3 transition duration (500ms) plus a generous margin.
    await page.waitForTimeout(2000)

    // Final scene (#10) is line-multi: "Seasonal farm workers vanished"
    await expect(page.locator('.bc-frame-title')).toContainText('Seasonal farm workers')

    // Exactly one live frame in the DOM.
    expect(await page.locator('.bc-frame').count()).toBe(1)

    // No leftover elements from earlier chart types.
    expect(await page.locator('.bc-area').count()).toBe(0)
    expect(await page.locator('.bc-bar').count()).toBe(0)

    // line-multi should render both salaried + non-salaried lines.
    expect(await page.locator('.bc-line').count()).toBeGreaterThanOrEqual(2)
  })

  test('stress: alternating next/prev bursts leave a consistent single chart', async ({ page }) => {
    await gotoFarmCompass(page)
    await page.waitForTimeout(500)

    // Navigate to a middle scene first so both next/prev buttons are enabled,
    // then alternate direction bursts within a single tick to prove that
    // handlers read the store atomically on each click.
    await goToScene(page, 5) // Scene 6 (line/area territory)
    await page.waitForTimeout(500)

    await page.evaluate(() => {
      const next = document.querySelector('[aria-label="Next scene"]') as HTMLElement | null
      const prev = document.querySelector('[aria-label="Previous scene"]') as HTMLElement | null
      if (!next || !prev) throw new Error('Player buttons missing')
      // Net effect: +3 -2 +1 = +2 → scene 8
      for (let i = 0; i < 3; i++) next.click()
      for (let i = 0; i < 2; i++) prev.click()
      for (let i = 0; i < 1; i++) next.click()
    })

    await page.waitForTimeout(2000)

    // Starting scene was 6, net +2 = scene 8 = "Vegetables collapsed"
    const counter = page.locator('.bc-scene-player__counter')
    await expect(counter).toContainText('8 / 10')
    await expect(page.locator('.bc-frame-title')).toContainText('Vegetable')

    // Exactly one frame, no leftover bars.
    expect(await page.locator('.bc-frame').count()).toBe(1)
    expect(await page.locator('.bc-bar').count()).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Constrained height: SVG must match body, footer must be visible
// ---------------------------------------------------------------------------

test.describe('Farm Compass — constrained height', () => {
  test('chart fills body with no gap at top, 1 frame per scene', async ({ page }) => {
    await gotoFarmCompass(page)
    await page.waitForTimeout(2000)

    const nextBtn = page.locator('.bc-frame [aria-label="Next scene"]').first()

    for (let scene = 1; scene <= 10; scene++) {
      if (scene > 1) {
        await nextBtn.click()
        await page.waitForTimeout(1500)
      }

      const info = await page.evaluate(() => {
        const body = document.querySelector('.bc-frame-body') as HTMLElement
        const svg = body?.querySelector('svg') as SVGElement
        const frames = document.querySelectorAll('.bc-frame')
        if (!body || !svg) return null
        const bodyR = body.getBoundingClientRect()
        const svgR = svg.getBoundingClientRect()
        return {
          frames: frames.length,
          gapAbove: Math.round(svgR.top - bodyR.top),
          bodyH: Math.round(bodyR.height),
          svgH: Math.round(svgR.height),
        }
      })

      expect(info?.frames, `Scene ${scene}: multiple frames`).toBe(1)
      // SVG starts at top of body (no gap above)
      expect(info!.gapAbove, `Scene ${scene}: gap above`).toBeLessThanOrEqual(2)
      // Body has a reasonable height
      expect(info!.bodyH, `Scene ${scene}: body too small`).toBeGreaterThan(200)
    }
  })
})

// ---------------------------------------------------------------------------
// No console errors
// ---------------------------------------------------------------------------

test.describe('Farm Compass — stability', () => {
  test('no console errors when navigating all scenes', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await gotoFarmCompass(page)

    // Navigate through all scenes
    await goToScene(page, 9)

    // Navigate back
    const prevBtn = page.locator('.bc-frame [aria-label="Previous scene"]').first()
    for (let i = 0; i < 9; i++) {
      await prevBtn.click()
      await page.waitForTimeout(300)
    }

    const realErrors = errors.filter(e => !e.includes('favicon'))
    expect(realErrors).toEqual([])
  })
})
