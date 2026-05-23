import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as d3 from 'd3'
import { HorizontalAxisChart, renderHorizontalAxis, thinLabels, buildTickFormatter, detectDates, willRotateLabels, estimateRotatedAxisHeight, resolveHorizontalAxisBottom, wrapLabel } from './horizontal-axis'
import { LabelRotation } from '../../enums'
import { setRenderTransition } from '../motion'

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

  it('auto-thins labels when width is provided and domain is large (horizontal locked)', () => {
    const months = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    const largeScale = d3.scaleBand<string>().domain(months).range([0, 600]).padding(0.1)
    // Force horizontal so thinning (not rotation) is exercised
    const g = renderHorizontalAxis(chartArea, largeScale, 300, { width: 600, labelRotation: LabelRotation.Horizontal })
    const ticks = g.querySelectorAll('.tick')
    expect(ticks.length).toBeLessThan(months.length)
    expect(ticks.length).toBeGreaterThan(0)
    expect(ticks.length).toBeLessThanOrEqual(11)
  })

  it('auto-rotates many discrete ordinal labels instead of thinning them away', () => {
    const categories = Array.from({ length: 40 }, (_, i) => `Category ${i + 1}`)
    const largeScale = d3.scaleBand<string>().domain(categories).range([0, 600]).padding(0.1)
    const g = renderHorizontalAxis(chartArea, largeScale, 300, { width: 600 })
    const texts = g.querySelectorAll('.tick text')
    // With rotation on, far more labels survive than with horizontal thinning.
    expect(texts.length).toBeGreaterThan(11)
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
    })
  })

  it('auto-thins (does not rotate) date-like ordinal labels — continuous series', () => {
    // Date-parseable labels on an ordinal scale are treated as continuous:
    // rotation is suppressed, labels are thinned instead.
    const months = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    const largeScale = d3.scaleBand<string>().domain(months).range([0, 600]).padding(0.1)
    const g = renderHorizontalAxis(chartArea, largeScale, 300, { width: 600 })
    const texts = g.querySelectorAll('.tick text')
    expect(texts.length).toBeGreaterThan(0)
    expect(texts.length).toBeLessThan(months.length)
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
  })
})

describe('HorizontalAxisChart merge:transition feature parity', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleBand<string>

  beforeEach(() => {
    vi.useFakeTimers()
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it('keeps inside-mode tick text positioned through merge:transition', () => {
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({
      scale,
      height: 300,
      width: 300,
      labels: ['A', 'B', 'C'],
      labelPosition: 'inside',
    })

    setRenderTransition(true)
    try {
      // First draw: enter path. Inside positioning applied via the enter handler.
      chart.draw([{ placeholder: true }])
      // Second draw: merge:transition path (this is the buggy code path).
      chart.draw([{ placeholder: true }])

      // Inspect d3's __transition internals on the first tick text to confirm
      // the inside-positioning attrs are the final tween target. Same technique
      // as the vertical-axis test from commit 17584357.
      const axisEl = chartArea.querySelector('.bc-axis-horizontal')!
      const tickText = axisEl.querySelector('.tick text') as SVGTextElement & { __transition?: Record<string, unknown> }
      expect(tickText).not.toBeNull()

      const td = tickText.__transition
      if (td) {
        // Find the latest scheduled transition (highest numeric id).
        const lastKey = String(Math.max(...Object.keys(td).map(Number)))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schedule = td[lastKey] as any
        const yTween = schedule?.tween?.find?.((t: { name: string }) => t.name === 'attr.y')
        if (yTween) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const interp = yTween.value.call(tickText, (tickText as any).__data__, 0, [tickText])
          // If the factory returns null, start === end (no animation) which is
          // the correct outcome when our write target matches axisBottom's.
          if (interp !== null) {
            // Otherwise the interpolator should land at y=0 at t=1.
            let finalY: string | null = null
            interp.call(
              { setAttribute: (_n: string, v: string) => { finalY = v }, setAttributeNS: () => {} },
              1,
            )
            expect(Number(finalY)).toBe(0)
          }
        }
      }
      // dy is a string attribute and not tweened; check it directly.
      expect(tickText.getAttribute('dy')).toBe('-0.6em')
    }
    finally {
      setRenderTransition(false)
    }
  })
})

describe('HorizontalAxisChart label rotation', () => {
  let chartArea: SVGGElement

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
  })

  function renderOrdinal(opts: {
    domain: string[]
    width: number
    labelRotation?: string
  }): SVGElement {
    const scale = d3.scaleBand<string>()
      .domain(opts.domain)
      .range([0, opts.width])
      .padding(0.1)
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({
      scale,
      height: 300,
      width: opts.width,
      labels: opts.domain,
      labelRotation: opts.labelRotation ?? 'auto',
    })
    chart.draw([{ placeholder: true }])
    return chartArea.querySelector('.bc-axis-horizontal')!
  }

  it('does not rotate when labels fit horizontally (auto)', () => {
    // Short labels, plenty of space — no rotation needed
    const axis = renderOrdinal({ domain: ['A', 'B', 'C'], width: 600 })
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
  })

  it('rotates labels 90° when labels do not fit horizontally (auto)', () => {
    // 24 labels in 400px → ~17px per tick, labels wider than that
    const domain = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 400 })
    const ticks = axis.querySelectorAll('.tick text')
    expect(ticks.length).toBeGreaterThan(0)
    ticks.forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
      expect(t.getAttribute('text-anchor')).toBe('end')
    })
  })

  it('shows every label (no thinning) when rotation is active', () => {
    const domain = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 400 })
    const ticks = axis.querySelectorAll('.tick')
    // All 24 labels should be rendered since rotation gives them room
    expect(ticks.length).toBe(24)
  })

  it('forces rotation when labelRotation is "vertical"', () => {
    const axis = renderOrdinal({ domain: ['A', 'B', 'C'], width: 900, labelRotation: 'vertical' })
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
    })
  })

  it('never thins discrete labels when labelRotation is "horizontal" (allows overlap)', () => {
    // Each label identifies a bar/category — dropping one makes that bar
    // unreadable. With the explicit `horizontal` override and wrap failing,
    // we keep every label and let them visibly overlap rather than disappear.
    const domain = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 400, labelRotation: 'horizontal' })
    const texts = axis.querySelectorAll('.tick text')
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
    const allTicks = axis.querySelectorAll('.tick')
    expect(allTicks.length).toBe(domain.length)
  })

  it('never thins discrete rotated labels even at extreme densities', () => {
    // 100 categories in 300px → per-tick 3px, rotated labels would heavily
    // overlap. Every label must still render — dropping bar identities is
    // worse than visual overlap, which is at least an honest signal.
    const domain = Array.from({ length: 100 }, (_, i) => `Category ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 300 })
    const ticks = axis.querySelectorAll('.tick')
    expect(ticks.length).toBe(domain.length)
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
    })
  })

  it('keeps rotation across rerenders (merge:transition path)', () => {
    const scale = d3.scaleBand<string>()
      .domain(Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`))
      .range([0, 400])
      .padding(0.1)
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 400, labels: scale.domain(), labelRotation: 'auto' })
    chart.draw([{ placeholder: true }])
    chart.draw([{ placeholder: true }])
    const axis = chartArea.querySelector('.bc-axis-horizontal')!
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
    })
  })

  it('wraps multi-word labels instead of rotating when wrap fits (auto)', () => {
    // 6 labels at 600 px → 100 px per tick. "Column Label N" ≈ 140 px overflows,
    // but each word ≤ 60 px fits. Should wrap instead of rotate.
    const domain = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 600 })
    const texts = axis.querySelectorAll('.tick text')
    expect(texts.length).toBe(6)
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
      expect(t.querySelectorAll('tspan').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('wraps each tspan with correct dy so first line sits on the axis baseline', () => {
    // First tspan must be at the default text baseline (matches single-line labels).
    // Parent text `dy` is cleared so tspan dy is absolute from `y`.
    const domain = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 600 })
    const wrapped = Array.from(axis.querySelectorAll('.tick text'))
      .find(t => t.querySelectorAll('tspan').length >= 2) as SVGTextElement
    expect(wrapped).toBeDefined()
    // Parent text should have its default dy cleared; first tspan takes over positioning
    expect(wrapped.getAttribute('dy')).toBeNull()
    const tspans = wrapped.querySelectorAll('tspan')
    expect(tspans[0].getAttribute('dy')).toBe('0.71em')
    expect(tspans[0].getAttribute('x')).toBe('0')
    // Subsequent lines step down by 1em
    for (let i = 1; i < tspans.length; i++) {
      expect(tspans[i].getAttribute('dy')).toBe('1em')
      expect(tspans[i].getAttribute('x')).toBe('0')
    }
  })

  it('uses up to 3 wrap lines before giving up (avoids premature rotation)', () => {
    // 3-word label at a width where 2 lines would fail but 3 lines succeed.
    // "AAA BBB CCC" → 11 chars × 10 = 110 px per label.
    // 5 labels at 250 px → 50 px per tick. Each word = 30 px fits. Whole = 110 overflows.
    // 2 lines: best packing "AAA BBB" (70 > 50) ... fails. 3 lines: ["AAA","BBB","CCC"].
    const domain = Array.from({ length: 5 }, (_, i) => `AAA BBB CCC${i}`)
    const axis = renderOrdinal({ domain, width: 250 })
    const texts = axis.querySelectorAll('.tick text')
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
      expect(t.querySelectorAll('tspan').length).toBeGreaterThanOrEqual(3)
    })
  })

  it('rotates when single-word labels cannot wrap (auto)', () => {
    // "Supercalifragilistic" is one word, 20 chars ≈ 200 px, per-tick ≈ 20 px.
    // Cannot wrap; must rotate.
    const domain = Array.from({ length: 24 }, (_, i) => `Supercalifragilistic${i}`)
    const axis = renderOrdinal({ domain, width: 480 })
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
      expect(t.querySelectorAll('tspan').length).toBe(0)
    })
  })

  it('rotates when wrap would exceed max lines (e.g., long word in tight per-tick)', () => {
    // 24 labels × "Group N" at 600 px → 25 px per tick.
    // "Group" = 50 px > 25 → wrap returns null → falls back to rotate.
    const domain = Array.from({ length: 24 }, (_, i) => `Group ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 600 })
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
    })
  })

  it('still wraps under labelRotation=horizontal override when wrap fits', () => {
    // Horizontal forbids rotation but allows wrapping (still a horizontal layout)
    const domain = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 600, labelRotation: 'horizontal' })
    const texts = axis.querySelectorAll('.tick text')
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
    const withTspans = Array.from(texts).filter(t => t.querySelectorAll('tspan').length >= 2)
    expect(withTspans.length).toBeGreaterThan(0)
  })

  it('does not wrap when labelRotation=vertical (rotates directly)', () => {
    const domain = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    const axis = renderOrdinal({ domain, width: 600, labelRotation: 'vertical' })
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
      expect(t.querySelectorAll('tspan').length).toBe(0)
    })
  })

  it('keeps wrap across rerenders (merge:transition path)', () => {
    const domain = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    const scale = d3.scaleBand<string>().domain(domain).range([0, 600]).padding(0.1)
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 600, labels: domain, labelRotation: 'auto' })
    chart.draw([{ placeholder: true }])
    chart.draw([{ placeholder: true }])
    const axis = chartArea.querySelector('.bc-axis-horizontal')!
    const texts = axis.querySelectorAll('.tick text')
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
      expect(t.querySelectorAll('tspan').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('keeps every discrete label when they fit — no thinning on bar/column charts', () => {
    // 10 short discrete labels on a modest-width chart. They fit per-tick and
    // should all render (no thinning). Dropping a bar's label is never OK.
    const domain = ['Apple', 'Pear', 'Kiwi', 'Plum', 'Date', 'Fig', 'Lime', 'Mango', 'Grape', 'Peach']
    const axis = renderOrdinal({ domain, width: 500 })
    const ticks = axis.querySelectorAll('.tick')
    expect(ticks.length).toBe(domain.length)
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
  })

  it('does not rotate date-like ordinal labels on auto (continuous series)', () => {
    // Ordinal scale whose domain parses as dates → continuous → thin, not rotate.
    const domain = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    const axis = renderOrdinal({ domain, width: 600 })
    const texts = axis.querySelectorAll('.tick text')
    expect(texts.length).toBeGreaterThan(0)
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
    // Thinning applied because rotation is suppressed for continuous series.
    expect(texts.length).toBeLessThan(domain.length)
  })

  it('still rotates date-like ordinal labels when labelRotation=vertical', () => {
    // Explicit user override wins over the continuous-domain heuristic.
    const domain = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    const axis = renderOrdinal({ domain, width: 600, labelRotation: 'vertical' })
    const texts = axis.querySelectorAll('.tick text')
    expect(texts.length).toBeGreaterThan(0)
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBe('rotate(-90)')
    })
  })

  it('does not rotate time scales even when labels would overlap', () => {
    // Time/linear scale → thinning only, no rotation (per design)
    const scale = d3.scaleTime()
      .domain([new Date(2020, 0, 1), new Date(2024, 11, 31)])
      .range([0, 300])
    const chart = new HorizontalAxisChart(d3.select(chartArea))
    chart.config({ scale, height: 300, width: 300, labels: [], labelRotation: 'auto' })
    chart.draw([{ placeholder: true }])
    const axis = chartArea.querySelector('.bc-axis-horizontal')!
    axis.querySelectorAll('.tick text').forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull()
    })
  })
})

describe('wrapLabel', () => {
  it('returns the label as a single line when it already fits', () => {
    // "Hello" ≈ 5×10 = 50 px, maxWidth 100 → fits
    expect(wrapLabel('Hello', 100)).toEqual(['Hello'])
  })

  it('splits multi-word labels across lines when whole label does not fit', () => {
    // "Hello World" ≈ 110 px, doesn't fit in 80px; split → ['Hello', 'World']
    expect(wrapLabel('Hello World', 80)).toEqual(['Hello', 'World'])
  })

  it('packs short words together greedily', () => {
    // "A B C D" ≈ 70 px fits in 100 → no split
    // "A B C D E" ≈ 90 px fits in 100 → no split
    expect(wrapLabel('A B C D E', 100)).toEqual(['A B C D E'])
  })

  it('returns null when a single word exceeds max width', () => {
    // "Supercalifragilistic" = 20 chars × 10 = 200 px, won't fit in 100
    expect(wrapLabel('Supercalifragilistic', 100)).toBeNull()
  })

  it('returns null when content requires more than maxLines', () => {
    // 4 words, each ~30 px, maxWidth 40 → each on own line → 4 lines > 2
    expect(wrapLabel('aa bb cc dd', 30, 2)).toBeNull()
  })

  it('defaults to 3 lines (rotation should be a last resort)', () => {
    // Without explicit maxLines, default allows up to 3 lines.
    expect(wrapLabel('aa bb cc', 30)).toEqual(['aa', 'bb', 'cc'])
  })

  it('respects a custom maxLines of 3', () => {
    expect(wrapLabel('aa bb cc', 30, 3)).toEqual(['aa', 'bb', 'cc'])
  })

  it('returns single empty line for empty input', () => {
    expect(wrapLabel('', 100)).toEqual([''])
  })
})

describe('willRotateLabels', () => {
  it('returns false when all labels fit within per-tick width', () => {
    // 3 short labels, 600px → 200px per tick, labels ~10px
    expect(willRotateLabels(['A', 'B', 'C'], 600, 'auto')).toBe(false)
  })

  it('returns true when labels exceed per-tick width', () => {
    // 24 labels, 400px → ~17px per tick, labels much wider
    const domain = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    expect(willRotateLabels(domain, 400, 'auto')).toBe(true)
  })

  it('returns false when domain has ≤1 element', () => {
    expect(willRotateLabels([], 100, 'auto')).toBe(false)
    expect(willRotateLabels(['only'], 100, 'auto')).toBe(false)
  })

  it('respects labelRotation=horizontal override', () => {
    const domain = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    expect(willRotateLabels(domain, 400, 'horizontal')).toBe(false)
  })

  it('respects labelRotation=vertical override', () => {
    expect(willRotateLabels(['A', 'B', 'C'], 900, 'vertical')).toBe(true)
  })

  it('returns false for date-like labels on auto (continuous series)', () => {
    // Year-month labels parse as dates → thin, don't rotate, even when they
    // would otherwise overflow their per-tick width.
    const domain = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    expect(willRotateLabels(domain, 400, 'auto')).toBe(false)
  })

  it('still returns true for date-like labels when labelRotation=vertical', () => {
    const domain = ['2020', '2021', '2022', '2023']
    expect(willRotateLabels(domain, 900, 'vertical')).toBe(true)
  })

  it('considers formatted label width via formatter', () => {
    // Non-date labels so the continuous-series guard doesn't short-circuit.
    // Raw 2 chars (fits in 80px step), formatted to ~15 chars (doesn't fit).
    const domain = ['Q1', 'Q2', 'Q3', 'Q4']
    const formatter = (s: string) => `Prefix-${s}-suffix`
    // 4 labels × 80px tick, raw fits, formatted ~150px → should rotate
    expect(willRotateLabels(domain, 320, 'auto', formatter)).toBe(true)
    // Without formatter, short raw labels fit
    expect(willRotateLabels(domain, 320, 'auto')).toBe(false)
  })
})

describe('resolveHorizontalAxisBottom', () => {
  it('returns undefined when rotation is not triggered (auto, labels fit)', () => {
    expect(resolveHorizontalAxisBottom(['A', 'B', 'C'], 600)).toBeUndefined()
  })

  it('returns rotated height when rotation triggers', () => {
    const labels = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    const result = resolveHorizontalAxisBottom(labels, 400)
    expect(result).toBeGreaterThan(40)
  })

  it('returns undefined when labelPosition is "off"', () => {
    const labels = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    expect(resolveHorizontalAxisBottom(labels, 400, { labelPosition: 'off' })).toBeUndefined()
  })

  it('returns undefined when labelPosition is "inside"', () => {
    const labels = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    expect(resolveHorizontalAxisBottom(labels, 400, { labelPosition: 'inside' })).toBeUndefined()
  })

  it('returns undefined for empty labels', () => {
    expect(resolveHorizontalAxisBottom([], 400)).toBeUndefined()
  })

  it('returns undefined for date-like labels on auto — no bottom padding needed', () => {
    // Continuous series → thin only, so no extra bottom margin is reserved.
    const labels = Array.from({ length: 120 }, (_, i) => {
      const y = 2009 + Math.floor(i / 12)
      const m = String((i % 12) + 1).padStart(2, '0')
      return `${y}-${m}`
    })
    expect(resolveHorizontalAxisBottom(labels, 400)).toBeUndefined()
  })

  it('reserves rotated height for date-like labels when labelRotation=vertical', () => {
    const labels = Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, '0')}`)
    const result = resolveHorizontalAxisBottom(labels, 400, { labelRotation: 'vertical' })
    expect(result).toBeGreaterThan(40)
  })

  it('returns undefined when labelRotation is explicitly horizontal', () => {
    const labels = Array.from({ length: 24 }, (_, i) => `Category ${i + 1}`)
    expect(resolveHorizontalAxisBottom(labels, 400, { labelRotation: 'horizontal' })).toBeUndefined()
  })

  it('uses tickFormat when measuring rotated height', () => {
    const labels = ['1', '2', '3', '4']
    const result = resolveHorizontalAxisBottom(
      labels,
      400,
      { labelRotation: 'vertical', tickFormat: (l: string) => `Prefix-${l}-long-suffix` },
    )
    expect(result).toBeGreaterThan(80)
  })

  it('returns extended height for wrap when wrap would apply (no rotation)', () => {
    // Multi-word labels that wrap (no rotation). 3-word label at 600 px / 6 = 100 px
    // per tick → "Column Label N" wraps to 2 lines. Default bottom 20 is too tight;
    // must extend to fit wrapped lines.
    const labels = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    const result = resolveHorizontalAxisBottom(labels, 600, {}, 20)
    expect(result).toBeDefined()
    expect(result!).toBeGreaterThan(20)
    // Wrap height (~2 lines × 14 + padding) is much less than rotated height
    expect(result!).toBeLessThan(80)
  })

  it('returns undefined when wrap fits within default bottom', () => {
    // Default bottom 60 is ample for 2-line wrap (~34 px) — no extension needed
    const labels = Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`)
    expect(resolveHorizontalAxisBottom(labels, 600, {}, 60)).toBeUndefined()
  })
})

describe('estimateRotatedAxisHeight', () => {
  it('returns height based on longest label when rotated', () => {
    const labels = ['A', 'Longer label', 'Mid']
    const h = estimateRotatedAxisHeight(labels)
    // "Longer label" ≈ 12 chars × 7px ≈ 84px + tick/pad
    expect(h).toBeGreaterThan(80)
  })

  it('returns 0 for empty labels', () => {
    expect(estimateRotatedAxisHeight([])).toBe(0)
  })

  it('applies formatter before measuring', () => {
    const labels = ['2024-01', '2024-02']
    const short = estimateRotatedAxisHeight(labels)
    const expanded = estimateRotatedAxisHeight(labels, s => `January ${s.slice(0, 4)}`)
    expect(expanded).toBeGreaterThan(short)
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
    // Labels up to 3 chars (~30 px) → minSpacing 38 → maxLabels floor(300/38)=7
    // → step ceil(100/7)=15 → indices 0,15,30,45,60,75,90 + L99 = 8.
    expect(result.length).toBeLessThanOrEqual(10)
    expect(result.length).toBeGreaterThan(5)
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

  it('shows all single-char labels when they fit naturally per-tick', () => {
    // Letter-frequency sample: 10 single-char labels at a modest width.
    // Each label is ~10 px, so all 10 fit in ~200 px. The thinning floor
    // should be driven by label width, not an unrelated absolute minimum
    // that decimates labels even when the axis has ample room.
    const labels = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D']
    expect(thinLabels(labels, 500)).toEqual(labels)
    expect(thinLabels(labels, 300)).toEqual(labels)
    expect(thinLabels(labels, 200)).toEqual(labels)
  })

  it('produces progressively coarser steps as width shrinks', () => {
    const labels = Array.from({ length: 12 }, (_, i) => `M${i}`)
    // maxWidth ~30 → minSpacing 38.
    // 720px → maxLabels floor(720/38)=18 → all fit.
    expect(thinLabels(labels, 720)).toEqual(labels)
    // 360px → maxLabels floor(360/38)=9 → step=2 → M0,M2,…,M10 + M11
    expect(thinLabels(labels, 360)).toEqual(['M0', 'M2', 'M4', 'M6', 'M8', 'M10', 'M11'])
    // 240px → maxLabels floor(240/38)=6 → step=2 → same as 360
    expect(thinLabels(labels, 240)).toEqual(['M0', 'M2', 'M4', 'M6', 'M8', 'M10', 'M11'])
    // 180px → maxLabels floor(180/38)=4 → step=3 → M0,M3,M6,M9 + M11
    expect(thinLabels(labels, 180)).toEqual(['M0', 'M3', 'M6', 'M9', 'M11'])
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
