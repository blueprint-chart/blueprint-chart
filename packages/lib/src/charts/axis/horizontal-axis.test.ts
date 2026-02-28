import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderHorizontalAxis, thinLabels, buildTickFormatter, detectDates } from './horizontal-axis'

function createAxisFixture() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
  svg.appendChild(chartArea)
  document.body.appendChild(svg)
  const scale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  return { chartArea, scale }
}

describe('horizontal axis position', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleBand<string>

  beforeEach(() => {
    ({ chartArea, scale } = createAxisFixture())
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
})

describe('horizontal axis grid lines', () => {
  it('renders dashed grid lines by default when height > 0', () => {
    const { chartArea, scale } = createAxisFixture()
    const g = renderHorizontalAxis(chartArea, scale, 300, { gridStyle: 'dashed' })
    const gridLines = g.querySelectorAll('.bc-grid-line')
    expect(gridLines.length).toBeGreaterThan(0)
    gridLines.forEach((line) => {
      expect(line.getAttribute('stroke-dasharray')).toBe('4,4')
    })
  })
})

describe('horizontal axis label thinning', () => {
  it('auto-thins labels when width is provided and domain is large', () => {
    const { chartArea } = createAxisFixture()
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

describe('thinLabels', () => {
  it('returns all labels when they fit', () => {
    const labels = ['A', 'B', 'C']
    expect(thinLabels(labels, 300)).toEqual(['A', 'B', 'C'])
  })

  it('thins labels when there are too many', () => {
    const labels = Array.from({ length: 100 }, (_, i) => `L${i}`)
    const result = thinLabels(labels, 300)
    // 300px / 60px = 5 max labels
    expect(result.length).toBeLessThanOrEqual(6)
    expect(result.length).toBeGreaterThanOrEqual(2)
    // First label is always included
    expect(result[0]).toBe('L0')
    // Last label is always included
    expect(result[result.length - 1]).toBe('L99')
  })

  it('returns single-element arrays unchanged', () => {
    expect(thinLabels(['A'], 100)).toEqual(['A'])
  })

  it('returns empty arrays unchanged', () => {
    expect(thinLabels([], 100)).toEqual([])
  })

  it('always includes the last label', () => {
    const labels = Array.from({ length: 50 }, (_, i) => `${2000 + i}`)
    const result = thinLabels(labels, 180)
    expect(result[result.length - 1]).toBe('2049')
  })
})

describe('detectDates valid formats', () => {
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
})

describe('detectDates invalid inputs', () => {
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

describe('buildTickFormatter explicit formats', () => {
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

  it('ignores % format when labels are not dates', () => {
    const fmt = buildTickFormatter('%b %Y', ['Apple', 'Banana'])
    expect(fmt).toBeNull()
  })
})

describe('buildTickFormatter auto-detection', () => {
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
})
