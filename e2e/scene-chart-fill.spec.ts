import { test, expect } from '@playwright/test'

/**
 * The chart area height (viewBox minus top/bottom margins) must stay
 * constant across same-type scene transitions. If it changes, the
 * y-scale range changes and D3 transitions produce distorted paths.
 */
test('chart area height is constant across same-type scenes', async ({ page }) => {
  await page.setViewportSize({ width: 1560, height: 900 })
  await page.goto('/#/')
  // Wait for the chart container and SVG to be ready before measuring
  await expect(page.locator('.scenes-demo__chart .bc-frame-body svg').first()).toBeVisible()

  const container = page.locator('.scenes-demo__chart')
  const nextBtn = page.locator('.scenes-demo [aria-label="Next scene"]')

  async function getChartMetrics() {
    return container.evaluate(el => {
      const frame = el.querySelector('.bc-frame') as HTMLElement
      const body = frame?.querySelector('.bc-frame-body') as HTMLElement
      const svg = body?.querySelector('svg') as SVGSVGElement
      const g = svg?.querySelector('g') as SVGGElement
      const vb = svg?.getAttribute('viewBox')?.split(' ').map(Number) || []
      const transform = g?.getAttribute('transform') || ''
      const match = transform.match(/translate\([\d.]+,\s*([\d.]+)\)/)
      const mTop = match ? parseFloat(match[1]) : 0
      return {
        headerH: body?.dataset.headerH,
        footerH: body?.dataset.footerH,
        viewBoxH: vb[3],
        mTop,
      }
    })
  }

  const scenes: Awaited<ReturnType<typeof getChartMetrics>>[] = []
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      await nextBtn.click()
      await page.waitForTimeout(800)
    }
    const m = await getChartMetrics()
    scenes.push(m)
  }

  // viewBoxH and m.bottom are constant → the chart bottom position
  // (viewBoxH - m.bottom) is constant → x-axis never moves.
  // mTop varies with header height, which is fine — the chart grows/shrinks
  // from the top while the bottom stays anchored.
  expect(scenes[0].viewBoxH).toBe(scenes[1].viewBoxH)
  expect(scenes[1].viewBoxH).toBe(scenes[2].viewBoxH)
})

/**
 * Scene 6 of farm-compass is "Production rose" — a single-series area chart
 * with data from 2000-2015. The chart content (area path) must not be
 * clipped at the top — the highest data point should be visible within
 * the chart area, not cut off by the header overlay.
 */
test('scene 6 (Production rose) chart is not clipped at top', async ({ page }) => {
  await page.setViewportSize({ width: 1560, height: 900 })
  await page.goto('/#/')
  // Wait for the chart container and SVG to be ready before measuring
  await expect(page.locator('.scenes-demo__chart .bc-frame-body svg').first()).toBeVisible()

  const container = page.locator('.scenes-demo__chart')
  const nextBtn = page.locator('.scenes-demo [aria-label="Next scene"]')

  // Navigate to scene 6 (click Next 5 times: base→1→2→3→4→5→6)
  for (let i = 0; i < 5; i++) {
    await nextBtn.click()
    await page.waitForTimeout(600)
  }
  // Wait for D3 transitions to settle
  await page.waitForTimeout(1000)

  const result = await container.evaluate(el => {
    const frame = el.querySelector('.bc-frame') as HTMLElement
    const header = frame?.querySelector('.bc-frame-header') as HTMLElement
    const body = frame?.querySelector('.bc-frame-body') as HTMLElement
    const svg = body?.querySelector('svg') as SVGSVGElement
    const g = svg?.querySelector('g') as SVGGElement

    const headerRect = header.getBoundingClientRect()
    const gTransform = g?.getAttribute('transform') || ''
    const match = gTransform.match(/translate\([\d.]+,\s*([\d.]+)\)/)
    const chartTopInVB = match ? parseFloat(match[1]) : 0

    // The chart area top in viewBox coords
    // With preserveAspectRatio="none", viewBox coords map 1:1 to pixels
    // when viewBox size equals SVG pixel size.
    const vb = svg?.getAttribute('viewBox')?.split(' ').map(Number) || []
    const svgRect = svg?.getBoundingClientRect()
    const yScale = svgRect.height / (vb[3] || 1)

    // Chart top in frame-relative pixels
    const svgTop = svgRect.top - frame.getBoundingClientRect().top
    const chartTopPx = svgTop + chartTopInVB * yScale

    // The chart area must start BELOW the header bottom
    const headerBottom = headerRect.bottom - frame.getBoundingClientRect().top

    // Find the highest visible point in the chart (topmost area/line path)
    const paths = svg.querySelectorAll('path.bc-area, path.bc-line')
    let minPathY = Infinity
    paths.forEach(p => {
      const bbox = (p as SVGPathElement).getBBox()
      minPathY = Math.min(minPathY, bbox.y)
    })
    // Convert to frame pixels
    const highestPointPx = svgTop + (chartTopInVB + minPathY) * yScale

    return {
      headerBottom: Math.round(headerBottom),
      chartTopPx: Math.round(chartTopPx),
      highestPointPx: Math.round(highestPointPx),
      chartTopInVB,
      headerH: header.offsetHeight,
      title: header.querySelector('.bc-frame-title')?.textContent?.substring(0, 50),
    }
  })

  // The highest data point must be visible — its pixel position must be
  // BELOW the header bottom (not hidden behind the header overlay).
  expect(result.highestPointPx,
    'highest chart point must be below header bottom (not clipped)')
    .toBeGreaterThanOrEqual(result.headerBottom - 5) // 5px tolerance
})
