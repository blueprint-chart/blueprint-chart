import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { resolveHorizontalAxisBottom } from '../../axis/horizontal-axis'
import { AxisService } from '../../axis/axis-service'
import { computeLinearDomain, resolveBarGapPadding } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor, contrastTextColor } from '../../contrast'
import { buildNumberFormatter } from '../../format-helpers'
import { buildColorOverrides } from '../../plugins/colorize'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { ensureClipPath } from '../../clip-path-helper'
import { SortDirection, ValueLabelPosition, LabelPosition } from '../../../enums'
import { featureJoin, getSceneTransition } from '../../../transitions'
import { highlightOpacity } from '../../plugins/highlight'

export const DEFAULT_COLORS = ['#4e79a7']
const CATEGORY_LABEL_HEIGHT = 13

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
  initialize(): void {
    // Bars are rendered via featureJoin against the SceneTransition orchestrator
    // (see render()). This class is retained only as a host for legacy
    // plugins (tooltips, crosshair, annotations) that consume the D3Blueprint
    // API. Plugins will migrate to the orchestrator in Stages 3-4.
  }
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number } | undefined
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    axes.detach()
    if (cached && cached.chartType !== 'bar-vertical') {
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
  const useCategoryLabelLine = options.categoryLabelLine === true
  const vLabelW = estimateVerticalLabelWidth(data.values, options.verticalAxis?.range, options.verticalAxis?.numberFormat, options.verticalAxis?.scaleType)
  const effectiveHLabelPosition = useCategoryLabelLine ? LabelPosition.Off : options.horizontalAxis?.labelPosition
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, effectiveHLabelPosition, options.verticalAxis?.direction, vLabelW)
  if (!useCategoryLabelLine) {
    const availableX = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
    const rotatedBottom = resolveHorizontalAxisBottom(data.labels, availableX, options.horizontalAxis)
    if (rotatedBottom !== undefined) {
      lpMargins.bottom = rotatedBottom
    }
  }
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)
  const categoryLabelOffset = useCategoryLabelLine ? CATEGORY_LABEL_HEIGHT : 0
  const barAreaHeight = height - categoryLabelOffset
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
    .padding(resolveBarGapPadding(options.barGap))

  const useLog = options.verticalAxis?.scaleType === 'log'
  const domainValues = isWaterfall
    ? waterfallData.flatMap(d => [d.y0, d.y1])
    : barData.map(d => d.value)
  // eslint-disable-next-line prefer-const
  let [domainMin, domainMax] = computeLinearDomain(domainValues, options.verticalAxis?.range, options.verticalAxis?.scaleType)
  // Extend domain to leave room for value labels below negative bars
  if (options.valueLabels && domainMin < 0 && options.verticalAxis?.range?.min == null) {
    const span = domainMax - domainMin
    domainMin -= span * 0.1
  }
  const y = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([barAreaHeight, 0])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([barAreaHeight, 0])

  axes.attach(chartArea, marginDelta)
  const hAxisBase = swapLabelValue && options.valueLabels && !isWaterfall
    ? (() => {
        const valueMap = new Map(barData.map(d => [d.label, d.value]))
        return {
          ...options.horizontalAxis,
          width,
          tickFormat: (label: string) => String(valueMap.get(label) ?? label),
        }
      })()
    : { ...options.horizontalAxis, width }
  const hAxisOpts = useCategoryLabelLine ? { ...hAxisBase, labelPosition: LabelPosition.Off } : hAxisBase
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

  const colorOverrides = buildColorOverrides(options.colorizes)
  const highlightTargets = new Set((options.highlights ?? []).map(h => h.target))

  // Clip bars to the chart area so they truncate at axis boundaries.
  // Stable id per (container, key) keeps <defs> from growing on re-renders.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height: barAreaHeight })
  const defs = d3.select(svg).select<SVGDefsElement>('defs')
  // Stable suffix derived from the clip id so connection-gradient ids are
  // also deterministic across renders for the same container.
  const idSuffix = clipId.replace(/^bc-clip-/, '')
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
      .attr('x', (d: string) => x(d) ?? 0)
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', barAreaHeight)
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
        .attr('y1', 0).attr('y2', barAreaHeight)
        .attr('stroke', 'currentColor')
        .attr('opacity', 0.15)
    }
  }

  // Connection areas between adjacent bars — filled polygon between bar tops,
  // appended to clippedGroup before the bars so they stay below in z-order.
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
      const xCurrRight = (x(curr.label) ?? 0) + x.bandwidth()
      const xNextLeft = x(next.label) ?? 0
      const yCurrTop = Math.min(y(0), y(curr.value))
      const yNextTop = Math.min(y(0), y(next.value))
      const yBottom = y(0)
      const fillLeft = colorOverrides.get(curr.label) ?? connColors[0]
      const fillRight = colorOverrides.get(next.label) ?? connColors[0]
      let fillAttr: string
      if (fillLeft === fillRight) {
        fillAttr = fillLeft
      }
      else {
        const gradId = `bc-conn-grad-${idSuffix}-${i}`
        const grad = defs.append('linearGradient')
          .attr('id', gradId)
          .attr('x1', '0%').attr('x2', '100%')
          .attr('y1', '0%').attr('y2', '0%')
        grad.append('stop').attr('offset', '0%').attr('stop-color', fillLeft)
        grad.append('stop').attr('offset', '100%').attr('stop-color', fillRight)
        fillAttr = `url(#${gradId})`
      }
      clippedGroup.append('polygon')
        .attr('class', 'bc-bar-connection')
        .attr('points', `${xCurrRight},${yCurrTop} ${xNextLeft},${yNextTop} ${xNextLeft},${yBottom} ${xCurrRight},${yBottom}`)
        .attr('fill', fillAttr)
        .attr('opacity', connOpacity)
        .attr('pointer-events', 'none')
    }
  }

  // Unclipped group for value labels so they are never truncated at chart edges
  const unclippedGroup = d3.select(chartArea).append('g')

  if (isWaterfall) {
    // Waterfall mode: render bars with cumulative offsets directly
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
        const xCurrRight = (x(curr.label) ?? 0) + x.bandwidth()
        const xNextLeft = x(next.label) ?? 0
        const yCurrTop = y(curr.y1)
        const yNextTop = y(next.y1)
        const yCurrBottom = y(curr.y0)
        const yNextBottom = y(next.y0)
        const fillLeft = colorOverrides.get(curr.label) ?? connColors[0]
        const fillRight = colorOverrides.get(next.label) ?? connColors[0]
        let fillAttr: string
        if (fillLeft === fillRight) {
          fillAttr = fillLeft
        }
        else {
          const gradId = `bc-conn-grad-${idSuffix}-${i}`
          const grad = defs.append('linearGradient')
            .attr('id', gradId)
            .attr('x1', '0%').attr('x2', '100%')
            .attr('y1', '0%').attr('y2', '0%')
          grad.append('stop').attr('offset', '0%').attr('stop-color', fillLeft)
          grad.append('stop').attr('offset', '100%').attr('stop-color', fillRight)
          fillAttr = `url(#${gradId})`
        }
        clippedGroup.append('polygon')
          .attr('class', 'bc-bar-connection')
          .attr('points', `${xCurrRight},${yCurrTop} ${xNextLeft},${yNextTop} ${xNextLeft},${yNextBottom} ${xCurrRight},${yCurrBottom}`)
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
        .attr('x1', (x(curr.label) ?? 0) + x.bandwidth())
        .attr('x2', x(next.label) ?? 0)
        .attr('y1', y(curr.y1))
        .attr('y2', y(curr.y1))
        .attr('stroke', 'currentColor')
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.3)
    }

    clippedGroup.selectAll<Element, WaterfallDatum>('.bc-bar')
      .data(waterfallData, d => d.label)
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
      .attr('opacity', (d: WaterfallDatum) => highlightTargets.size > 0 ? highlightOpacity(highlightTargets, d.label) : null)

    if (options.valueLabels) {
      const pos = options.valueLabelPosition ?? ValueLabelPosition.Auto
      const vFmt = buildNumberFormatter(options.verticalAxis?.numberFormat ?? '')
      const formatValue = (v: number) => vFmt ? vFmt(v) : String(v)
      unclippedGroup.selectAll<Element, WaterfallDatum>('.bc-value-label')
        .data(waterfallData, d => d.label)
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
    const orch = getSceneTransition(container)

    // Bars — one feature per category, keyed by label.
    const barLayer = clippedGroup.append('g').node()!
    featureJoin<BarDatum>(orch, {
      role: 'mark-per-category',
      parent: barLayer,
      selector: '.bc-bar',
      data: barData,
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({
        x: x(d.label) ?? 0,
        y: Math.min(y(0), y(d.value)),
        width: x.bandwidth(),
        height: Math.abs(y(d.value) - y(0)),
        fill: colorOverrides.get(d.label) ?? (options.colors ?? DEFAULT_COLORS)[0],
        opacity: highlightOpacity(highlightTargets, d.label),
      }),
    })

    // Plugins host — kept on the legacy D3Blueprint path. Mounting on
    // clippedGroup so plugins find the `.bc-bar` elements that featureJoin
    // just inserted under barLayer.
    const chart = new BarVerticalChart(clippedGroup)
    if (options.tooltips) {
      chart.use(createTooltipPlugin({ numberFormat: options.verticalAxis?.numberFormat }))
    }
    if (options.crosshair) {
      chart.use(createCrosshairPlugin({
        width, height: barAreaHeight, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
    }
    if (options.annotations?.length) {
      chart.use(createAnnotationPlugin(options.annotations, {
        scaleX: x, scaleY: y, data: barData, width, height: barAreaHeight, backgroundColor: resolveBackgroundColor(container), transition, priorAnnotations }))
    }
    chart.draw(barData)

    if (options.valueLabels) {
      renderValueLabels(unclippedGroup, barData, x, y, {
        position: options.valueLabelPosition,
        colorOverrides,
        colors: options.colors ?? DEFAULT_COLORS,
        transition,
        swapLabelValue,
      })
    }
  }

  // Category labels on separate line
  if (useCategoryLabelLine) {
    const labelGroup = d3.select(chartArea).append('g').attr('class', 'bc-category-labels')
    for (const label of allLabels) {
      labelGroup.append('text')
        .attr('class', 'bc-category-label')
        .attr('x', (x(label) ?? 0) + x.bandwidth() / 2)
        .attr('y', barAreaHeight + CATEGORY_LABEL_HEIGHT / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', 'currentColor')
        .text(label)
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
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
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
  y: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  opts: {
    position?: ValueLabelPosition
    colorOverrides: Map<string, string>
    colors: string[]
    transition: boolean
    swapLabelValue?: boolean
  },
): void {
  const pos = opts.position ?? ValueLabelPosition.Auto
  const labelText = (d: BarDatum) => opts.swapLabelValue ? d.label : String(d.value)

  let labelGroup = parent.select<SVGGElement>('.bc-value-label-group')
  if (labelGroup.empty()) {
    labelGroup = parent.append('g').attr('class', 'bc-value-label-group')
  }

  // Resolve the container from the parent's owner. The parent here is the
  // unclippedGroup, which is mounted under the chartArea inside the chart's
  // SVG root, inside the chart container <div>.
  const ownerSvg = parent.node()!.ownerSVGElement
  const container = ownerSvg?.parentElement as HTMLElement
  const orch = getSceneTransition(container)

  featureJoin<BarDatum>(orch, {
    role: 'value-label',
    parent: labelGroup.node()!,
    selector: '.bc-value-label',
    data: barData,
    key: d => d.label,
    insert: sel => sel.append('text')
      .attr('class', 'bc-value-label')
      .attr('font-size', '11px'),
    attrs: (d) => {
      const a = valueLabelAttrs(d, x, y, pos)
      return {
        'x': a.tx,
        'y': a.ty,
        'text-anchor': a.anchor,
        'dominant-baseline': a.baseline,
        'fill': a.isInside
          ? contrastTextColor(opts.colorOverrides.get(d.label) ?? opts.colors[0])
          : 'currentColor',
      }
    },
  })

  // featureJoin only manages attributes, not text content. Set text content
  // for both enter and update bars in a second pass keyed by the same label.
  labelGroup.selectAll<SVGTextElement, BarDatum>('.bc-value-label')
    .data(barData, (d: BarDatum) => d.label)
    .text(labelText)
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
