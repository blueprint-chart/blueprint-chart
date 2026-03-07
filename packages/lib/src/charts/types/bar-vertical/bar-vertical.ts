import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, labelPositionMargins, estimateVerticalLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
import { computeLinearDomain } from '../../scale-helpers'
import { createValueLabelPlugin } from '../../plugins/value-labels'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { getDefaultTransitionMs, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'

const DEFAULT_COLORS = ['#4e79a7']

interface BarDatum {
  label: string
  value: number
}

class BarVerticalChart extends D3Blueprint<BarDatum[]> {
  initialize() {
    this.configDefine('x', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
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
          const x = this.config('x') as d3.ScaleBand<string>
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          const highlights = this.config('highlights') as Map<string, string>
          sel
            .attr('x', (d: BarDatum) => x(d.label) ?? 0)
            .attr('y', (d: BarDatum) => Math.min(y(0), y(d.value)))
            .attr('width', x.bandwidth())
            .attr('height', (d: BarDatum) => Math.abs(y(d.value) - y(0)))
            .attr('fill', (d: BarDatum) => highlights.get(d.label) ?? colors[0])
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const x = this.config('x') as d3.ScaleBand<string>
          const y = this.config('y') as d3.ScaleLinear<number, number>
          const colors = this.config('colors') as string[]
          const highlights = this.config('highlights') as Map<string, string>
          sel.duration(getDefaultTransitionMs())
            .attr('x', (d: BarDatum) => x(d.label) ?? 0)
            .attr('y', (d: BarDatum) => Math.min(y(0), y(d.value)))
            .attr('width', x.bandwidth())
            .attr('height', (d: BarDatum) => Math.abs(y(d.value) - y(0)))
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
    if (cached?.chartType === 'bar-vertical') {
      priorBars = Array.from(container.querySelectorAll('.bc-bar'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    // Snapshot annotation positions before clearing
    priorAnnotations = new Map()
    for (const el of container.querySelectorAll('.bc-annotations, .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        priorAnnotations.set(k, v)
      }
    }
    container.replaceChildren()
  }

  const { body } = createFrame(container, options.frame)
  const containerWidth = body.getBoundingClientRect().width
  const vLabelW = estimateVerticalLabelWidth(data.values, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)

  const labels = sortLabels(data, options)
  const barData: BarDatum[] = labels.map(l => ({
    label: l,
    value: data.values[data.labels.indexOf(l)],
  }))

  const x = d3.scaleBand<string>()
    .domain(labels)
    .range([0, width])
    .padding(0.2)

  const useLog = options.verticalAxis?.scaleType === 'log'
  // eslint-disable-next-line prefer-const
  let [domainMin, domainMax] = computeLinearDomain(barData.map(d => d.value), options.verticalAxis?.range)
  // Extend domain to leave room for value labels below negative bars
  if (options.valueLabels && domainMin < 0 && options.verticalAxis?.range?.min == null) {
    const span = domainMax - domainMin
    domainMin -= span * 0.1
  }
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])

  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, gridWidth: width, topPadding: margin.top }, priorVAxis)
  renderHorizontalAxis(chartArea, x, height, { ...options.horizontalAxis, width }, priorHAxis)

  // Zero baseline when domain spans zero
  if (!useLog && domainMin < 0 && domainMax > 0) {
    d3.select(chartArea).append('line')
      .attr('class', 'bc-zero-baseline')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
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

  const chart = new BarVerticalChart(clippedGroup)
  chart.config({ x, y, width, height, colors: options.colors ?? DEFAULT_COLORS, highlights })

  // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
  if (priorBars.length > 0) {
    const layerG = clippedGroup.node()!.querySelector('g')!
    priorBars.forEach(el => layerG.appendChild(el))
  }

  if (options.valueLabels) {
    chart.use(createValueLabelPlugin({
      position: options.valueLabelPosition, orientation: 'vertical' }))
  }
  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  if (options.crosshair) {
    chart.use(createCrosshairPlugin({
      width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
  }
  if (options.annotations?.length) {
    chart.use(createAnnotationPlugin(options.annotations, {
      scaleX: x, scaleY: y, data: barData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations }))
  }
  chart.draw(barData)
  setCachedChart(container, { chartType: 'bar-vertical' })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
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
