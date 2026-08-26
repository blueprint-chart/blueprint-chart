import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

// #64: a highlight target that matches no category dimmed every bar to 0.35.
const UNMATCHED_HIGHLIGHT = `chart bar-vertical {
  data {
    "Alpha" = 30
    "Beta" = 20
    "Gamma" = 25
  }
  highlight "Nope"
}`

const MATCHED_HIGHLIGHT = UNMATCHED_HIGHLIGHT.replace('highlight "Nope"', 'highlight "Beta"')

// #60: Klimt has 6 colours, so a 7-series chart used to repeat the first one.
const SEVEN_SERIES = `chart line-multi {
  colorPalette = "Klimt"

  data {
    series = "S1","S2","S3","S4","S5","S6","S7"
    "Jan" = 1,2,3,4,5,6,7
    "Feb" = 2,3,4,5,6,7,8
  }
}`

async function barOpacities(page): Promise<number[]> {
  return page.evaluate(() => Array.from(
    document.querySelectorAll('.bc-frame .bc-bar'),
    el => Number(el.getAttribute('opacity') ?? '1'),
  ))
}

test.describe('G12 palettes', () => {
  test('a highlight target that matches nothing leaves every bar at full opacity', async ({ page }) => {
    await gotoRender(page, UNMATCHED_HIGHLIGHT)
    await expect(page.locator('.bc-frame .bc-bar').first()).toBeVisible()

    const opacities = await barOpacities(page)
    expect(opacities).toHaveLength(3)
    expect(opacities.every(o => o === 1)).toBe(true)
  })

  test('a highlight target that matches still dims the others', async ({ page }) => {
    await gotoRender(page, MATCHED_HIGHLIGHT)
    await expect(page.locator('.bc-frame .bc-bar').first()).toBeVisible()

    const opacities = await barOpacities(page)
    expect(opacities.filter(o => o === 0.35)).toHaveLength(2)
  })

  test('a 7-series chart on a 6-colour palette paints 7 distinct lines', async ({ page }) => {
    await gotoRender(page, SEVEN_SERIES)
    await expect(page.locator('.bc-frame .bc-line').first()).toBeVisible()

    const strokes = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-line'),
      el => el.getAttribute('stroke') ?? '',
    ))
    expect(strokes).toHaveLength(7)
    expect(new Set(strokes).size).toBe(7)
  })
})
