import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { HorizontalAxisChart, renderHorizontalAxis, thinLabels, buildTickFormatter, detectDates } from './horizontal-axis'

describe('renderHorizontalAxis', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleBand<string>

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  })

  it('creates a horizontal axis group', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300)
    expect(g.classList.contains('bc-axis-horizontal')).toBe(true)
  })

  it('positions at bottom by default', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300)
    expect(g.getAttribute('transform')).toBe('translate(0,300)')
  })

  it('positions at top when tickPosition is above', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300, { tickPosition: 'above' })
    expect(g.getAttribute('transform')).toBe('translate(0,0)')
  })

  it('keeps domain line as solid by default', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300)
    const domain = g.querySelector('.domain')
    expect(domain).not.toBeNull()
    expect(domain?.getAttribute('stroke-dasharray')).toBeNull()
  })

  it('renders dashed grid lines by default when height > 0', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300, { gridStyle: 'dashed' })
    const gridLines = g.querySelectorAll('.bc-grid-line')
    expect(gridLines.length).toBeGreaterThan(0)
    gridLines.forEach((line) => {
      expect(line.getAttribute('stroke-dasharray')).toBe('4,4')
    })
  })

  it('auto-thins labels when width is provided and domain is large', () => {
    const months = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    const largeScale = d3.scaleBand<string>().domain(months).range([0, 600]).padding(0.1)
    const g = renderHorizontalAxis(chartArea, largeScale, 300, { width: 600 })
    const ticks = g.querySelectorAll('.tick')
    expect(ticks.length).toBeLessThan(months.length)
    expect(ticks.length).toBeGreaterThan(0)
    expect(ticks.length).toBeLessThanOrEqual(11)
  })
})

describe('HorizontalAxisChart merge:transition feature parity', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleBand<string>

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  })

  it('removes tick lines on merge render when showTicks is false', () => {
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 300, labels: ['A', 'B', 'C'], showTicks: false })
    // First draw: enter path
    chart.draw([{ placeholder: true }])
    // Second draw: merge:transition path
    chart.draw([{ placeholder: true }])

    const axisEl = chartArea.querySelector('.bc-axis-horizontal')!
    // .bc-grid-line elements are added by postDraw; exclude them — we're testing tick mark lines
    const tickLines = axisEl.querySelectorAll('.tick line:not(.bc-grid-line)')
    expect(tickLines).toHaveLength(0)
  })

  it('removes tick labels on merge render when labelPosition is off', () => {
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 300, labels: ['A', 'B', 'C'], labelPosition: 'off' })
    chart.draw([{ placeholder: true }])
    chart.draw([{ placeholder: true }])

    const axisEl = chartArea.querySelector('.bc-axis-horizontal')!
    const tickTexts = axisEl.querySelectorAll('.tick text')
    expect(tickTexts).toHaveLength(0)
  })

  it('keeps labels below the axis on narrow widths when labelPosition is auto', () => {
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 200, labels: ['A', 'B', 'C'], labelPosition: 'auto' })
    chart.draw([{ placeholder: true }])
    chart.draw([{ placeholder: true }])

    const axisEl = chartArea.querySelector('.bc-axis-horizontal')!
    const tickTexts = axisEl.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
    tickTexts.forEach((t) => {
      // dy should not be the inside value; y=0 with dy=-0.6em would put labels above axis
      const dy = t.getAttribute('dy')
      expect(dy).not.toBe('-0.6em')
    })
  })

  it('positions labels inside on enter render when labelPosition is inside', () => {
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 300, labels: ['A', 'B', 'C'], labelPosition: 'inside' })
    chart.draw([{ placeholder: true }])

    const axisEl = chartArea.querySelector('.bc-axis-horizontal')!
    const tickTexts = axisEl.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
    tickTexts.forEach((t) => {
      expect(t.getAttribute('y')).toBe('0')
      expect(t.getAttribute('dy')).toBe('-0.6em')
    })
  })

  it('positions labels inside on merge render when labelPosition is inside', () => {
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 300, labels: ['A', 'B', 'C'], labelPosition: 'inside' })
    chart.draw([{ placeholder: true }])
    chart.draw([{ placeholder: true }])

    const axisEl = chartArea.querySelector('.bc-axis-horizontal')!
    const tickTexts = axisEl.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
    tickTexts.forEach((t) => {
      expect(t.getAttribute('y')).toBe('0')
      expect(t.getAttribute('dy')).toBe('-0.6em')
    })
  })
})

describe('thinLabels', () => {
  it('returns all labels when they fit', () => {
    const labels = ['A', 'B', 'C']
    expect(thinLabels(labels, 300)).toEqual(['A', 'B', 'C'])
  })

  it('thins labels when there are too many', () => {
    const labels = Array.from({ length: 100 }, (_, i) => `L${i}`)
    const result = thinLabels(labels, 300)
    // 300px / 60px = 5 max labels → step = ceil(100/5) = 20 → indices 0,20,40,60,80 + last (L99)
    expect(result.length).toBeLessThanOrEqual(6)
    expect(result.length).toBeGreaterThanOrEqual(2)
    // First and last labels are always included
    expect(result[0]).toBe('L0')
    expect(result[result.length - 1]).toBe('L99')
  })

  it('thins 7-char date labels at widths where tick spacing would cause overlap', () => {
    // "2024-01" → formatted "Jan 2024" (~64 px rendered). Without content-aware
    // spacing, 12 labels at 720 px gives 60 px/tick which is under the label width.
    const labels = Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, '0')}`)
    // 720px: minSpacing = max(60, ceil(7*7.5*1.2)+8) = 71 → maxLabels=10 → thin
    const result720 = thinLabels(labels, 720)
    expect(result720.length).toBeLessThan(12)
    expect(result720.length).toBeGreaterThanOrEqual(2)
    // 300px: should thin more aggressively
    const result300 = thinLabels(labels, 300)
    expect(result300.length).toBeLessThan(result720.length)
  })

  it('returns single-element arrays unchanged', () => {
    expect(thinLabels(['A'], 100)).toEqual(['A'])
  })

  it('returns empty arrays unchanged', () => {
    expect(thinLabels([], 100)).toEqual([])
  })

  it('always includes the last label to show the axis endpoint', () => {
    // 50 labels, 180px → maxLabels = max(2, floor(180/60)) = 3
    // step = ceil(50/3) = 17 → indices 0, 17, 34, then last (49) appended
    const labels = Array.from({ length: 50 }, (_, i) => `${2000 + i}`)
    const result = thinLabels(labels, 180)
    expect(result).toEqual(['2000', '2017', '2034', '2049'])
    // The last label is always included so the data range endpoint is visible
  })

  it('produces progressively coarser steps as width shrinks', () => {
    const labels = Array.from({ length: 12 }, (_, i) => `M${i}`)
    // 720px → maxLabels=12 → all fit (no thinning)
    expect(thinLabels(labels, 720)).toEqual(labels)
    // 360px → maxLabels=6 → step=2 → M0,M2,M4,M6,M8,M10 + last=M11
    expect(thinLabels(labels, 360)).toEqual(['M0', 'M2', 'M4', 'M6', 'M8', 'M10', 'M11'])
    // 240px → maxLabels=4 → step=3 → M0,M3,M6,M9 + last=M11
    expect(thinLabels(labels, 240)).toEqual(['M0', 'M3', 'M6', 'M9', 'M11'])
    // 180px → maxLabels=3 → step=4 → M0,M4,M8 + last=M11
    expect(thinLabels(labels, 180)).toEqual(['M0', 'M4', 'M8', 'M11'])
  })
})

describe('detectDates', () => {
  it('detects ISO date labels (YYYY-MM-DD)', () => {
    const result = detectDates(['2024-01-15', '2024-02-20', '2024-03-10'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('day')
    expect(result!.dates).toHaveLength(3)
  })

  it('detects year-month labels (YYYY-MM)', () => {
    const result = detectDates(['2024-01', '2024-02', '2024-03'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('month')
  })

  it('detects year-only labels (YYYY)', () => {
    const result = detectDates(['2020', '2021', '2022'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('year')
  })

  it('detects US date format (M/D/YYYY)', () => {
    const result = detectDates(['1/15/2024', '2/20/2024'])
    expect(result).not.toBeNull()
    expect(result!.granularity).toBe('day')
  })

  it('returns null for non-date labels', () => {
    expect(detectDates(['Apple', 'Banana', 'Cherry'])).toBeNull()
  })

  it('returns null for empty labels', () => {
    expect(detectDates([])).toBeNull()
  })

  it('returns null if some labels do not parse', () => {
    expect(detectDates(['2024-01-15', 'not-a-date'])).toBeNull()
  })
})

describe('buildTickFormatter', () => {
  it('returns d3.timeFormat when format contains %', () => {
    const labels = ['2024-01', '2024-02', '2024-03']
    const fmt = buildTickFormatter('%b %Y', labels)
    expect(fmt).not.toBeNull()
    expect(fmt!('2024-01')).toBe('Jan 2024')
    expect(fmt!('2024-03')).toBe('Mar 2024')
  })

  it('returns d3.format for numeric formats', () => {
    const labels = ['A', 'B']
    const fmt = buildTickFormatter(',.0f', labels)
    expect(fmt).not.toBeNull()
    expect(fmt!(1000 as unknown as string)).toBe('1,000')
  })

  it('auto-formats year labels when no format specified', () => {
    const labels = ['2020', '2021', '2022']
    const fmt = buildTickFormatter(null, labels)
    expect(fmt).not.toBeNull()
    expect(fmt!('2020')).toBe('2020')
  })

  it('auto-formats month labels when no format specified', () => {
    const labels = ['2024-01', '2024-06', '2024-12']
    const fmt = buildTickFormatter(null, labels)
    expect(fmt).not.toBeNull()
    expect(fmt!('2024-01')).toBe('Jan 2024')
    expect(fmt!('2024-12')).toBe('Dec 2024')
  })

  it('auto-formats day labels when no format specified', () => {
    const labels = ['2024-01-15', '2024-06-01']
    const fmt = buildTickFormatter(null, labels)
    expect(fmt).not.toBeNull()
    expect(fmt!('2024-01-15')).toMatch(/Jan/)
  })

  it('returns null for non-date labels with no format', () => {
    const fmt = buildTickFormatter(null, ['Apple', 'Banana'])
    expect(fmt).toBeNull()
  })

  it('ignores % format when labels are not dates', () => {
    const fmt = buildTickFormatter('%b %Y', ['Apple', 'Banana'])
    expect(fmt).toBeNull()
  })
})
