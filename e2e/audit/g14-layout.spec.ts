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

// #31: the constrained-mode frame header is not reserved — a long wrapped
// title overflows the frame and the pinned footer paints on top of it.
const LONG_TITLE = `chart donut {
  heightMode = "aspect-ratio"
  aspectRatio = "16:9"
  title = "An exceedingly long chart title that wraps over many and many lines at a narrow viewport width and used to overflow the whole constrained frame"
  description = "A description that adds a couple more lines of header text below the already oversized title"
  source = "UN"
  data {
    "A" = 50
    "B" = 50
  }
}`

test('a long title stays clear of the footer in a constrained frame (#31)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await gotoRender(page, LONG_TITLE)
  const frameBox = (await page.locator('.bc-frame').boundingBox())!
  const headerBox = (await page.locator('.bc-frame-header').boundingBox())!
  const footerBox = (await page.locator('.bc-frame-footer').boundingBox())!
  expect(headerBox.y + headerBox.height, 'header runs into the footer')
    .toBeLessThanOrEqual(footerBox.y + 1)
  expect(headerBox.y + headerBox.height, 'header overflows the frame')
    .toBeLessThanOrEqual(frameBox.y + frameBox.height + 1)
  const arc = page.locator('.bc-arc').first()
  await expect(arc, 'no chart is rendered at all').toBeVisible()
})
