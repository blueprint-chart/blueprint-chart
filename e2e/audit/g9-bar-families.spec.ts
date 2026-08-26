import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

// Real font metrics are the instrument here: under jsdom `measureText` is a
// 6px-per-character stub, so the unit tests prove only that the estimate's floor
// holds. Whether a header actually fits its panel, and whether two of them
// actually touch, is a question about painted ink that only a browser answers.

const TWELVE_PANELS = `chart bar-split {
  data {
    series = ${Array.from({ length: 12 }, (_, i) => `"Series ${i + 1}"`).join(',')}
    "North" = ${Array.from({ length: 12 }, (_, i) => 11 + i).join(',')}
    "South" = ${Array.from({ length: 12 }, (_, i) => 20 + i).join(',')}
  }
}`

// #22: three of these four rows share a label. All four used to collapse into
// two bars, losing 17 and 8 without a word.
const REPEATED_LABELS = `chart bar-vertical {
  valueLabels = true

  data {
    "Alpha" = 42
    "Alpha" = 17
    "Beta" = 63
    "Alpha" = 8
  }
}`

async function inkBoxes(page: import('@playwright/test').Page, selector: string) {
  return page.evaluate((sel) => {
    const svg = document.querySelector('.bc-frame svg')!.getBoundingClientRect()
    return Array.from(document.querySelectorAll(sel), (el) => {
      const box = el.getBoundingClientRect()
      return { text: el.textContent ?? '', left: box.left - svg.left, right: box.right - svg.left, svgWidth: svg.width }
    })
  }, selector)
}

test.describe('G9 bar-split panels', () => {
  // #39: headers were painted at full length whatever the panel measured, so at
  // twelve series they read as one unbroken string with the last one off canvas.
  test('twelve panel headers stay on the canvas and clear of each other', async ({ page }) => {
    await gotoRender(page, TWELVE_PANELS)
    await expect(page.locator('.bc-frame .bc-bar-split').first()).toBeVisible()

    const headers = await inkBoxes(page, '.bc-frame .bc-split-header')
    expect(headers).toHaveLength(12)
    for (const header of headers) {
      expect(header.left, `left edge of "${header.text}"`).toBeGreaterThanOrEqual(0)
      expect(header.right, `right edge of "${header.text}"`).toBeLessThanOrEqual(header.svgWidth)
    }
    for (let i = 1; i < headers.length; i++) {
      expect(headers[i].left, `"${headers[i - 1].text}" then "${headers[i].text}"`)
        .toBeGreaterThanOrEqual(headers[i - 1].right)
    }
  })

  test('a value label never lands on the category labels', async ({ page }) => {
    await gotoRender(page, TWELVE_PANELS)
    await expect(page.locator('.bc-frame .bc-bar-split').first()).toBeVisible()

    const collisions = await page.evaluate(() => {
      const hits = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
      const labels = Array.from(document.querySelectorAll('.bc-frame .bc-value-label'))
      const categories = Array.from(document.querySelectorAll('.bc-frame .bc-axis-vertical .tick text'))
      const found: string[] = []
      for (const label of labels) {
        for (const category of categories) {
          if (hits(label.getBoundingClientRect(), category.getBoundingClientRect())) {
            found.push(`"${label.textContent}" over "${category.textContent}"`)
          }
        }
      }
      return found
    })
    expect(collisions).toEqual([])
  })

  test('every row of a data block sharing a label keeps its own bar', async ({ page }) => {
    await gotoRender(page, REPEATED_LABELS)
    await expect(page.locator('.bc-frame .bc-bar').first()).toBeVisible()

    const bars = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-bar'),
      el => el.getBoundingClientRect().left,
    ))
    expect(new Set(bars).size).toBe(4)

    const labels = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-value-label'),
      el => el.textContent,
    ))
    expect(labels).toEqual(['42', '17', '63', '8'])

    const ticks = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-axis-horizontal .tick text'),
      el => el.textContent,
    ))
    expect(ticks).toEqual(['Alpha', 'Alpha (2)', 'Beta', 'Alpha (3)'])
  })
})
