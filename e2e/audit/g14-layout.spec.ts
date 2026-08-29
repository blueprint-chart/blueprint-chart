import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

// #18: `horizontalLabelRotation = "vertical"` rotates the labels without
// reserving vertical space, so they clip to a sliver.
const ROTATED = `chart line {
  horizontalLabelRotation = "vertical"
  data {
    "Alphabetical" = 10
    "Beta version" = 40
  }
}`

test('vertical labels are not clipped to a sliver (#18)', async ({ page }) => {
  await gotoRender(page, ROTATED)
  const svg = page.locator('.bc-frame svg').first()
  const svgBox = await svg.boundingBox()
  expect(svgBox).not.toBeNull()

  const labels = page.locator('.bc-axis-horizontal .tick text')
  await expect(labels.first()).toBeVisible()
  const count = await labels.count()
  for (let i = 0; i < count; i++) {
    const box = await labels.nth(i).boundingBox()
    expect(box, `label ${i} has no box`).not.toBeNull()
    // Rotated 90°, the label's own length runs down the y axis.
    expect(box!.height, `label ${i} is clipped`).toBeGreaterThan(30)
    expect(box!.y + box!.height, `label ${i} overflows the svg`).toBeLessThanOrEqual(svgBox!.y + svgBox!.height + 1)
  }
})
