import { test, expect } from '@playwright/test'
import type { ConsoleMessage, Page } from '@playwright/test'
import { gotoRender } from '../support/render'

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', err => errors.push(err.message))
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

// The browser cascade is the only instrument that proves these: a stylesheet
// declaration outranks a presentation attribute, so the DOM attribute can carry
// the right value while the paint uses the stylesheet's.

// #50: `.bc-line { stroke-width: var(--bc-line-stroke-width) }` beat the
// per-series `stroke-width` attribute, so `lineWidth` painted 2px either way.
const SERIES_LINE_WIDTH = `chart line-multi {
  data {
    series = "Revenue","Cost"
    "2018" = 10,4
    "2019" = 15,6
  }
  series "Cost" {
    lineWidth = 8
  }
}`

// #89: `.bc-crosshair { stroke: var(--bc-crosshair-color) }` beat the crosshair's
// `stroke` attribute, so the line painted grey whatever `crosshairColor` said.
const CROSSHAIR_COLOR = `chart line {
  crosshair = true
  crosshairColor = "#ff0000"

  data {
    "2018" = 10
    "2019" = 15
    "2020" = 12
  }
}`

test.describe('G10 line/area: a stylesheet must not outrank a data-driven value', () => {
  test('a series lineWidth reaches the painted line', async ({ page }) => {
    await gotoRender(page, SERIES_LINE_WIDTH)
    await expect(page.locator('.bc-frame .bc-line').first()).toBeVisible()

    const widths = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-line'),
      el => getComputedStyle(el).strokeWidth,
    ))
    expect(widths).toHaveLength(2)
    expect(widths).toContain('8px')
    expect(widths).toContain('2px')
  })

  test('crosshairColor reaches the painted crosshair', async ({ page }) => {
    await gotoRender(page, CROSSHAIR_COLOR)
    await expect(page.locator('.bc-frame .bc-crosshair-v')).toHaveCount(1)

    const strokes = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-crosshair'),
      el => getComputedStyle(el).stroke,
    ))
    expect(strokes.length).toBeGreaterThan(0)
    expect(strokes.every(s => s === 'rgb(255, 0, 0)')).toBe(true)
  })
})

// #16: a row with fewer values than the series meta-row reached the scale as
// `undefined`, so the path got NaN coordinates, Chromium rejected it, and the
// short series lost its line entirely.
const RAGGED_ROW = `chart line-multi {
  valueLabels = true

  data {
    series = "A","B"
    "2018" = 1,2
    "2019" = 3
    "2020" = 5,6
  }
}`

test.describe('G10 line/area: a ragged row is a gap, not NaN', () => {
  test('line-multi keeps both lines and logs no SVG error', async ({ page }) => {
    const errors = collectErrors(page)
    await gotoRender(page, RAGGED_ROW)

    await expect(page.locator('.bc-frame .bc-line')).toHaveCount(2)
    const paths = await page.locator('.bc-frame .bc-line').evaluateAll(
      els => els.map(el => el.getAttribute('d') ?? ''),
    )
    expect(paths.every(d => !d.includes('NaN'))).toBe(true)
    // The short series breaks at the hole instead of losing its whole line.
    expect(paths.some(d => (d.match(/M/g) ?? []).length === 2)).toBe(true)
    const labels = await page.locator('.bc-frame .bc-value-label').allTextContents()
    expect(labels).not.toContain('undefined')
    expect(errors).toEqual([])
  })
})
