import { test, expect } from '@playwright/test'
import type { ConsoleMessage, Page } from '@playwright/test'
import { gotoRender } from '../support/render'

/**
 * G7 value-coercion: a value the validator accepts must not break the render.
 */

const BAD_COLOR_PIE = `chart pie {
  title = "An unparseable color must not take the chart down"
  colors = "notacolor,#2a9d8f"

  data {
    "A" = 1
    "B" = 1
    "C" = 1
  }
}`

const NEGATIVE_SYMBOL_LINE = `chart line {
  title = "A negative symbol size must not drop every symbol"
  lineSymbols = true
  lineSymbolShowOn = "all"
  lineSymbolSize = "-5"

  data {
    "A" = 10
    "B" = 40
  }
}`

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

test.describe('unparseable colors (#58)', () => {
  test('pie still paints its slices and throws nothing', async ({ page }) => {
    const errors = collectErrors(page)
    await gotoRender(page, BAD_COLOR_PIE)

    await expect(page.locator('.bc-arc')).toHaveCount(3)
    expect(errors).toEqual([])
  })
})

test.describe('negative lineSymbolSize (#26)', () => {
  test('line keeps its symbols with a non-negative radius', async ({ page }) => {
    const errors = collectErrors(page)
    await gotoRender(page, NEGATIVE_SYMBOL_LINE)

    const radii = await page.locator('circle.bc-symbol').evaluateAll(
      els => els.map(el => Number(el.getAttribute('r'))),
    )
    expect(radii).toHaveLength(2)
    expect(radii.every(r => r >= 0)).toBe(true)
    expect(errors).toEqual([])
  })
})
