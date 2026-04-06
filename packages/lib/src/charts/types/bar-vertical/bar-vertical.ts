import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { computeLinearDomain } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor, contrastTextColor } from '../../contrast'
import { buildNumberFormatter } from '../../format-helpers'
import { getDefaultTransitionMs, setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut, reinsertWithOffset } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { SortDirection, ValueLabelPosition } from '../../../enums'

const DEFAULT_COLORS = ['#4e79a7']

interface BarDatum {
  label: string
  value: number
}

interface WaterfallDatum {
  label: string
  value: number
  y0: number
  y1: number
  isTotal: boolean
}

class BarVerticalChart extends D3Blueprint<BarDatum[]> {
  initialize() {
    this.configDefine('x', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('y', { defaultValue: d3.scaleLinear() })
    this.configDefine('width', { defaultValue: 0 })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('colorOverrides', { defaultValue: new Map<string, string>() })
    this.configDefine('highlightTargets', { defaultValue: new Set<string>() })
    this.configDefine('swapLabelValue', { defaultValue: false })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-bar').data(data, (d: BarDatum) => d.label),
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const colors = this.config('colors') as string[]
          const colorOverrides = this.config('colorOverrides') as Map<string, string>
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          const x = this.config('x') as d3.ScaleBand<string>
          const y = this.config('y') as d3.ScaleLinear<number, number>
          sel
            .attr('x', (d: BarDatum) => x(d.label) ?? 0)
            .attr('y', (d: BarDatum) => Math.min(y(0), y(d.value)))
            .attr('width', x.bandwidth())
            .attr('height', (d: BarDatum) => Math.abs(y(d.value) - y(0)))
            .attr('fill', (d: BarDatum) => colorOverrides.get(d.label) ?? colors[0])
            .attr('opacity', (d: BarDatum) => hasHl ? (hl.has(d.label) ? 1 : 0.2) : null)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const colors = this.config('colors') as string[]
          const colorOverrides = this.config('colorOverrides') as Map<string, string>
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          const x = this.config('x') as d3.ScaleBand<string>
          const y = this.config('y') as d3.ScaleLinear<number, number>
          sel.duration(getDefaultTransitionMs())
            .attr('x', (d: BarDatum) => x(d.label) ?? 0)
            .attr('y', (d: BarDatum) => Math.min(y(0), y(d.value)))
            .attr('width', x.bandwidth())
            .attr('height', (d: BarDatum) => Math.abs(y(d.value) - y(0)))
            .attr('fill', (d: BarDatum) => colorOverrides.get(d.label) ?? colors[0])
            .attr('opacity', (d: BarDatum) => hasHl ? (hl.has(d.label) ? 1 : 0.2) : null)
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
  setRenderTransition(transition)
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
    if (cached?.chartType === 'bar-vertical') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar'))
      priorLabels = Array.from(container.querySelectorAll('.bc-frame .bc-value-label'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
    // Snapshot annotation positions before clearing
    priorAnnotations = new Map()
    for (const el of container.querySelectorAll('.bc-frame .bc-annotations, .bc-frame .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        priorAnnotations.set(k, v)
      }
    }
    container.replaceChildren()
  }

  const { body } = createFrame(container, options.frame)
  const containerWidth = contentSize(body).width
  const vLabelW = estimateVerticalLabelWidth(data.values, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)
  const marginDelta = computeMarginDelta(priorMargin, margin)

  const labels = sortLabels(data, options)
  const barData: BarDatum[] = labels.map(l => ({
    label: l,
    value: data.values[data.labels.indexOf(l)],
  }))

  const swapLabelValue = options.swapLabelValue === true
  const isWaterfall = options.waterfall === true

  // Build waterfall data (cumulative y0/y1) when enabled
  const waterfallData: WaterfallDatum[] = []
  if (isWaterfall) {
    let cumulative = 0
    for (const d of barData) {
      const y0 = cumulative
      cumulative += d.value
      waterfallData.push({ label: d.label, value: d.value, y0, y1: cumulative, isTotal: false })
    }
    if (options.waterfallTotal) {
      waterfallData.push({ label: 'Total', value: cumulative, y0: 0, y1: cumulative, isTotal: true })
    }
  }

  // Normal: x = scaleBand (labels), y = scaleLinear (values)
  const allLabels = isWaterfall ? waterfallData.map(d => d.label) : labels
  const x = d3.scaleBand<string>()
    .domain(allLabels)
    .range([0, width])
    .padding(0.2)

  const useLog = options.verticalAxis?.scaleType === 'log'
  const domainValues = isWaterfall
    ? waterfallData.flatMap(d => [d.y0, d.y1])
    : barData.map(d => d.value)
  // eslint-disable-next-line prefer-const
  let [domainMin, domainMax] = computeLinearDomain(domainValues, options.verticalAxis?.range)
  // Extend domain to leave room for value labels below negative bars
  if (options.valueLabels && domainMin < 0 && options.verticalAxis?.range?.min == null) {
    const span = domainMax - domainMin
    domainMin -= span * 0.1
  }
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([height, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([height, 0])

  axes.attach(chartArea, marginDelta)
  const hAxisOpts = swapLabelValue && options.valueLabels && !isWaterfall
    ? (() => {
        const valueMap = new Map(barData.map(d => [d.label, d.value]))
        return {
          ...options.horizontalAxis,
          width,
          tickFormat: (label: string) => String(valueMap.get(label) ?? label),
        }
      })()
    : { ...options.horizontalAxis, width }
  axes.update({
    vertical: { scale: y, height, options: { ...options.verticalAxis, gridWidth: width, topPadding: margin.top } },
    horizontal: { scale: x, height, options: hAxisOpts },
  })

  // Zero baseline when domain spans zero
  if (!useLog && domainMin < 0 && domainMax > 0) {
    d3.select(chartArea).append('line')
      .attr('class', 'bc-zero-baseline')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#666').attr('stroke-width', 1)
  }

  const colorOverrides = new Map(
    (options.colorizes ?? []).map(h => [h.target, h.color]),
  )
  const highlightTargets = new Set((options.highlights ?? []).map(h => h.target))

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
    const bgLabels = isWaterfall ? allLabels : barData.map(d => d.label)
    clippedGroup.selectAll('.bc-bar-bg')
      .data(bgLabels, (d: string) => d)
      .enter()
      .append('rect')
      .attr('class', 'bc-bar-bg')
      .attr('x', (d: string) => x(d) ?? 0)
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', height)
      .attr('fill', bgColor)
      .attr('opacity', 0.18)
  }

  // Bar separators — lines between adjacent bands
  const sepLabels = isWaterfall ? allLabels : barData.map(d => d.label)
  if (options.barSeparators && sepLabels.length > 1) {
    const step = x.step()
    for (let i = 1; i < sepLabels.length; i++) {
      const xPos = (x(sepLabels[i - 1]) ?? 0) + x.bandwidth() + (step - x.bandwidth()) / 2
      clippedGroup.append('line')
        .attr('class', 'bc-bar-separator')
        .attr('x1', xPos).attr('x2', xPos)
        .attr('y1', 0).attr('y2', height)
        .attr('stroke', 'currentColor')
        .attr('opacity', 0.15)
    }
  }

  // Unclipped group for value labels so they are never truncated at chart edges
  const unclippedGroup = d3.select(chartArea).append('g')

  if (isWaterfall) {
    // Waterfall mode: render bars with cumulative offsets directly
    const colors = options.colors ?? DEFAULT_COLORS
    const totalColor = '#333'

    // Connector lines between bars
    for (let i = 0; i < waterfallData.length - 1; i++) {
      const curr = waterfallData[i]
      const next = waterfallData[i + 1]
      if (next.isTotal) {
        break
      }
      clippedGroup.append('line')
        .attr('class', 'bc-waterfall-connector')
        .attr('x1', (x(curr.label) ?? 0) + x.bandwidth())
        .attr('x2', x(next.label) ?? 0)
        .attr('y1', y(curr.y1))
        .attr('y2', y(curr.y1))
        .attr('stroke', 'currentColor')
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.3)
    }

    clippedGroup.selectAll('.bc-bar')
      .data(waterfallData, (d: WaterfallDatum) => d.label)
      .enter()
      .append('rect')
      .attr('class', 'bc-bar')
      .attr('x', (d: WaterfallDatum) => x(d.label) ?? 0)
      .attr('y', (d: WaterfallDatum) => Math.min(y(d.y0), y(d.y1)))
      .attr('width', x.bandwidth())
      .attr('height', (d: WaterfallDatum) => Math.abs(y(d.y0) - y(d.y1)))
      .attr('fill', (d: WaterfallDatum) => {
        if (d.isTotal) {
          return totalColor
        }
        return colorOverrides.get(d.label) ?? colors[0]
      })
      .attr('opacity', (d: WaterfallDatum) => highlightTargets.size > 0 ? (highlightTargets.has(d.label) ? 1 : 0.2) : null)

    if (options.valueLabels) {
      const pos = options.valueLabelPosition ?? ValueLabelPosition.Auto
      const vFmt = buildNumberFormatter(options.verticalAxis?.numberFormat ?? '')
      const formatValue = (v: number) => vFmt ? vFmt(v) : String(v)
      unclippedGroup.selectAll('.bc-value-label')
        .data(waterfallData, (d: WaterfallDatum) => d.label)
        .enter()
        .append('text')
        .attr('class', 'bc-value-label')
        .attr('font-size', '11px')
        .attr('x', (d: WaterfallDatum) => (x(d.label) ?? 0) + x.bandwidth() / 2)
        .attr('y', (d: WaterfallDatum) => {
          const top = Math.min(y(d.y0), y(d.y1))
          const barH = Math.abs(y(d.y0) - y(d.y1))
          if (pos === ValueLabelPosition.Inside) {
            return top + barH / 2
          }
          return top - 4
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', pos === ValueLabelPosition.Inside ? 'central' : 'auto')
        .attr('fill', (d: WaterfallDatum) => {
          if (pos === ValueLabelPosition.Inside) {
            return contrastTextColor(d.isTotal ? totalColor : colorOverrides.get(d.label) ?? colors[0])
          }
          return 'currentColor'
        })
        .text((d: WaterfallDatum) => swapLabelValue ? d.label : formatValue(d.isTotal ? d.y1 : d.value))
    }
  }
  else {
    const chart = new BarVerticalChart(clippedGroup)
    chart.config({ x, y, width, height, colors: options.colors ?? DEFAULT_COLORS, colorOverrides, highlightTargets, swapLabelValue })

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
        width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
    }
    if (options.annotations?.length) {
      chart.use(createAnnotationPlugin(options.annotations, {
        scaleX: x, scaleY: y, data: barData, width, height, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations }))
    }
    chart.draw(barData)

    if (options.valueLabels) {
      renderValueLabels(unclippedGroup, barData, x, y, {
        position: options.valueLabelPosition,
        colorOverrides,
        colors: options.colors ?? DEFAULT_COLORS,
        transition,
        priorLabels,
        swapLabelValue,
      })
    }
  }

  setCachedChart(container, { chartType: 'bar-vertical', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}

function valueLabelAttrs(
  d: BarDatum,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog,
  pos: ValueLabelPosition,
) {
  const barH = Math.abs(y(d.value) - y(0))
  const isInside = pos === ValueLabelPosition.Inside
  const tx = (x(d.label) ?? 0) + x.bandwidth() / 2
  const anchor = 'middle'
  let ty: number, baseline: string
  if (d.value < 0) {
    if (isInside) {
      ty = y(d.value) - barH / 2
      baseline = 'central'
    }
    else {
      ty = y(d.value) + 4
      baseline = 'hanging'
    }
  }
  else {
    if (isInside) {
      ty = y(d.value) + barH / 2
      baseline = 'central'
    }
    else {
      ty = y(d.value) - 4
      baseline = 'auto'
    }
  }
  return { tx, ty, anchor, baseline, isInside }
}

function renderValueLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  barData: BarDatum[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog,
  opts: {
    position?: ValueLabelPosition
    colorOverrides: Map<string, string>
    colors: string[]
    transition: boolean
    priorLabels: Element[]
    swapLabelValue?: boolean
  },
) {
  const pos = opts.position ?? ValueLabelPosition.Auto
  const labelText = (d: BarDatum) => opts.swapLabelValue ? d.label : String(d.value)

  let labelGroup = parent.select<SVGGElement>('.bc-value-label-group')
  if (labelGroup.empty()) {
    labelGroup = parent.append('g').attr('class', 'bc-value-label-group')
  }

  if (opts.priorLabels.length > 0) {
    const node = labelGroup.node()!
    opts.priorLabels.forEach(el => node.appendChild(el))
  }

  const join = labelGroup.selectAll<SVGTextElement, BarDatum>('.bc-value-label')
    .data(barData, (d: BarDatum) => d.label)

  join.exit()
    .transition().duration(getDefaultTransitionMs())
    .attr('opacity', 0)
    .remove()

  const enter = join.enter()
    .append('text')
    .attr('class', 'bc-value-label')
    .attr('font-size', '11px')
    .each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos)
      d3.select(this)
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
        .attr('dominant-baseline', a.baseline)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.colorOverrides.get(d.label) ?? opts.colors[0])
          : 'currentColor')
        .text(labelText(d))
    })

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
        .attr('dominant-baseline', a.baseline)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.colorOverrides.get(d.label) ?? opts.colors[0])
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
        .attr('dominant-baseline', a.baseline)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.colorOverrides.get(d.label) ?? opts.colors[0])
          : 'currentColor')
        .text(labelText(d))
    })
  }
}

function sortLabels(data: ChartData, options: ChartOptions): string[] {
  const paired = data.labels.map((l, i) => ({ label: l, value: data.values[i] }))
  if (options.sort === SortDirection.Ascending) {
    paired.sort((a, b) => a.value - b.value)
  }
  else if (options.sort === SortDirection.Descending) {
    paired.sort((a, b) => b.value - a.value)
  }
  return paired.map(p => p.label)
}
