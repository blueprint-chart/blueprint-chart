import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

// #85: the value label printed inside a stacked segment used to swallow the
// hover, so the one spot a user aims at produced no tooltip.
const STACKED_WITH_VALUE_LABELS = `chart column-stacked {
  tooltips = true
  valueLabels = true
  data {
    series = "Gold","Silver"
    "USA" = 40,44
    "China" = 38,32
  }
}`

// #83: the arc datum carries no value of its own, so the tooltip printed the
// object. #86: arcs carried no data-series, so legend hover was a no-op.
const PIE = `chart pie {
  tooltips = true
  legend = true
  data {
    "Coal" = 34.2
    "Gas" = 21.8
  }
}`

test('a value label does not intercept the hover on its own segment (#85)', async ({ page }) => {
  await gotoRender(page, STACKED_WITH_VALUE_LABELS)
  const label = page.locator('text.bc-value-label').first()
  await expect(label).toBeVisible()

  const box = await label.boundingBox()
  expect(box).not.toBeNull()
  const cx = box!.x + box!.width / 2
  const cy = box!.y + box!.height / 2

  const hit = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y)
    return el ? el.getAttribute('class') : null
  }, [cx, cy])
  expect(hit).not.toContain('bc-value-label')

  await page.mouse.move(cx, cy)
  // A prior plugin install leaves an empty .bc-tooltip in the body, so match
  // the one that is actually shown.
  await expect(page.locator('.bc-tooltip:visible')).toHaveText('Gold – USA: 40')
})

test('a pie tooltip names the slice, not the datum object (#83)', async ({ page }) => {
  await gotoRender(page, PIE)
  const arc = page.locator('.bc-arc').first()
  await arc.hover()
  await expect(page.locator('.bc-tooltip:visible')).toHaveText('Coal: 34.2')
})

test('legend hover highlights one arc instead of doing nothing (#86)', async ({ page }) => {
  await gotoRender(page, PIE)
  const legendItem = page.locator('.bc-legend-item[data-series="Coal"]')
  await expect(legendItem).toHaveCount(1)
  await legendItem.hover()

  await expect
    .poll(async () => page.locator('.bc-arc[data-series="Gas"]').evaluate(el => Number(getComputedStyle(el).opacity)))
    .toBeLessThan(1)
  await expect
    .poll(async () => page.locator('.bc-arc[data-series="Coal"]').evaluate(el => Number(getComputedStyle(el).opacity)))
    .toBe(1)
})
