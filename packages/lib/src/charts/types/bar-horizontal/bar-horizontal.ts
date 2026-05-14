import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { computeLinearDomain, resolveBarGapPadding } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor, contrastTextColor } from '../../contrast'
import { buildNumberFormatter } from '../../format-helpers'
import { getDefaultTransitionMs, setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut, reinsertWithOffset } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { SortDirection, ValueLabelPosition, Orientation, LabelPosition } from '../../../enums'

export const DEFAULT_COLORS = ['#4e79a7']
const CATEGORY_LABEL_HEIGHT = 13
const VALUE_LABEL_FONT = '11px sans-serif'
const VALUE_LABEL_GAP = 4

interface BarDatum {
  label: string
  value: number
}

interface WaterfallDatum {
  label: string
  value: number
  x0: number
  x1: number
  isTotal: boolean
}

class BarHorizontalChart extends D3Blueprint<BarDatum[]> {
  initialize() {
    this.configDefine('x', { defaultValue: d3.scaleLinear() })
    this.configDefine('y', { defaultValue: d3.scaleBand<string>() })
    this.configDefine('width', { defaultValue: 0 })
    this.configDefine('height', { defaultValue: 0 })
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('colorOverrides', { defaultValue: new Map<string, string>() })
    this.configDefine('highlightTargets', { defaultValue: new Set<string>() })
    this.configDefine('swapLabelValue', { defaultValue: false })
    this.configDefine('categoryLabelOffset', { defaultValue: 0 })

    const g = this.base.append('g')

    this.layer('bars', g, {
      dataBind: (sel, data) => sel.selectAll<Element, BarDatum>('.bc-bar').data(data, d => d.label),
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const colors = this.config('colors') as string[]
          const colorOverrides = this.config('colorOverrides') as Map<string, string>
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          const catOffset = this.config('categoryLabelOffset') as number
          sel
            .attr('x', (d: BarDatum) => Math.min(x(0), x(d.value)))
            .attr('y', (d: BarDatum) => (y(d.label) ?? 0) + catOffset)
            .attr('width', (d: BarDatum) => Math.abs(x(d.value) - x(0)))
            .attr('height', y.bandwidth() - catOffset)
            .attr('fill', (d: BarDatum) => colorOverrides.get(d.label) ?? colors[0])
            .attr('opacity', (d: BarDatum) => hasHl ? (hl.has(d.label) ? 1 : 0.2) : null)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const colors = this.config('colors') as string[]
          const colorOverrides = this.config('colorOverrides') as Map<string, string>
          const hl = this.config('highlightTargets') as Set<string>
          const hasHl = hl.size > 0
          const x = this.config('x') as d3.ScaleLinear<number, number>
          const y = this.config('y') as d3.ScaleBand<string>
          const catOffset = this.config('categoryLabelOffset') as number
          sel.duration(getDefaultTransitionMs())
            .attr('x', (d: BarDatum) => Math.min(x(0), x(d.value)))
            .attr('y', (d: BarDatum) => (y(d.label) ?? 0) + catOffset)
            .attr('width', (d: BarDatum) => Math.abs(x(d.value) - x(0)))
            .attr('height', y.bandwidth() - catOffset)
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
    if (cached?.chartType === 'bar-horizontal') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar'))
      priorLabels = Array.from(container.querySelectorAll('.bc-frame .bc-value-label'))
    }
    else if (cached) {
      fadeOverlay = snapshotForFadeOut(container)
    }
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
  // On narrow containers, category labels on the vertical axis get hidden
  // behind bars when positioned "inside" or are explicitly "off".
  // Auto-switch to categoryLabelLine so labels render above each bar.
  // Only skip when the user explicitly chose "outside".
  const autoNarrow = containerWidth > 0
    && containerWidth < 400
    && options.verticalAxis?.labelPosition !== 'outside'
  const useCategoryLabelLine = options.categoryLabelLine === true || autoNarrow
  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const effectiveVLabelPosition = useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition
  const lpMargins = labelPositionMargins(containerWidth, effectiveVLabelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW, options.horizontalAxis?.showAxis)

  // Reserve extra margin for outside value labels
  const valueLabelPos = options.valueLabelPosition ?? ValueLabelPosition.Auto
  const swapLabelValue = options.swapLabelValue === true
  if (options.valueLabels && valueLabelPos !== ValueLabelPosition.Inside) {
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
  const categoryLabelOffset = useCategoryLabelLine ? CATEGORY_LABEL_HEIGHT : 0
  const marginDelta = computeMarginDelta(priorMargin, margin)

  const labels = sortLabels(data, options)
  const barData: BarDatum[] = labels.map(l => ({
    label: l,
    value: data.values[data.labels.indexOf(l)],
  }))

  const isWaterfall = options.waterfall === true

  // Build waterfall data (cumulative x0/x1) when enabled
  const waterfallData: WaterfallDatum[] = []
  if (isWaterfall) {
    let cumulative = 0
    for (const d of barData) {
      const x0 = cumulative
      cumulative += d.value
      waterfallData.push({ label: d.label, value: d.value, x0, x1: cumulative, isTotal: false })
    }
    if (options.waterfallTotal) {
      waterfallData.push({ label: 'Total', value: cumulative, x0: 0, x1: cumulative, isTotal: true })
    }
  }

  // Normal: x = scaleLinear (values), y = scaleBand (labels)
  const useLog = options.horizontalAxis?.scaleType === 'log'
  const domainValues = isWaterfall
    ? waterfallData.flatMap(d => [d.x0, d.x1])
    : barData.map(d => d.value)
  const [domainMin, domainMax] = computeLinearDomain(domainValues, options.horizontalAxis?.range)
  const x = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([0, width])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([0, width])

  const allLabels = isWaterfall ? waterfallData.map(d => d.label) : labels
  const y = d3.scaleBand<string>()
    .domain(allLabels)
    .range([0, height])
    .padding(resolveBarGapPadding(options.barGap))

  const vAxisBase = swapLabelValue && options.valueLabels && !isWaterfall
    ? (() => {
        const valueMap = new Map(barData.map(d => [d.label, d.value]))
        return {
          ...options.verticalAxis,
          topPadding: margin.top,
          tickFormat: (label: string) => String(valueMap.get(label) ?? label),
        }
      })()
    : { ...options.verticalAxis, topPadding: margin.top }
  const vAxisOpts = useCategoryLabelLine
    ? { ...vAxisBase, labelPosition: LabelPosition.Off, ...(autoNarrow ? { showAxis: false } : {}) }
    : vAxisBase
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

  const colorOverrides = new Map(
    (options.colorizes ?? []).map(h => [h.target, h.color]),
  )
  const highlightTargets = new Set((options.highlights ?? []).map(h => h.target))

  // Clip bars to the chart area so they truncate at axis boundaries
  const idSuffix = Math.random().toString(36).slice(2, 8)
  const clipId = `bc-clip-${idSuffix}`
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
    clippedGroup.selectAll<Element, string>('.bc-bar-bg')
      .data(bgLabels, d => d)
      .enter()
      .append('rect')
      .attr('class', 'bc-bar-bg')
      .attr('x', 0)
      .attr('y', (d: string) => (y(d) ?? 0) + categoryLabelOffset)
      .attr('width', width)
      .attr('height', y.bandwidth() - categoryLabelOffset)
      .attr('fill', bgColor)
      .attr('opacity', 0.18)
  }

  // Bar separators — lines between adjacent bands
  const sepLabels = isWaterfall ? allLabels : barData.map(d => d.label)
  if (options.barSeparators && sepLabels.length > 1) {
    const step = y.step()
    for (let i = 1; i < sepLabels.length; i++) {
      const yPos = (y(sepLabels[i - 1]) ?? 0) + y.bandwidth() + (step - y.bandwidth()) / 2
      clippedGroup.append('line')
        .attr('class', 'bc-bar-separator')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', yPos).attr('y2', yPos)
        .attr('stroke', 'currentColor')
        .attr('opacity', 0.15)
    }
  }

  // Connection areas between adjacent horizontal bars — filled polygon spanning
  // the right-edges of adjacent bars, appended to clippedGroup before the bars
  // so they stay below in z-order.
  if (!isWaterfall && options.connectedColumns && barData.length > 1) {
    const connColors = options.colors ?? DEFAULT_COLORS
    const connOpacity = options.connectionsOpacity ?? 0.15
    for (let i = 0; i < barData.length - 1; i++) {
      const curr = barData[i]
      const next = barData[i + 1]
      if (
        curr.value == null || next.value == null
        || Number.isNaN(curr.value) || Number.isNaN(next.value)
        || curr.value === 0 || next.value === 0
      ) {
        continue
      }
      const yCurrBottom = (y(curr.label) ?? 0) + y.bandwidth()
      const yNextTop = (y(next.label) ?? 0) + categoryLabelOffset
      const xCurrRight = Math.max(x(0), x(curr.value))
      const xNextRight = Math.max(x(0), x(next.value))
      const xLeft = x(0)
      const fillTop = colorOverrides.get(curr.label) ?? connColors[0]
      const fillBottom = colorOverrides.get(next.label) ?? connColors[0]
      let fillAttr: string
      if (fillTop === fillBottom) {
        fillAttr = fillTop
      }
      else {
        const gradId = `bc-conn-grad-${idSuffix}-${i}`
        const grad = defs.append('linearGradient')
          .attr('id', gradId)
          .attr('x1', '0%').attr('x2', '0%')
          .attr('y1', '0%').attr('y2', '100%')
        grad.append('stop').attr('offset', '0%').attr('stop-color', fillTop)
        grad.append('stop').attr('offset', '100%').attr('stop-color', fillBottom)
        fillAttr = `url(#${gradId})`
      }
      clippedGroup.append('polygon')
        .attr('class', 'bc-bar-connection')
        .attr('points', `${xCurrRight},${yCurrBottom} ${xNextRight},${yNextTop} ${xLeft},${yNextTop} ${xLeft},${yCurrBottom}`)
        .attr('fill', fillAttr)
        .attr('opacity', connOpacity)
        .attr('pointer-events', 'none')
    }
  }

  if (isWaterfall) {
    const colors = options.colors ?? DEFAULT_COLORS
    const totalColor = '#333'

    // Connection areas between adjacent waterfall bars — appended before
    // connector lines & bars so they paint below in z-order.
    if (options.connectedColumns && waterfallData.length > 1) {
      const connColors = options.colors ?? DEFAULT_COLORS
      const connOpacity = options.connectionsOpacity ?? 0.15
      for (let i = 0; i < waterfallData.length - 1; i++) {
        const curr = waterfallData[i]
        const next = waterfallData[i + 1]
        if (next.isTotal) {
          continue
        }
        if (
          curr.value == null || next.value == null
          || Number.isNaN(curr.value) || Number.isNaN(next.value)
          || curr.value === 0 || next.value === 0
        ) {
          continue
        }
        const yCurrBottom = (y(curr.label) ?? 0) + y.bandwidth()
        const yNextTop = (y(next.label) ?? 0) + categoryLabelOffset
        const xCurrEnd = x(curr.x1)
        const xNextEnd = x(next.x1)
        const xCurrOrigin = x(curr.x0)
        const xNextOrigin = x(next.x0)
        const fillTop = colorOverrides.get(curr.label) ?? connColors[0]
        const fillBottom = colorOverrides.get(next.label) ?? connColors[0]
        let fillAttr: string
        if (fillTop === fillBottom) {
          fillAttr = fillTop
        }
        else {
          const gradId = `bc-conn-grad-${idSuffix}-${i}`
          const grad = defs.append('linearGradient')
            .attr('id', gradId)
            .attr('x1', '0%').attr('x2', '0%')
            .attr('y1', '0%').attr('y2', '100%')
          grad.append('stop').attr('offset', '0%').attr('stop-color', fillTop)
          grad.append('stop').attr('offset', '100%').attr('stop-color', fillBottom)
          fillAttr = `url(#${gradId})`
        }
        clippedGroup.append('polygon')
          .attr('class', 'bc-bar-connection')
          .attr('points', `${xCurrEnd},${yCurrBottom} ${xNextEnd},${yNextTop} ${xNextOrigin},${yNextTop} ${xCurrOrigin},${yCurrBottom}`)
          .attr('fill', fillAttr)
          .attr('opacity', connOpacity)
          .attr('pointer-events', 'none')
      }
    }

    // Connector lines between bars
    for (let i = 0; i < waterfallData.length - 1; i++) {
      const curr = waterfallData[i]
      const next = waterfallData[i + 1]
      if (next.isTotal) {
        break
      }
      clippedGroup.append('line')
        .attr('class', 'bc-waterfall-connector')
        .attr('x1', x(curr.x1))
        .attr('x2', x(curr.x1))
        .attr('y1', (y(curr.label) ?? 0) + y.bandwidth())
        .attr('y2', (y(next.label) ?? 0) + categoryLabelOffset)
        .attr('stroke', 'currentColor')
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.3)
    }

    clippedGroup.selectAll<Element, WaterfallDatum>('.bc-bar')
      .data(waterfallData, d => d.label)
      .enter()
      .append('rect')
      .attr('class', 'bc-bar')
      .attr('x', (d: WaterfallDatum) => Math.min(x(d.x0), x(d.x1)))
      .attr('y', (d: WaterfallDatum) => (y(d.label) ?? 0) + categoryLabelOffset)
      .attr('width', (d: WaterfallDatum) => Math.abs(x(d.x1) - x(d.x0)))
      .attr('height', y.bandwidth() - categoryLabelOffset)
      .attr('fill', (d: WaterfallDatum) => {
        if (d.isTotal) {
          return totalColor
        }
        return colorOverrides.get(d.label) ?? colors[0]
      })
      .attr('opacity', (d: WaterfallDatum) => highlightTargets.size > 0 ? (highlightTargets.has(d.label) ? 1 : 0.2) : null)

    if (options.valueLabels) {
      const pos = valueLabelPos
      const hFmt = buildNumberFormatter(options.horizontalAxis?.numberFormat ?? '')
      const formatValue = (v: number) => hFmt ? hFmt(v) : String(v)
      const labelParent = d3.select(chartArea).append('g') as d3.Selection<SVGGElement, unknown, null, undefined>
      labelParent.selectAll<Element, WaterfallDatum>('.bc-value-label')
        .data(waterfallData, d => d.label)
        .enter()
        .append('text')
        .attr('class', 'bc-value-label')
        .attr('font-size', '11px')
        .attr('dominant-baseline', 'central')
        .attr('y', (d: WaterfallDatum) => (y(d.label) ?? 0) + categoryLabelOffset + (y.bandwidth() - categoryLabelOffset) / 2)
        .attr('x', (d: WaterfallDatum) => {
          const right = Math.max(x(d.x0), x(d.x1))
          if (pos === ValueLabelPosition.Inside) {
            return right - 4
          }
          return right + 4
        })
        .attr('text-anchor', pos === ValueLabelPosition.Inside ? 'end' : 'start')
        .attr('fill', (d: WaterfallDatum) => {
          if (pos === ValueLabelPosition.Inside) {
            return contrastTextColor(d.isTotal ? totalColor : colorOverrides.get(d.label) ?? colors[0])
          }
          return 'currentColor'
        })
        .text((d: WaterfallDatum) => swapLabelValue ? d.label : formatValue(d.isTotal ? d.x1 : d.value))
    }
  }
  else {
    const chart = new BarHorizontalChart(clippedGroup)
    chart.config({ x, y, width, height, colors: options.colors ?? DEFAULT_COLORS, colorOverrides, highlightTargets, swapLabelValue, categoryLabelOffset })

    // Re-insert prior elements so D3 data-join finds them and triggers merge:transition
    if (priorBars.length > 0) {
      const layerG = clippedGroup.node()!.querySelector('g')!
      reinsertWithOffset(layerG, priorBars, marginDelta?.dx ?? 0, marginDelta?.dy ?? 0)
    }
    if (options.tooltips) {
      chart.use(createTooltipPlugin({ numberFormat: options.horizontalAxis?.numberFormat }))
    }
    if (options.crosshair) {
      chart.use(createCrosshairPlugin({
        width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal }))
    }
    if (options.annotations?.length) {
      chart.use(createAnnotationPlugin(options.annotations, {
        scaleX: y, scaleY: x, data: barData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: Orientation.Horizontal, transition, priorAnnotations }))
    }
    chart.draw(barData)

    if (options.valueLabels) {
      // Render value labels in an unclipped group so outside labels aren't truncated
      const labelParent = d3.select(chartArea).append('g') as d3.Selection<SVGGElement, unknown, null, undefined>
      renderValueLabels(labelParent, barData, x, y, {
        position: valueLabelPos,
        colorOverrides,
        colors: options.colors ?? DEFAULT_COLORS,
        transition,
        priorLabels,
        swapLabelValue,
        categoryLabelOffset,
      })
    }
  }

  // Category labels on separate line
  if (useCategoryLabelLine) {
    const labelGroup = d3.select(chartArea).append('g').attr('class', 'bc-category-labels')
    for (const label of allLabels) {
      const groupTop = y(label) ?? 0
      labelGroup.append('text')
        .attr('class', 'bc-category-label')
        .attr('x', 2)
        .attr('y', groupTop + CATEGORY_LABEL_HEIGHT / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', 'currentColor')
        .text(label)
    }
  }

  setCachedChart(container, { chartType: 'bar-horizontal', margin })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}

function valueLabelAttrs(
  d: BarDatum,
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  y: d3.ScaleBand<string>,
  pos: ValueLabelPosition,
  catOffset = 0,
) {
  const isInside = pos === ValueLabelPosition.Inside
  const ty = (y(d.label) ?? 0) + catOffset + (y.bandwidth() - catOffset) / 2
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
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  y: d3.ScaleBand<string>,
  opts: {
    position?: ValueLabelPosition
    colorOverrides: Map<string, string>
    colors: string[]
    transition: boolean
    priorLabels: Element[]
    swapLabelValue?: boolean
    categoryLabelOffset?: number
  },
) {
  const pos = opts.position ?? ValueLabelPosition.Auto
  const catOffset = opts.categoryLabelOffset ?? 0
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
      const a = valueLabelAttrs(d, x, y, pos, catOffset)
      d3.select(this)
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.colorOverrides.get(d.label) ?? opts.colors[0])
          : 'currentColor')
        .text(labelText(d))
    })

  // Merge — update all labels to new positions
  const merged = enter.merge(join)
  if (opts.transition) {
    merged.each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos, catOffset)
      d3.select(this)
        .text(labelText(d))
        .transition().duration(getDefaultTransitionMs())
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
        .attr('fill', a.isInside
          ? contrastTextColor(opts.colorOverrides.get(d.label) ?? opts.colors[0])
          : 'currentColor')
    })
  }
  else {
    merged.each(function (d) {
      const a = valueLabelAttrs(d, x, y, pos, catOffset)
      d3.select(this)
        .attr('x', a.tx)
        .attr('y', a.ty)
        .attr('text-anchor', a.anchor)
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
