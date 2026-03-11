import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
import { computeLinearDomain } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor, contrastTextColor } from '../../contrast'
import { getDefaultTransitionMs, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'

const DEFAULT_COLORS = ['#4e79a7']

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

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar').data(data, (d: BarDatum) => d.label),
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          const highlights = this.config('highlights') as Map<string, string>
          sel
            .attr('x', (d: BarDatum) => Math.min(x(0), x(d.value)))
            .attr('y', (d: BarDatum) => y(d.label) ?? 0)
            .attr('width', (d: BarDatum) => Math.abs(x(d.value) - x(0)))
            .attr('height', y.bandwidth())
            .attr('fill', (d: BarDatum) => highlights.get(d.label) ?? colors[0])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          const colors = this.config('colors') as string[]
          const highlights = this.config('highlights') as Map<string, string>
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

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  // Preserve existing data elements for smooth D3 data-join transitions
  let priorBars: Element[] = []
  let priorLabels: Element[] = []
  let priorVAxis: Element | null = null
  let priorHAxis: Element | null = null
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  if (transition) {
    const cached = getCachedChart(container)
    if (cached) {
      priorVAxis = container.querySelector('.bc-axis-vertical')
      priorHAxis = container.querySelector('.bc-axis-horizontal')
    }
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
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)

  const labels = sortLabels(data, options)
  const barData: BarDatum[] = labels.map(l => ({
    label: l,
    value: data.values[data.labels.indexOf(l)],
  }))

  const useLog = options.horizontalAxis?.scaleType === 'log'
  // eslint-disable-next-line prefer-const
  let [domainMin, domainMax] = computeLinearDomain(barData.map(d => d.value), options.horizontalAxis?.range)
  // Extend domain to leave room for value labels left of negative bars
  if (options.valueLabels && domainMin < 0 && options.horizontalAxis?.range?.min == null) {
    const span = domainMax - domainMin
    domainMin -= span * 0.1
  }
  const x = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([0, width])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([0, width])

  const y = d3.scaleBand<string>()
    .domain(labels)
    .range([0, height])
    .padding(0.2)

  renderHorizontalAxis(chartArea, x, height, { ...options.horizontalAxis, width }, priorHAxis)
  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, topPadding: margin.top }, priorVAxis)

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

  const chart = new BarHorizontalChart(clippedGroup)
  chart.config({ x, y, width, height, colors: options.colors ?? DEFAULT_COLORS, highlights })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorBars.length > 0) {
    const layerG = clippedGroup.node()!.querySelector('g')!
    priorBars.forEach(el => layerG.appendChild(el))
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
      position: options.valueLabelPosition,
      highlights,
      colors: options.colors ?? DEFAULT_COLORS,
      transition,
      priorLabels,
    })
  }

  setCachedChart(container, { chartType: 'bar-horizontal' })

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
  },
) {
  const pos = opts.position ?? 'auto'

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
        .text(String(d.value))
    })

  // Merge — update all labels to new positions
  const merged = enter.merge(join)
  if (opts.transition) {
    merged.each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos)
      d3.select(this)
        .text(String(d.value))
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
        .text(String(d.value))
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
