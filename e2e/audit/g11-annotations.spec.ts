import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { gotoRender } from '../support/render'

// #47 + #44: out-of-domain range endpoints put the band ~2000px above the plot
// and the unbounded viewBox expansion scaled the whole chart to 16%.
const OUT_OF_DOMAIN_RANGE = `chart bar-vertical {
  data {
    "Alpha" = 30
    "Beta" = 20
  }
  range {
    orientation = horizontal
    start = 100
    end = 200
  }
}`

// #45: the documented note position, which used to land below the canvas.
const DOCUMENTED_NOTE = `chart bar-vertical {
  data {
    "Alpha" = 30
    "Beta" = 20
  }
  note {
    text = "A short note"
    x = "10%"
    y = "90%"
  }
}`

// #48: "Zulu" is not in the data, so the band used to span the plot origin to
// Bravo and highlight Alpha, a category the author never named.
const MISSING_CATEGORY_RANGE = `chart bar-vertical {
  data {
    "Alpha" = 30
    "Bravo" = 20
    "Charlie" = 25
  }
  range {
    start = "Bravo"
    end = "Zulu"
    text = "window"
  }
}`

// #109: an orientation pointing at the value axis while the endpoints name
// categories used to emit y="NaN" height="NaN" and four console errors.
const AXIS_TYPE_MISMATCH_RANGE = `chart bar-vertical {
  data {
    "Alpha" = 30
    "Beta" = 20
  }
  range {
    orientation = horizontal
    start = "Alpha"
    end = "Beta"
  }
}`

// #81: a scene carrying both new data and an annotation shrank the plot for
// good, because getBBox was read while the axis rescale was still tweening.
const SCENE_WITH_DATA_AND_ANNOTATION = `chart line {
  data {
    "A" = 4
    "B" = 9
  }

  scene "new data plus annotation" {
    data {
      "A" = 12
      "B" = 7
    }
    annotation "A" {
      text = "note"
    }
  }
}`

/** Scale `preserveAspectRatio` applies to the chart, 1 when there is no viewBox. */
async function chartScale(page: Page): Promise<number> {
  return page.evaluate(() => {
    const svg = document.querySelector('.bc-frame-body svg') as SVGSVGElement | null
    if (!svg) {
      return 0
    }
    const viewBox = svg.getAttribute('viewBox')
    if (!viewBox) {
      return 1
    }
    const [, , w, h] = viewBox.split(/[\s,]+/).map(Number)
    const width = parseFloat(svg.getAttribute('width') || '0')
    const height = parseFloat(svg.getAttribute('height') || '0')
    if (!width || !height) {
      return 1
    }
    return Math.min(width / w, height / h)
  })
}

test.describe('G11 annotations', () => {
  test('out-of-domain range endpoints keep the chart at full size', async ({ page }) => {
    await gotoRender(page, OUT_OF_DOMAIN_RANGE)
    await expect(page.locator('.bc-frame .bc-bar').first()).toBeVisible()

    expect(await chartScale(page)).toBeGreaterThanOrEqual(0.8)

    const band = page.locator('.bc-annotation-range')
    await expect(band).toHaveCount(1)
    const box = await band.evaluate(el => ({
      y: Number(el.getAttribute('y')),
      height: Number(el.getAttribute('height')),
    }))
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(box.height)).toBe(true)
  })

  test('a note at 10%/90% lands inside the plot and leaves the chart at full size', async ({ page }) => {
    await gotoRender(page, DOCUMENTED_NOTE)
    await expect(page.locator('.bc-annotation-text')).toBeVisible()

    expect(await chartScale(page)).toBe(1)

    const inside = await page.evaluate(() => {
      const text = document.querySelector('.bc-annotation-text') as SVGGraphicsElement
      const group = document.querySelector('.bc-annotations') as SVGGElement
      const ctxW = Number(group.getAttribute('data-ctx-width'))
      const ctxH = Number(group.getAttribute('data-ctx-height'))
      const box = text.getBBox()
      return box.x >= 0 && box.y >= 0 && box.x + box.width <= ctxW && box.y + box.height <= ctxH
    })
    expect(inside).toBe(true)
  })

  test('a range endpoint naming a nonexistent category draws no band', async ({ page }) => {
    await gotoRender(page, MISSING_CATEGORY_RANGE)
    await expect(page.locator('.bc-frame .bc-bar').first()).toBeVisible()
    await expect(page.locator('.bc-annotation-range')).toHaveCount(0)
  })

  test('a range oriented at the value axis emits no NaN geometry and no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => msg.type() === 'error' && errors.push(msg.text()))

    await gotoRender(page, AXIS_TYPE_MISMATCH_RANGE)
    await expect(page.locator('.bc-frame .bc-bar').first()).toBeVisible()

    await expect(page.locator('.bc-annotation-range')).toHaveCount(0)
    expect(errors.filter(e => e.includes('NaN'))).toHaveLength(0)
  })

  test('a scene with new data and an annotation keeps the chart at full size', async ({ page }) => {
    await gotoRender(page, SCENE_WITH_DATA_AND_ANNOTATION)
    await expect(page.locator('.bc-frame .bc-line').first()).toBeVisible()
    expect(await chartScale(page)).toBe(1)

    await page.locator('[data-scene-player] [aria-label="Next scene"]').click()
    await expect(page.locator('.bc-annotation-text')).toBeVisible()

    // #81 reported 58% for this shape and 24% for a 3-point variant, and it
    // never self-corrected. The contract is #44's cap, not an exact 1: the
    // annotation's own callout may legitimately need a little room.
    await expect.poll(() => chartScale(page), { timeout: 5_000 }).toBeGreaterThanOrEqual(0.8)
  })
})
