import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { computeLinearDomain } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor, contrastTextColor } from '../../contrast'
import { getDefaultTransitionMs, fadeIn, snapshotForFadeOut, commitFadeOut, reinsertWithOffset } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'

const DEFAULT_COLORS = ['#4e79a7']
const VALUE_LABEL_FONT = '11px sans-serif'
const VALUE_LABEL_GAP = 4

interface BarDatum {
  label: string
  value: number
}

class BarHorizontalChart extends D3Blueprint<BarDatum[]> {
  initialize() {
    this.configDefine('x', { defaultValue: d3.scaleLinear() })
    this.configDefine('y', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('width', { defaultValue: 0 })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('highlights', { defaultValue: new Map<string, string>() })
    this.configDefine('swapLabelValue', { defaultValue: false })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar').data(data, (d: BarDatum) => d.label),
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const colors = this.config('colors') as string[]
          const highlights = this.config('highlights') as Map<string, string>
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          sel
            .attr('x', (d: BarDatum) => Math.min(x(0), x(d.value)))
            .attr('y', (d: BarDatum) => y(d.label) ?? 0)
            .attr('width', (d: BarDatum) => Math.abs(x(d.value) - x(0)))
            .attr('height', y.bandwidth())
            .attr('fill', (d: BarDatum) => highlights.get(d.label) ?? colors[0])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const colors = this.config('colors') as string[]
          const highlights = this.config('highlights') as Map<string, string>
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          sel.duration(getDefaultTransitionMs())
            .attr('x', (d: BarDatum) => Math.min(x(0), x(d.value)))
            .attr('y', (d: BarDatum) => y(d.label) ?? 0)
            .attr('width', (d: BarDatum) => Math.abs(x(d.value) - x(0)))
            .attr('height', y.bandwidth())
            .attr('fill', (d: BarDatum) => highlights.get(d.label) ?? colors[0])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'exit:transition': (sel: any) => {
          sel.duration(getDefaultTransitionMs())
            .attr('opacity', 0)
            .remove()
        },
      },
    })
  }
}

/**
 * Estimate the pixel width of a value label string.
 */
function estimateValueLabelWidth(text: string): number {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = VALUE_LABEL_FONT
      return Math.ceil(ctx.measureText(text).width)
    }
  }
  catch { /* fallback below */ }
  return text.length * 6.5
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorBars: Element[] = []
  let priorLabels: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number } | undefined
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached?.chartType === 'bar-horizontal') {
      priorBars = Array.from(container.querySelectorAll('.bc-bar'))
      priorLabels = Array.from(container.querySelectorAll('.bc-value-label'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    priorAnnotations = new Map()
    for (const el of container.querySelectorAll('.bc-annotations, .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        priorAnnotations.set(k, v)
      }
    }
    container.replaceChildren()
  }

  const { body } = createFrame(container, options.frame)
  const containerWidth = contentSize(body).width
  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW, options.horizontalAxis?.showAxis)

  // Reserve extra margin for outside value labels
  const valueLabelPos = options.valueLabelPosition ?? 'auto'
  const swapLabelValue = options.swapLabelValue === true
  if (options.valueLabels && valueLabelPos !== 'inside') {
    if (swapLabelValue) {
      // Labels show category names — estimate width from the longest label
      const longestLabel = data.labels.reduce((a, b) => a.length > b.length ? a : b, '')
      const rightLabelW = estimateValueLabelWidth(longestLabel) + VALUE_LABEL_GAP
      lpMargins.right = Math.max(lpMargins.right ?? 15, rightLabelW)
    }
    else {
      const maxVal = Math.max(...data.values)
      const minVal = Math.min(...data.values)
      const rightLabelW = maxVal > 0 ? estimateValueLabelWidth(String(maxVal)) + VALUE_LABEL_GAP : 0
      const leftLabelW = minVal < 0 ? estimateValueLabelWidth(String(minVal)) + VALUE_LABEL_GAP : 0
      lpMargins.right = Math.max(lpMargins.right ?? 15, rightLabelW)
      if (leftLabelW > 0) {
        lpMargins.left = (lpMargins.left ?? 50) + leftLabelW
      }
    }
  }

  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)
  const marginDelta = priorMargin
    ? { dx: priorMargin.left - margin.left, dy: priorMargin.top - margin.top }
    : undefined

  const labels = sortLabels(data, options)
  const barData: BarDatum[] = labels.map(l => ({
    label: l,
    value: data.values[data.labels.indexOf(l)],
  }))

  // Normal: x = scaleLinear (values), y = scaleBand (labels)
  const useLog = options.horizontalAxis?.scaleType === 'log'
  const [domainMin, domainMax] = computeLinearDomain(barData.map(d => d.value), options.horizontalAxis?.range)
  const x = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([0, width])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([0, width])

  const y = d3.scaleBand<string>()
    .domain(labels)
    .range([0, height])
    .padding(0.2)

  const vAxisOpts = swapLabelValue && options.valueLabels
    ? (() => {
        const valueMap = new Map(barData.map(d => [d.label, d.value]))
        return {
          ...options.verticalAxis,
          topPadding: margin.top,
          tickFormat: (label: string) => String(valueMap.get(label) ?? label),
        }
      })()
    : { ...options.verticalAxis, topPadding: margin.top }
  axes.attach(chartArea, marginDelta)
  axes.update({
    horizontal: { scale: x, height, options: { ...options.horizontalAxis, width } },
    vertical: { scale: y, height, options: vAxisOpts },
    order: 'horizontal-first',
  })

  // Zero baseline when domain spans zero
  if (!useLog && domainMin < 0 && domainMax > 0) {
    d3.select(chartArea).append('line')
      .attr('class', 'bc-zero-baseline')
      .attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', 0).attr('y2', height)
      .attr('stroke', '#666').attr('stroke-width', 1)
  }

  const highlights = new Map(
    (options.highlights ?? []).map(h => [h.target, h.color]),
  )

  // Clip bars to the chart area so they truncate at axis boundaries
  const clipId = `bc-clip-${Math.random().toString(36).slice(2, 8)}`
  const svg = chartArea.ownerSVGElement!
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')
  defs.append('clipPath').attr('id', clipId)
    .append('rect').attr('width', width).attr('height', height)
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)

  // Bar backgrounds — full-size rects behind each bar at low opacity
  if (options.barBackground) {
    const bgColor = (options.colors ?? DEFAULT_COLORS)[0]
    clippedGroup.selectAll('.bc-bar-bg')
      .data(barData, (d: BarDatum) => d.label)
      .enter()
      .append('rect')
      .attr('class', 'bc-bar-bg')
      .attr('x', 0)
      .attr('y', (d: BarDatum) => y(d.label) ?? 0)
      .attr('width', width)
      .attr('height', y.bandwidth())
      .attr('fill', bgColor)
      .attr('opacity', 0.08)
  }

  // Bar separators — lines between adjacent bands
  if (options.barSeparators && barData.length > 1) {
    const step = y.step()
    for (let i = 1; i < barData.length; i++) {
      const yPos = (y(barData[i - 1].label) ?? 0) + y.bandwidth() + (step - y.bandwidth()) / 2
      clippedGroup.append('line')
        .attr('class', 'bc-bar-separator')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', yPos).attr('y2', yPos)
        .attr('stroke', 'currentColor')
        .attr('opacity', 0.15)
    }
  }

  const chart = new BarHorizontalChart(clippedGroup)
  chart.config({ x, y, width, height, colors: options.colors ?? DEFAULT_COLORS, highlights, swapLabelValue })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorBars.length > 0) {
    const layerG = clippedGroup.node()!.querySelector('g')!
    reinsertWithOffset(layerG, priorBars, marginDelta?.dx ?? 0, marginDelta?.dy ?? 0)
  }
  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: 'horizontal' }))
  }
  if (options.annotations?.length) {
    chart.use(createAnnotationPlugin(options.annotations, {
      scaleX: y, scaleY: x, data: barData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: 'horizontal', transition, priorAnnotations }))
  }
  chart.draw(barData)

  if (options.valueLabels) {
    // Render value labels in an unclipped group so outside labels aren't truncated
    const labelParent = d3.select(chartArea).append('g') as d3.Selection<SVGGElement, unknown, null, undefined>
    renderValueLabels(labelParent, barData, x, y, {
      position: valueLabelPos,
      highlights,
      colors: options.colors ?? DEFAULT_COLORS,
      transition,
      priorLabels,
      swapLabelValue,
    })
  }

  setCachedChart(container, { chartType: 'bar-horizontal', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}

function valueLabelAttrs(
  d: BarDatum,
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog,
  y: d3.ScaleBand<string>,
  pos: 'inside' | 'outside' | 'auto',
) {
  const isInside = pos === 'inside'
  const ty = (y(d.label) ?? 0) + y.bandwidth() / 2
  let tx: number, anchor: string
  if (d.value < 0) {
    const barX = Math.min(x(0), x(d.value))
    if (isInside) {
      tx = barX + 4
      anchor = 'start'
    }
    else {
      tx = barX - 4
      anchor = 'end'
    }
  }
  else {
    const barEnd = x(d.value)
    if (isInside) {
      tx = barEnd - 4
      anchor = 'end'
    }
    else {
      tx = barEnd + 4
      anchor = 'start'
    }
  }
  return { tx, ty, anchor, isInside }
}

function renderValueLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  barData: BarDatum[],
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog,
  y: d3.ScaleBand<string>,
  opts: {
    position?: 'inside' | 'outside' | 'auto'
    highlights: Map<string, string>
    colors: string[]
    transition: boolean
    priorLabels: Element[]
    swapLabelValue?: boolean
  },
) {
  const pos = opts.position ?? 'auto'
  const labelText = (d: BarDatum) => opts.swapLabelValue ? d.label : String(d.value)

  // Create a dedicated group for value labels so they sit above bars
  let labelGroup = parent.select<SVGGElement>('.bc-value-label-group')
  if (labelGroup.empty()) {
    labelGroup = parent.append('g').attr('class', 'bc-value-label-group')
  }

  // Re-insert prior labels for data-join
  if (opts.priorLabels.length > 0) {
    const node = labelGroup.node()!
    opts.priorLabels.forEach(el => node.appendChild(el))
  }

  const join = labelGroup.selectAll<SVGTextElement, BarDatum>('.bc-value-label')
    .data(barData, (d: BarDatum) => d.label)

  // Exit
  join.exit()
    .transition().duration(getDefaultTransitionMs())
    .attr('opacity', 0)
    .remove()

  // Enter
  const enter = join.enter()
    .append('text')
    .attr('class', 'bc-value-label')
    .attr('font-size', '11px')
    .attr('dominant-baseline', 'central')
    .each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos)
      d3.select(this)
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.highlights.get(d.label) ?? opts.colors[0])
          : 'currentColor')
        .text(labelText(d))
    })

  // Merge — update all labels to new positions
  const merged = enter.merge(join)
  if (opts.transition) {
    merged.each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos)
      d3.select(this)
        .text(labelText(d))
        .transition().duration(getDefaultTransitionMs())
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.highlights.get(d.label) ?? opts.colors[0])
          : 'currentColor')
    })
  }
  else {
    merged.each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos)
      d3.select(this)
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.highlights.get(d.label) ?? opts.colors[0])
          : 'currentColor')
        .text(labelText(d))
    })
  }
}

function sortLabels(data: ChartData, options: ChartOptions): string[] {
  const paired = data.labels.map((l, i) => ({ label: l, value: data.values[i] }))
  if (options.sort === 'ascending') {
    paired.sort((a, b) => a.value - b.value)
  }
  else if (options.sort === 'descending') {
    paired.sort((a, b) => b.value - a.value)
  }
  return paired.map(p => p.label)
}
