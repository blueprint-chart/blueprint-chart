import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

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
