import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

type Box = { x: number, y: number, width: number, height: number }

function overlapArea(a: Box, b: Box): number {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return Math.max(0, w) * Math.max(0, h)
}

function manyCategories(count: number): string {
  return Array.from({ length: count }, (_, i) => `    "Cat ${String(i + 1).padStart(2, '0')}" = ${i + 1},${count - i}`).join('\n')
}

// #41 symptom 1: with a side legend the wrap decision was made against the
// pre-legend plot width, so labels that wrap fine with a top legend rendered
// as one overlapping run.
const SIDE_LEGEND = `chart bar-multi {
  legend = true
  legendPosition = "right"
  data {
    series = "Alpha","Beta"
${manyCategories(25)}
  }
}`

test('side legend keeps category labels legible (#41)', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 500 })
  await gotoRender(page, SIDE_LEGEND)
  const labels = page.locator('.bc-axis-horizontal .tick text')
  await expect(labels.first()).toBeVisible()
  const count = await labels.count()
  expect(count, 'axis lost its category labels').toBeGreaterThan(0)
  const boxes: Box[] = []
  for (let i = 0; i < count; i++) {
    const box = await labels.nth(i).boundingBox()
    if (box) {
      boxes.push(box)
    }
  }
  let overlapping = 0
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const smaller = Math.min(boxes[i].width * boxes[i].height, boxes[j].width * boxes[j].height)
      if (overlapArea(boxes[i], boxes[j]) > smaller * 0.25) {
        overlapping++
      }
    }
  }
  expect(overlapping, `${overlapping} label pairs overlap`).toBe(0)
})

// #41 symptom 2: the bottom legend is drawn a fixed 25px below the plot, so
// category labels wrapped to a second line sit under the legend row.
const BOTTOM_LEGEND = (type: string) => `chart ${type} {
  legend = true
  legendPosition = "bottom"
  data {
    series = "Alpha","Beta"
    "Northern Region" = 10,12
    "Southern Region" = 8,9
    "Eastern Region" = 6,14
    "Western Region" = 12,7
    "Central Region" = 9,10
    "Coastal Region" = 11,8
  }
}`

for (const type of ['bar-multi', 'column-stacked', 'line-multi', 'area-stacked']) {
  test(`bottom legend stays clear of wrapped category labels: ${type} (#41)`, async ({ page }) => {
    await page.setViewportSize({ width: 560, height: 480 })
    await gotoRender(page, BOTTOM_LEGEND(type))
    const legend = page.locator('.bc-legend')
    await expect(legend).toBeVisible()
    const legendBox = (await legend.boundingBox())!
    const labels = page.locator('.bc-axis-horizontal .tick text')
    const count = await labels.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const box = await labels.nth(i).boundingBox()
      if (box) {
        expect(overlapArea(box, legendBox), `legend paints over label ${i}`).toBe(0)
      }
    }
  })
}

// #41 review: the legend used to be placed from the requested label height,
// so when fitMargins scales a too-tall bottom margin down (short fixed-height
// frame + rotated labels) the legend landed past the SVG bottom edge.
const SHORT_FRAME = `chart bar-multi {
  legend = true
  legendPosition = "bottom"
  heightMode = "fixed"
  fixedHeight = 220
  horizontalLabelRotation = "vertical"
  data {
    series = "Alpha","Beta"
    "Uncompromisingly-Long-Unbreakable-Category-One" = 4,6
    "Another-Unbreakable-Category-Label-Number-Two" = 7,3
    "Yet-Another-Overlong-Unbreakable-Category-Three" = 5,8
  }
}`

test('bottom legend stays inside a short fixed-height frame (#41)', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 480 })
  await gotoRender(page, SHORT_FRAME)
  const svgBox = (await page.locator('.bc-frame svg').first().boundingBox())!
  const legend = page.locator('.bc-legend')
  await expect(legend).toBeVisible()
  const legendBox = (await legend.boundingBox())!
  expect(legendBox.y + legendBox.height, 'legend clipped past the svg bottom')
    .toBeLessThanOrEqual(svgBox.y + svgBox.height + 1)
})

// #41 review: with hidden axis labels the reserved bottom collapsed to 5px,
// welding the legend to the axis line instead of keeping the old gap.
const NO_LABELS = `chart bar-multi {
  legend = true
  legendPosition = "bottom"
  horizontalLabelPosition = "off"
  data {
    series = "Alpha","Beta"
    "A" = 4,6
    "B" = 7,3
  }
}`

test('bottom legend keeps a gap below the plot when labels are off (#41)', async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 480 })
  await gotoRender(page, NO_LABELS)
  const legendBox = (await page.locator('.bc-legend').boundingBox())!
  const barBoxes = await page.locator('.bc-bar-multi').evaluateAll(els => els.map(el => el.getBoundingClientRect().bottom))
  const plotBottom = Math.max(...barBoxes)
  expect(legendBox.y - plotBottom, 'legend welded to the axis').toBeGreaterThanOrEqual(15)
})
