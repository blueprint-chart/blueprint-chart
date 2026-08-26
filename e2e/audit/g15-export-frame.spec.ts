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
