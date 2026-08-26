import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

const SPLIT_BPC = `chart bar-split {
  sharedScale = true

  data {
    series = "Small","Large"
    "A" = 2,200
    "B" = 3,300
  }
}`

async function barSplitWidths(page): Promise<number[]> {
  return page.evaluate(() => Array.from(
    document.querySelectorAll('.bc-frame .bc-bar-split'),
    el => Number((el as SVGRectElement).getAttribute('width') ?? '0'),
  ))
}

test.describe('G1 options passthrough', () => {
  // #100: sharedScale must reach the bar-split renderer, so the panel holding
  // values around 2 renders far shorter bars than the one around 300.
  test('sharedScale scales every bar-split panel against the global max', async ({ page }) => {
    await gotoRender(page, SPLIT_BPC)
    await expect(page.locator('.bc-frame .bc-bar-split').first()).toBeVisible()

    const widths = await barSplitWidths(page)
    expect(widths.length).toBe(4)
    expect(Math.max(...widths) / Math.max(1, Math.min(...widths))).toBeGreaterThan(10)
  })
})
