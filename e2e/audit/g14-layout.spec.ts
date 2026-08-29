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

// #6: long category labels are cropped by the canvas bottom edge.
const LONG_CATEGORIES = `chart bar-vertical {
  data {
    "Extraordinarily Long Category Name" = 30
    "Another Very Long Category Label" = 20
  }
}`

test('long category labels stay inside the canvas (#6)', async ({ page }) => {
  await gotoRender(page, LONG_CATEGORIES)
  const svg = page.locator('.bc-frame svg').first()
  const svgBox = (await svg.boundingBox())!
  const labels = page.locator('.bc-axis-horizontal .tick text')
  const count = await labels.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    const box = (await labels.nth(i).boundingBox())!
    expect(box.y + box.height, `label ${i} cropped at the bottom`).toBeLessThanOrEqual(svgBox.y + svgBox.height + 1)
  }
})

// #30: constrained height modes never clamp the plot, so the chart can vanish.
const NARROW_ASPECT = `chart donut {
  heightMode = "aspect-ratio"
  aspectRatio = "21:9"
  legend = true
  showTotal = true
  data {
    "A" = 50
    "B" = 50
  }
}`

test('a constrained aspect ratio still draws a chart (#30)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await gotoRender(page, NARROW_ASPECT)
  const arcs = page.locator('.bc-arc')
  await expect(arcs.first()).toBeVisible()
  const box = (await arcs.first().boundingBox())!
  expect(box.height, 'the arc has no height').toBeGreaterThan(8)
})
