import { test, expect, type Page } from '@playwright/test'

/**
 * Chart rendering regression tests.
 *
 * Each test loads a sample BPC via the /render route (base64-encoded)
 * and validates that the chart renders correctly with the expected visual
 * properties — colors, grid lines, axes, labels, etc.
 *
 * These tests were introduced to catch CSS regressions from the chart.scss
 * extraction: CSS rules must not override D3's data-driven SVG attributes.
 */

const SAMPLES = {
  barVertical: {
    id: 'letter-frequency',
    bpc: `chart bar-vertical {
  title = "Letter Frequency"
  colors = "#e15759"

  highlight "E" {
    color = "#22c55e"
  }

  data {
    "E" = 12.70
    "T" = 9.06
    "A" = 8.17
  }
}`,
  },

  barMulti: {
    id: 'quarterly-revenue',
    bpc: `chart bar-multi {
  title = "Revenue by Segment"
  colors = "#e15759,#4e79a7,#f28e2b"

  data {
    _series = "HW,SW,SV"
    "Q1" = "14,10,7"
    "Q2" = "13,11,8"
  }
}`,
  },

  lineMulti: {
    id: 'unemployment-rates',
    bpc: `chart line-multi {
  title = "Unemployment Rates"
  colors = "#e15759,#4e79a7"

  data {
    _series = "US,UK"
    "2020" = "8.1,4.5"
    "2021" = "5.4,4.5"
    "2022" = "3.6,3.7"
  }
}`,
  },

  donut: {
    id: 'donut-test',
    bpc: `chart donut {
  title = "Market Share"
  colors = "#e15759,#4e79a7,#f28e2b"

  data {
    "A" = 50
    "B" = 30
    "C" = 20
  }
}`,
  },

  barWithHighlight: {
    id: 'bar-highlight',
    bpc: `chart bar-vertical {
  title = "Highlighted Bar"
  colors = "#4e79a7"

  highlight "B" {
    color = "#e15759"
  }

  data {
    "A" = 10
    "B" = 20
    "C" = 15
  }
}`,
  },

  lineWithGrid: {
    id: 'line-grid',
    bpc: `chart line-multi {
  title = "With Grid"
  colors = "#e15759,#4e79a7"
  verticalGridStyle = dashed

  data {
    _series = "X,Y"
    "2020" = "10,20"
    "2021" = "15,25"
    "2022" = "20,30"
  }
}`,
  },
}

function bpc64(bpc: string): string {
  return Buffer.from(bpc).toString('base64')
}

async function gotoChart(page: Page, bpc: string) {
  await page.goto(`/#/render?bpc64=${bpc64(bpc)}`)
  await page.waitForSelector('.bc-frame', { timeout: 10_000 })
}

// ---------------------------------------------------------------------------
// Frame rendering
// ---------------------------------------------------------------------------

test.describe('chart frame', () => {
  test('renders frame elements', async ({ page }) => {
    await gotoChart(page, SAMPLES.barVertical.bpc)

    await expect(page.locator('.bc-frame')).toBeVisible()
    await expect(page.locator('.bc-frame-title')).toHaveText('Letter Frequency')
    await expect(page.locator('.bc-frame-body svg')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Bar chart colors
// ---------------------------------------------------------------------------

test.describe('bar chart colors', () => {
  test('bars use the specified colors, not a CSS fallback', async ({ page }) => {
    await gotoChart(page, SAMPLES.barVertical.bpc)

    const bars = page.locator('.bc-bar')
    const count = await bars.count()
    expect(count).toBe(3)

    // The "E" bar is highlighted green, others use the chart color #e15759
    for (let i = 0; i < count; i++) {
      const fill = await bars.nth(i).evaluate(
        el => getComputedStyle(el).fill || el.getAttribute('fill'),
      )
      expect(fill).toBeTruthy()
      // Ensure no bar has the chart.scss fallback blue #4e79a7
      expect(fill).not.toContain('78, 121, 167') // rgb for #4e79a7
    }
  })

  test('highlight color overrides the default bar color', async ({ page }) => {
    await gotoChart(page, SAMPLES.barWithHighlight.bpc)

    const bars = page.locator('.bc-bar')

    // Find the bar for "B" — it should be red #e15759, not default blue #4e79a7
    const fills = await bars.evaluateAll(els =>
      els.map(el => ({
        fill: el.getAttribute('fill'),
        style: (el as SVGElement).style.fill,
        computed: getComputedStyle(el).fill,
      })),
    )

    // At least one bar should have the highlight color #e15759
    const hasHighlight = fills.some(
      f => (f.fill?.includes('#e15759') || f.style?.includes('#e15759')
        || f.computed?.includes('225, 87, 89')), // rgb for #e15759
    )
    expect(hasHighlight).toBe(true)

    // The other bars should have #4e79a7
    const hasDefault = fills.some(
      f => (f.fill?.includes('#4e79a7') || f.style?.includes('#4e79a7')
        || f.computed?.includes('78, 121, 167')), // rgb for #4e79a7
    )
    expect(hasDefault).toBe(true)
  })

  test('multi-series bars have distinct colors per series', async ({ page }) => {
    await gotoChart(page, SAMPLES.barMulti.bpc)

    const bars = page.locator('.bc-bar')
    const fills = await bars.evaluateAll(els =>
      els.map(el => el.getAttribute('fill') || getComputedStyle(el).fill),
    )

    // We should have multiple distinct fill values (at least 2 different colors)
    const uniqueFills = new Set(fills)
    expect(uniqueFills.size).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Line chart colors
// ---------------------------------------------------------------------------

test.describe('line chart colors', () => {
  test('line paths have distinct stroke colors', async ({ page }) => {
    await gotoChart(page, SAMPLES.lineMulti.bpc)

    const lines = page.locator('.bc-line')
    const count = await lines.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const strokes = await lines.evaluateAll(els =>
      els.map(el => el.getAttribute('stroke') || getComputedStyle(el).stroke),
    )

    const uniqueStrokes = new Set(strokes)
    expect(uniqueStrokes.size).toBeGreaterThanOrEqual(2)
  })

  test('line paths have fill=none', async ({ page }) => {
    await gotoChart(page, SAMPLES.lineMulti.bpc)

    const lines = page.locator('.bc-line')
    const count = await lines.count()
    expect(count).toBeGreaterThanOrEqual(1)

    for (let i = 0; i < count; i++) {
      const fill = await lines.nth(i).evaluate(
        el => getComputedStyle(el).fill,
      )
      expect(fill).toBe('none')
    }
  })
})

// ---------------------------------------------------------------------------
// Grid lines
// ---------------------------------------------------------------------------

test.describe('grid lines', () => {
  test('grid lines are visible with a stroke color', async ({ page }) => {
    await gotoChart(page, SAMPLES.lineWithGrid.bpc)

    const gridLines = page.locator('.bc-grid-line')
    const count = await gridLines.count()
    expect(count).toBeGreaterThan(0)

    // Each grid line should have a non-transparent stroke
    for (let i = 0; i < Math.min(count, 3); i++) {
      const stroke = await gridLines.nth(i).evaluate(
        el => getComputedStyle(el).stroke,
      )
      expect(stroke).toBeTruthy()
      expect(stroke).not.toBe('none')
      expect(stroke).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('grid lines use the muted grid color, not the axis color', async ({ page }) => {
    await gotoChart(page, SAMPLES.lineWithGrid.bpc)

    const gridLines = page.locator('.bc-grid-line')
    const count = await gridLines.count()
    expect(count).toBeGreaterThan(0)

    // Grid lines should use --bc-grid-color (#e0e0e0 in light mode = rgb(224, 224, 224))
    // NOT --bc-axis-color (#333 = rgb(51, 51, 51))
    const stroke = await gridLines.first().evaluate(
      el => getComputedStyle(el).stroke,
    )
    // Must not be the dark axis color
    expect(stroke).not.toBe('rgb(51, 51, 51)')
    // Should be a light/muted color (high RGB values)
    const match = stroke.match(/rgb\((\d+), (\d+), (\d+)\)/)
    expect(match).toBeTruthy()
    const [, r, g, b] = match!.map(Number)
    // Grid color should be significantly lighter than axis color (#333 = 51)
    expect(Math.min(r, g, b)).toBeGreaterThan(150)
  })
})

// ---------------------------------------------------------------------------
// Axes
// ---------------------------------------------------------------------------

test.describe('axes', () => {
  test('axis tick text is visible', async ({ page }) => {
    await gotoChart(page, SAMPLES.barMulti.bpc)

    const ticks = page.locator('.bc-axis .tick text')
    const count = await ticks.count()
    expect(count).toBeGreaterThan(0)

    // Tick text should have a non-transparent fill
    const fill = await ticks.first().evaluate(
      el => getComputedStyle(el).fill,
    )
    expect(fill).toBeTruthy()
    expect(fill).not.toBe('none')
    expect(fill).not.toBe('rgba(0, 0, 0, 0)')
  })
})

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

test.describe('legend', () => {
  test('legend items have correct series colors', async ({ page }) => {
    await gotoChart(page, SAMPLES.barMulti.bpc)

    const legendRects = page.locator('.bc-legend-item rect')
    const count = await legendRects.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const fills = await legendRects.evaluateAll(els =>
      els.map(el => el.getAttribute('fill')),
    )

    // Legend rects should have the chart colors, not overridden by CSS
    const uniqueFills = new Set(fills)
    expect(uniqueFills.size).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Donut chart
// ---------------------------------------------------------------------------

test.describe('donut chart', () => {
  test('arcs have distinct fill colors', async ({ page }) => {
    await gotoChart(page, SAMPLES.donut.bpc)

    const arcs = page.locator('.bc-arc')
    const count = await arcs.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const fills = await arcs.evaluateAll(els =>
      els.map(el => el.getAttribute('fill') || getComputedStyle(el).fill),
    )

    const uniqueFills = new Set(fills)
    expect(uniqueFills.size).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// All samples render without errors
// ---------------------------------------------------------------------------

const ALL_SAMPLE_BPCS: [string, string][] = [
  ['bar-vertical simple', `chart bar-vertical { title = "Test" data { "A" = 10 "B" = 20 } }`],
  ['bar-horizontal simple', `chart bar-horizontal { title = "Test" data { "A" = 10 "B" = 20 } }`],
  ['bar-multi simple', `chart bar-multi { title = "Test" data { _series = "X,Y" "A" = "10,20" "B" = "15,25" } }`],
  ['line simple', `chart line { title = "Test" data { "2020" = 10 "2021" = 20 } }`],
  ['line-multi simple', `chart line-multi { title = "Test" data { _series = "X,Y" "2020" = "10,20" "2021" = "15,25" } }`],
  ['donut simple', `chart donut { title = "Test" data { "A" = 60 "B" = 40 } }`],
  ['pie simple', `chart pie { title = "Test" data { "A" = 60 "B" = 40 } }`],
]

test.describe('all chart types render', () => {
  for (const [name, bpc] of ALL_SAMPLE_BPCS) {
    test(`${name} renders a chart`, async ({ page }) => {
      await gotoChart(page, bpc)

      await expect(page.locator('.bc-frame')).toBeVisible()
      await expect(page.locator('.bc-frame-body svg')).toBeVisible()
    })
  }
})
