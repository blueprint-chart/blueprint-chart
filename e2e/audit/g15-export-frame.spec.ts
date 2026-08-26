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

test.describe('G15 PNG download', () => {
  test('downloads a PNG instead of failing on a tainted canvas', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', err => pageErrors.push(err.message))

    await page.goto('/')
    await page.evaluate(({ id, dsl }) => {
      localStorage.setItem(`blueprint-chart:${id}`, dsl)
      localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: new Date().toISOString() }))
    }, { id: EXPORT_ID, dsl: EXPORT_DSL })

    await page.goto(`/#/edit/${EXPORT_ID}/export`)
    // The route lives in the fragment, so the hop from `/` is a same-document
    // navigation: reload to actually mount the export step.
    await page.reload()
    const preview = page.locator('.export-panel__canvas__preview')
    await expect(preview.locator('.bc-frame-body svg')).toBeVisible({ timeout: 10_000 })

    await page.locator('[title="Download"], [aria-label="Download"]').first().click()
    const pngCard = page.locator('.format-card').filter({ hasText: 'PNG' })
    await expect(pngCard).toBeVisible()

    const download = page.waitForEvent('download', { timeout: 15_000 })
    await pngCard.getByRole('button', { name: 'Download' }).click()
    expect((await download).suggestedFilename()).toBe('chart.png')

    expect(pageErrors.filter(e => e.includes('Tainted'))).toHaveLength(0)
  })
})
