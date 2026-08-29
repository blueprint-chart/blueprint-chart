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

for (const type of ['bar-multi', 'column-stacked']) {
  test(`bottom legend stays clear of wrapped category labels — ${type} (#41)`, async ({ page }) => {
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
