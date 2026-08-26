import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

/**
 * G2 text-measure: layout that reserves space for text must measure it.
 */

const PHONE_DONUT = `chart donut {
  title = "Browser share"

  data {
    "Chrome" = 45
    "Safari" = 25
    "Firefox" = 15
    "Edge browser" = 10
    "Opera mini" = 5
  }
}`

const CJK_LEGEND_PIE = `chart pie {
  title = "CJK legend"
  legend = true

  data {
    "日本語のラベル" = 40
    "Русский текст" = 35
    "中文標籤" = 25
  }
}`

const WRAPPED_URL = `chart bar-vertical {
  data {
    "Alpha" = 30
    "Beta" = 20
  }
  annotation "Alpha" {
    text = "https://example.com/a/very/long/path/to/somewhere"
    maxWidth = 120
  }
}`

test.describe('arc label margins (#29)', () => {
  test('a 5-slice donut still paints usable arcs at 360x640', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await gotoRender(page, PHONE_DONUT)

    const arcs = page.locator('.bc-arc')
    await expect(arcs).toHaveCount(5)
    const radii = await arcs.evaluateAll(els => els.map((el) => {
      const match = /A\s*([-\d.]+)/.exec(el.getAttribute('d') ?? '')
      return match ? Number(match[1]) : 0
    }))
    // A donut whose diameter is under a quarter of the viewport is not a chart.
    expect(Math.min(...radii) * 2).toBeGreaterThan(360 * 0.25)
  })
})

test.describe('legend item width (#35)', () => {
  test('CJK items advance past their own text', async ({ page }) => {
    await gotoRender(page, CJK_LEGEND_PIE)

    const items = await page.locator('.bc-legend-item').evaluateAll(els => els.map((el) => {
      const match = /translate\(([-\d.]+)/.exec(el.getAttribute('transform') ?? '')
      const text = el.querySelector('text') as SVGTextContentElement | null
      return { x: match ? Number(match[1]) : 0, width: text ? text.getComputedTextLength() : 0 }
    }))
    expect(items.length).toBe(3)
    for (let i = 1; i < items.length; i++) {
      expect(items[i].x - items[i - 1].x).toBeGreaterThanOrEqual(items[i - 1].width)
    }
  })

  test('a label wider than the frame is truncated, not clipped', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await gotoRender(page, `chart pie {
  legend = true

  data {
    "Federal Government and Local Government Agencies" = 60
    "Everyone else and their neighbours down the road" = 40
  }
}`)

    const overflow = await page.locator('.bc-legend text').evaluateAll(els => els.map((el) => {
      const text = el as unknown as SVGTextContentElement
      const svg = el.ownerSVGElement as SVGSVGElement
      const right = text.getBoundingClientRect().right
      return right - svg.getBoundingClientRect().right
    }))
    expect(overflow.length).toBe(2)
    for (const px of overflow) {
      expect(px).toBeLessThanOrEqual(1)
    }
  })
})

test.describe('annotation wrapping (#46)', () => {
  test('a URL wraps to its maxWidth', async ({ page }) => {
    await gotoRender(page, WRAPPED_URL)

    const widths = await page.locator('.bc-annotation-text tspan').evaluateAll(
      els => els.map(el => (el as unknown as SVGTextContentElement).getComputedTextLength()),
    )
    expect(widths.length).toBeGreaterThan(1)
    for (const width of widths) {
      expect(width).toBeLessThanOrEqual(120)
    }
  })
})
