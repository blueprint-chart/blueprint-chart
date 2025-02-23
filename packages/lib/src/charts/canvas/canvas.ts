import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { Margin } from '../types'

export interface CanvasElements {
  svg: SVGSVGElement
  chartArea: SVGGElement
  width: number
  height: number
  margin: Margin
}

const DEFAULT_MARGIN: Margin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 50,
}

const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 400

class CanvasChart extends D3Blueprint<Margin[]> {
  initialize() {
    this.configDefine('totalWidth', { defaultValue: DEFAULT_WIDTH })
    this.configDefine('totalHeight', { defaultValue: DEFAULT_HEIGHT })

    this.layer('svg', this.base, {
      dataBind: (sel, data) => sel.selectAll('svg').data(data),
      insert: sel => sel.append('svg'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          const w = this.config('totalWidth') as number
          const h = this.config('totalHeight') as number
          sel
            .attr('width', w)
            .attr('height', h)
            .append('g')
            .attr('transform', (m: Margin) => `translate(${m.left},${m.top})`)
        },
      },
    })
  }
}

const AUTO_INSIDE_THRESHOLD = 400
const LABEL_PADDING = 2
// d3 axisLeft positions text at x=-9 (inner tick size 6 + padding 3)
const D3_AXIS_LABEL_OFFSET = 9

/**
 * Estimate the pixel width of the widest tick label for a vertical axis.
 * Uses an offscreen canvas for measurement, falling back to character-count estimation.
 */
export function estimateVerticalLabelWidth(
  values: number[],
  range?: { min?: number, max?: number },
  numberFormat?: string | null,
  scaleType?: string,
): number {
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  const domainMin = range?.min ?? dataMin
  const domainMax = range?.max ?? dataMax

  const scale = scaleType === 'log'
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice()
    : d3.scaleLinear().domain([domainMin, domainMax]).nice()

  const ticks = scale.ticks()
  const fmt = numberFormat
    ? d3.format(numberFormat)
    : scale.tickFormat()

  const labels = ticks.map(t => fmt(t))
  if (labels.length === 0) return 0

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = '10px sans-serif'
      let maxW = 0
      for (const label of labels) {
        const w = ctx.measureText(label).width
        if (w > maxW) maxW = w
      }
      return Math.ceil(maxW) + LABEL_PADDING + D3_AXIS_LABEL_OFFSET
    }
  }
  catch { /* fallback below */ }

  // Fallback: ~6px per character
  const maxLen = Math.max(...labels.map(l => l.length))
  return maxLen * 6 + LABEL_PADDING + D3_AXIS_LABEL_OFFSET
}

/**
 * Estimate the pixel width of the widest string label (for band/category axes).
 */
export function estimateCategoryLabelWidth(labels: string[]): number {
  if (labels.length === 0) return 0
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = '10px sans-serif'
      let maxW = 0
      for (const label of labels) {
        const w = ctx.measureText(label).width
        if (w > maxW) maxW = w
      }
      return Math.ceil(maxW) + LABEL_PADDING + D3_AXIS_LABEL_OFFSET
    }
  }
  catch { /* fallback below */ }
  const maxLen = Math.max(...labels.map(l => l.length))
  return maxLen * 6 + LABEL_PADDING + D3_AXIS_LABEL_OFFSET
}

/**
 * Compute margin overrides based on axis label positions.
 * When labels are inside or off, the corresponding margin is removed
 * so the chart area is flush with the container edges.
 * "auto" resolves based on available container width.
 */
export function labelPositionMargins(
  containerWidth: number,
  verticalLabelPosition?: string,
  horizontalLabelPosition?: string,
  verticalDirection?: string,
  verticalLabelWidth?: number,
): Partial<Margin> {
  const overrides: Partial<Margin> = {}
  const labelW = verticalLabelWidth ?? 50

  const vDir = verticalDirection ?? 'left'
  const vPos = verticalLabelPosition ?? 'auto'
  const effectiveV = vPos === 'auto'
    ? (containerWidth > 0 && containerWidth < AUTO_INSIDE_THRESHOLD ? 'inside' : 'outside')
    : vPos
  const vLabelsInside = effectiveV === 'inside'
  const vLabelsHidden = effectiveV === 'off'
  if (vDir === 'right') {
    overrides.left = 0
    if (vLabelsInside || vLabelsHidden) {
      overrides.right = 0
    }
    else {
      overrides.right = labelW
    }
  }
  else {
    if (vLabelsInside || vLabelsHidden) {
      overrides.left = 0
    }
    else {
      overrides.left = labelW
    }
  }
  // Inside labels sit above the top grid line — add top padding
  if (vLabelsInside) {
    overrides.top = 35
  }

  const hPos = horizontalLabelPosition ?? 'auto'
  const effectiveH = hPos === 'auto'
    ? (containerWidth > 0 && containerWidth < AUTO_INSIDE_THRESHOLD ? 'inside' : 'outside')
    : hPos
  if (effectiveH === 'inside' || effectiveH === 'off') {
    overrides.bottom = 5
  }

  return overrides
}

export function createCanvas(
  body: HTMLElement,
  margin?: Partial<Margin>,
): CanvasElements {
  const m: Margin = { ...DEFAULT_MARGIN, ...margin }

  const rect = body.getBoundingClientRect()
  const totalWidth = rect.width > 0 ? rect.width : DEFAULT_WIDTH
  const totalHeight = rect.height > 0 ? rect.height : DEFAULT_HEIGHT

  const width = totalWidth - m.left - m.right
  const height = totalHeight - m.top - m.bottom

  const chart = new CanvasChart(d3.select(body))
  chart.config({ totalWidth, totalHeight })
  chart.draw([m])

  const svg = body.querySelector('svg') as SVGSVGElement
  const chartArea = svg.querySelector('g') as SVGGElement

  return { svg, chartArea, width, height, margin: m }
}
