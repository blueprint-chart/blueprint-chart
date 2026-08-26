import { test, expect } from '@playwright/test'
import { gotoRender } from '../support/render'

// Tick label text of the vertical value axis, parsed back to numbers.
async function verticalTickValues(page): Promise<number[]> {
  return page.evaluate(() => Array.from(
    document.querySelectorAll('.bc-frame .bc-axis-vertical .tick text'),
    // d3-format writes a unicode minus, which Number() rejects.
    el => Number((el.textContent ?? '').replace(/\u2212/g, '-').replace(/[^0-9.eE+-]/g, '')),
  ).filter(n => Number.isFinite(n)))
}

// Every numeric coordinate of the first line path, so a flattened or empty
// series is distinguishable from a series that actually spans the plot.
async function linePathPoints(page): Promise<number[]> {
  return page.evaluate(() => {
    const path = document.querySelector('.bc-frame .bc-line')
    const d = path?.getAttribute('d') ?? ''
    return Array.from(d.matchAll(/-?\d+(?:\.\d+)?/g), m => Number(m[0]))
  })
}

test.describe('G4 axis domain', () => {
  // #14 trigger 1: on a value axis a 4-digit bound is the number 2000, not
  // Jan 1 2000 in epoch ms.
  test('a 4-digit value-axis bound is a number, not a year', async ({ page }) => {
    await gotoRender(page, `chart line {
  verticalRangeMax = "2000"
  data {
    "A" = 400
    "B" = 1600
  }
}`)
    await expect(page.locator('.bc-frame .bc-line')).toBeVisible()

    const ticks = await verticalTickValues(page)
    expect(Math.max(...ticks)).toBeLessThanOrEqual(2000)

    const ys = (await linePathPoints(page)).filter((_, i) => i % 2 === 1)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(50)
  })

  // #14 trigger 2: a plain number cannot be compared against date-detected
  // category labels, so it must be ignored rather than filtering every row out.
  test('a non-date bound on a date-detected category axis keeps the marks', async ({ page }) => {
    await gotoRender(page, `chart line {
  horizontalRangeMax = "950"
  data {
    "2015" = 10
    "2016" = 20
  }
}`)
    await expect(page.locator('.bc-frame .bc-line')).toBeVisible()

    const points = await linePathPoints(page)
    expect(points.length).toBeGreaterThanOrEqual(4)

    const ticks = await verticalTickValues(page)
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(20)
  })

  // #14 trigger 2, control: a date bound on the same axis must still filter.
  test('a date bound on a date-detected category axis still filters', async ({ page }) => {
    await gotoRender(page, `chart line {
  horizontalRangeMax = "2015"
  data {
    "2015" = 10
    "2016" = 20
  }
}`)
    await expect(page.locator('.bc-frame .bc-axis-horizontal .tick')).toHaveCount(1)

    const labels = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-axis-horizontal .tick text'),
      el => el.textContent,
    ))
    expect(labels).toEqual(['2015'])
  })

  // #17: with no range option set, an all-negative series must widen the
  // implicit zero baseline downward instead of collapsing to [0, 1].
  test('an all-negative bar chart draws its bars inside the plot', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  data {
    "Alpha" = -42
    "Beta" = -63
  }
}`)
    const bars = page.locator('.bc-frame .bc-bar')
    await expect(bars).toHaveCount(2)

    const heights = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-bar'),
      el => Number(el.getAttribute('height') ?? '0'),
    ))
    const plotHeight = await page.evaluate(() => (
      document.querySelector('.bc-frame svg')?.getBoundingClientRect().height ?? 0
    ))
    expect(Math.max(...heights)).toBeLessThanOrEqual(plotHeight)
    expect(Math.min(...heights)).toBeGreaterThan(0)
    expect(heights[1]).toBeGreaterThan(heights[0])
  })

  // #17: the value axis of an all-negative chart must read negative, not 0…1.
  test('an all-negative value axis reads negative', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  showVerticalAxis = true
  showVerticalTicks = true
  verticalLabelPosition = "outside"
  data {
    "Alpha" = -42
    "Beta" = -63
  }
}`)
    await expect(page.locator('.bc-frame .bc-axis-vertical .tick').first()).toBeAttached()

    const ticks = await verticalTickValues(page)
    expect(Math.min(...ticks)).toBeLessThanOrEqual(-60)
    expect(Math.max(...ticks)).toBe(0)
  })

  // #106: a numeric format belongs to the value axis; on the band axis it
  // formats category strings and every label comes out NaN.
  test('a numeric format leaves horizontal category labels alone', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  horizontalNumberFormat = "$,.0f"
  data {
    "Alpha" = 10
    "Beta" = 20
  }
}`)
    await expect(page.locator('.bc-frame .bc-axis-horizontal .tick').first()).toBeAttached()

    const labels = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-axis-horizontal .tick text'),
      el => el.textContent,
    ))
    expect(labels).toEqual(['Alpha', 'Beta'])
  })

  // #106: same defect on the vertical band axis of the horizontal-bar family.
  test('a numeric format leaves vertical category labels alone', async ({ page }) => {
    await gotoRender(page, `chart bar-horizontal {
  verticalNumberFormat = ".0%"
  data {
    "Alpha" = 10
    "Beta" = 20
  }
}`)
    await expect(page.locator('.bc-frame .bc-axis-vertical .tick').first()).toBeAttached()

    const labels = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-axis-vertical .tick text'),
      el => el.textContent,
    ))
    expect(labels).toEqual(['Alpha', 'Beta'])
  })

  // #106: year categories must not be re-formatted as numbers either.
  test('a numeric format leaves year category labels alone', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  horizontalNumberFormat = ",.0f"
  data {
    "2015" = 10
    "2016" = 20
  }
}`)
    await expect(page.locator('.bc-frame .bc-axis-horizontal .tick').first()).toBeAttached()

    const labels = await page.evaluate(() => Array.from(
      document.querySelectorAll('.bc-frame .bc-axis-horizontal .tick text'),
      el => el.textContent,
    ))
    expect(labels).toEqual(['2015', '2016'])
  })

  // #71: the vertical grid was appended on every render, so one grid line per
  // tick became two, and `none` could not clear what an earlier style drew.
  test('the vertical grid is joined, not stacked, across renders', async ({ page }) => {
    await gotoRender(page, `chart bar-vertical {
  verticalGridStyle = "solid"
  showVerticalAxis = true
  showVerticalTicks = true
  data {
    "A" = 10
    "B" = 20
  }
  scene "dashed" {
    verticalGridStyle = "dashed"
  }
  scene "off" {
    verticalGridStyle = "none"
  }
}`)
    const gridLines = page.locator('.bc-frame .bc-axis-vertical .bc-grid-line')
    const ticks = page.locator('.bc-frame .bc-axis-vertical .tick')
    const tickCount = await ticks.count()
    expect(tickCount).toBeGreaterThan(0)
    await expect(gridLines).toHaveCount(tickCount)

    const next = page.locator('[aria-label="Next scene"]')
    await next.click()
    await expect(gridLines.first()).toHaveAttribute('stroke-dasharray', '4,4')
    await expect(gridLines).toHaveCount(tickCount)

    await next.click()
    await expect(gridLines).toHaveCount(0)
  })
})
