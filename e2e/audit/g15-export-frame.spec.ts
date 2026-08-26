import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

// #87: the plot SVG carried only width and height — no role, no accessible
// name, no <title>, no <desc> — so a screen reader announced nothing about the
// graphic or its data.
const TITLED = `chart bar-vertical {
  title = "Coal still generates a third of the world's electricity"
  description = "Share by source, 2024"

  data {
    "Coal" = 34.2
    "Natural Gas" = 22.1
    "Hydro" = 14.8
  }
}`

const UNTITLED = `chart bar-vertical {
  data {
    "Coal" = 34.2
    "Natural Gas" = 22.1
  }
}`

test.describe('G15 chart accessibility', () => {
  test('the rendered plot is one named graphic with a title and a description', async ({ page }) => {
    await gotoRender(page, TITLED)
    const svg = page.locator('.bc-frame-body svg')
    await expect(svg).toBeVisible()

    await expect(svg).toHaveAttribute('role', 'img')
    await expect(svg).toHaveAttribute('aria-label', "Coal still generates a third of the world's electricity")
    await expect(svg.locator('> title')).toHaveText("Coal still generates a third of the world's electricity")

    const desc = await svg.locator('> desc').textContent()
    expect(desc).toContain('Share by source, 2024')
    expect(desc).toContain('3 categories')
  })

  test('an untitled chart still gets an accessible name and a data summary', async ({ page }) => {
    await gotoRender(page, UNTITLED)
    const svg = page.locator('.bc-frame-body svg')
    await expect(svg).toHaveAttribute('aria-label', 'bar vertical chart')
    await expect(svg.locator('> desc')).toContainText('2 categories')
  })
})

// #69: PNG download always threw "Tainted canvases may not be exported" from an
// uncaught promise, so the button silently did nothing.
const EXPORT_DSL = `chart bar-vertical {
  title = "Coal still generates a third"
  description = "Share by source, 2024"
  source = "IEA"

  data {
    "Coal" = 34.2
    "Natural Gas" = 22.1
    "Hydro" = 14.8
  }
}`

const EXPORT_ID = 'test-g15-png-export'
// The panel's own default (stores/exportPanel.ts).
const PNG_SCALE = 2

test.describe('G15 PNG download', () => {
  test('downloads a PNG the browser can decode instead of tainting the canvas', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', err => pageErrors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(({ id, dsl }) => {
      localStorage.setItem(`blueprint-chart:${id}`, dsl)
      localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: new Date().toISOString() }))
    }, { id: EXPORT_ID, dsl: EXPORT_DSL })

    await page.goto(`/#/edit/${EXPORT_ID}/export`)
    await page.waitForLoadState('networkidle')
    const card = page.locator('.export-panel__canvas__card')
    await expect(card.locator('.bc-frame-body svg')).toBeVisible({ timeout: 20_000 })

    await page.locator('[title="Download"], [aria-label="Download"]').first().click()
    const pngCard = page.locator('.format-card').filter({ hasText: 'PNG' })
    await expect(pngCard).toBeVisible()

    const downloading = page.waitForEvent('download', { timeout: 15_000 })
    await pngCard.getByRole('button', { name: 'Download' }).click()
    const download = await downloading
    expect(download.suggestedFilename()).toBe('chart.png')

    const png = readFileSync(await download.path())
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
    // IHDR width/height, straight off the exported bytes.
    const box = (await card.boundingBox())!
    expect(png.readUInt32BE(16)).toBe(Math.ceil(box.width) * PNG_SCALE)
    expect(png.readUInt32BE(20)).toBe(Math.ceil(box.height) * PNG_SCALE)

    // A blank canvas is still a valid PNG, so decode it back and count colours:
    // the bars, the axis and the headline text all have to have rasterised.
    const colours = await page.evaluate(async (base64) => {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }))
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
      const seen = new Set<number>()
      for (let i = 0; i < data.length; i += 4) {
        seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2])
      }
      return seen.size
    }, png.toString('base64'))
    expect(colours).toBeGreaterThan(3)

    expect(pageErrors).toEqual([])
    await expect(page.locator('.export-download-panel .alert')).toBeHidden()
  })
})
