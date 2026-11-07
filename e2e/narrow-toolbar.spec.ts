import { test, expect } from '@playwright/test'
import { urlSafeB64Encode } from './support/bpc64'

test.use({ viewport: { width: 360, height: 640 } })

// #120: at narrow widths the floating undo/redo/view toolbar was absolutely
// positioned over the canvas frame and hid part of a wrapping headline.
const LONG_TITLE = `chart bar-vertical {
  title = "Brazil produces more coffee than any other country on the planet"
  data {
    "Brazil" = 10
    "Vietnam" = 6
  }
}`

function overlapArea(a: { x: number, y: number, width: number, height: number }, b: { x: number, y: number, width: number, height: number }): number {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return Math.max(0, w) * Math.max(0, h)
}

test('the view toolbar does not paint over the chart title at 360px (#120)', async ({ page }) => {
  await page.goto(`/#/copy?bpc64=${urlSafeB64Encode(LONG_TITLE)}`)
  await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)

  const title = page.locator('.bc-frame-title')
  await expect(title).toBeVisible()
  const toolbar = page.locator('.chart-edit-toolbar')
  await expect(toolbar).toBeVisible()

  const titleBox = (await title.boundingBox())!
  const toolbarBox = (await toolbar.boundingBox())!
  expect(overlapArea(titleBox, toolbarBox), 'toolbar paints over the title').toBe(0)
})

test('the view toolbar floats on the canvas right above the chart at 360px', async ({ page }) => {
  await page.goto(`/#/copy?bpc64=${urlSafeB64Encode(LONG_TITLE)}`)
  await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)

  const card = page.locator('.chart-edit-panel__canvas__card')
  await expect(card).toBeVisible()
  const canvasBox = (await page.locator('.chart-edit-panel__canvas').boundingBox())!
  const toolbarBox = (await page.locator('.chart-edit-toolbar').boundingBox())!
  const cardBox = (await card.boundingBox())!

  expect(toolbarBox.y, 'toolbar sits on the canvas').toBeGreaterThanOrEqual(canvasBox.y)
  expect(cardBox.y - (toolbarBox.y + toolbarBox.height), 'gap between toolbar and chart').toBeLessThanOrEqual(12)
})

test('the view toolbar stays clear of the code at 360px', async ({ page }) => {
  await page.goto(`/#/copy?bpc64=${urlSafeB64Encode(LONG_TITLE)}`)
  await page.waitForURL(/#\/edit\/[a-zA-Z0-9]{11}\/visualize$/)

  await page.locator('.chart-edit-toolbar [aria-label="View options"]').click()
  await page.locator('.canvas-view-picker').getByText('BPC', { exact: true }).click()
  await page.keyboard.press('Escape')

  const code = page.locator('.chart-edit-dsl')
  await expect(code).toBeVisible()
  const codeBox = (await code.boundingBox())!
  const toolbarBox = (await page.locator('.chart-edit-toolbar').boundingBox())!
  expect(overlapArea(codeBox, toolbarBox), 'toolbar paints over the code').toBe(0)
})
