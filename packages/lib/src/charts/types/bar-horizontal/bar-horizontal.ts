import * as d3 from 'd3'
import 'd3-transition'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize, labelPositionMargins, estimateCategoryLabelWidth, computeMarginDelta } from '../../canvas/canvas'
import { AxisService } from '../../axis/axis-service'
import { computeLinearDomain, resolveBarGapPadding } from '../../scale-helpers'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { resolveOverlays, barCue, overlayDomainValues, overlayTooltipFormat, mountOverlayLayer, drawOverlayLegend, planOverlayLabels, drawOverlayDirectLabelGroup, type OverlayGeometry } from '../../overlays/overlays'
import { overlayKeyLayout } from '../../overlays/overlay-key'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor, contrastTextColor } from '../../contrast'
import { formatValueLabel, percentValueLabel } from '../../format-helpers'
import { buildColorOverrides } from '../../plugins/colorize'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { ensureClipPath } from '../../clip-path-helper'
import { ValueLabelPosition, Orientation, LabelPosition } from '../../../enums'
import { sortByValue } from '../../sort-helpers'
import { featureJoin, getSceneTransition, tweenPlotFrame, type PlotRect } from '../../../transitions'
import { createPluginHost } from '../../plugins/plugin-host'
import { highlightTargetSet, highlightOpacity, CUE_FADE_OPACITY } from '../../plugins/highlight'
import { shouldRenderValueLabel, estimateTextInk } from '../../value-label-fit'
import { CATEGORY_LABEL_HEIGHT, categoryLabelLineHeight, categoryLabelsNeedTheirOwnLine } from '../../category-label-line'
import { DEFAULT_COLORS as DEFAULT_PALETTE } from '../../palettes'

export const DEFAULT_COLORS = [DEFAULT_PALETTE[0]]
const VALUE_LABEL_GAP = 4

/** Plot geometry a value label has to stay inside of. */
interface LabelBounds {
  plotWidth: number
  marginLeft: number
  marginRight: number
}

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

export function render(
  container: HTMLElement,
  rawData: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  setRenderTransition(transition)
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  let priorMargin: { top: number, left: number, right: number, bottom: number } | undefined
  // Prior bar rects, re-inserted into the featureJoin layer so the data-join
  // matches them as updates: that gives the resize tween its "from" shape.
  let priorBars: Element[] = []
  let priorOverlays: Element[] = []
  let priorPlotRect: PlotRect | undefined
  const axes = AxisService.for(container)
  if (transition) {
    const cached = getCachedChart(container)
    priorMargin = cached?.margin
    priorPlotRect = cached?.plotRect
    axes.detach()
    if (cached?.chartType === 'bar-horizontal') {
      priorBars = Array.from(container.querySelectorAll('.bc-frame .bc-bar'))
      priorOverlays = Array.from(container.querySelectorAll('.bc-frame .bc-overlay'))
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
  const resolved = resolveOverlays(rawData, options.overlays)
  const data = resolved.data
  const containerWidth = contentSize(body).width
  const autoNarrow = categoryLabelsNeedTheirOwnLine(containerWidth, options.verticalAxis?.labelPosition)
  const useCategoryLabelLine = options.categoryLabelLine === true || autoNarrow
  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const effectiveVLabelPosition = useCategoryLabelLine ? LabelPosition.Off : options.verticalAxis?.labelPosition
  const lpMargins = labelPositionMargins(containerWidth, effectiveVLabelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW, options.horizontalAxis?.showAxis)

  // Reserve extra margin for outside value labels
  const valueLabelPos = options.valueLabelPosition ?? ValueLabelPosition.Auto
  const swapLabelValue = options.swapLabelValue === true
  const formatValue = (v: number) => formatValueLabel(v, options.horizontalAxis?.numberFormat)
  let valueLabelRoom = 0
  if (options.valueLabels && valueLabelPos !== ValueLabelPosition.Inside) {
    if (swapLabelValue) {
      // Labels show category names — estimate width from the longest label
      const longestLabel = data.labels.reduce((a, b) => a.length > b.length ? a : b, '')
      const rightLabelW = estimateTextInk(longestLabel) + VALUE_LABEL_GAP * 2
      lpMargins.right = Math.max(lpMargins.right ?? 15, rightLabelW)
      valueLabelRoom = rightLabelW
    }
    else {
      const plottable = data.values.filter(v => Number.isFinite(v))
      const maxVal = Math.max(...plottable)
      const minVal = Math.min(...plottable)
      // Two gaps: one between the bar end and the label, one between the label
      // and the canvas edge, so the widest label is never flush with the edge
      // where the SVG would clip it mid-number.
      const rightLabelW = maxVal > 0 ? estimateTextInk(formatValue(maxVal)) + VALUE_LABEL_GAP * 2 : 0
      const leftLabelW = minVal < 0 ? estimateTextInk(formatValue(minVal)) + VALUE_LABEL_GAP * 2 : 0
      lpMargins.right = Math.max(lpMargins.right ?? 15, rightLabelW)
      valueLabelRoom = rightLabelW
      if (leftLabelW > 0) {
        lpMargins.left = (lpMargins.left ?? 50) + leftLabelW
      }
    }
  }

  const labelPlan = planOverlayLabels(resolved.overlays, options.directLabelling, lpMargins, resolved.overlays, valueLabelRoom)
  const keyEntries = labelPlan.keyEntries
  const keyLayout = overlayKeyLayout(keyEntries, options, containerWidth, lpMargins, false)
  const { chartArea, width, height, margin } = createCanvas(body, keyLayout.margins)
  // Plot rect cached for the next same-type transition's frame-geometry `from`.
  const plotRect: PlotRect = { left: margin.left, top: margin.top, width, height }
  const marginDelta = computeMarginDelta(priorMargin, margin)

  const labels = sortByValue(data.labels, (_, i) => data.values[i], options.sort)
  // A cell the parser could not read is a gap, not a zero: it keeps its slot in
  // the band domain but gets no mark and no label.
  const barData: BarDatum[] = labels
    .map(l => ({ label: l, value: data.values[data.labels.indexOf(l)] }))
    .filter(d => Number.isFinite(d.value))

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
  const steps = waterfallData.filter(d => !d.isTotal)
  const stepLabels = steps.map(d => d.label)
  const overlayLabels = isWaterfall ? stepLabels : labels
  const overlayRows = overlayLabels.map(label => data.labels.indexOf(label))
  const baseEntries = steps.map(d => [data.labels.indexOf(d.label), d.x0] as const)
  const waterfallBase = new Map(baseEntries)
  const overlayBase = (row: number) => isWaterfall ? (waterfallBase.get(row) ?? 0) : 0
  const barDomainValues = isWaterfall
    ? waterfallData.flatMap(d => [d.x0, d.x1])
    : barData.map(d => d.value)
  const domainValues = [...barDomainValues, ...overlayDomainValues(resolved.overlays, overlayRows, overlayBase)]
  const [domainMin, domainMax] = computeLinearDomain(domainValues, options.horizontalAxis?.range, options.horizontalAxis?.scaleType)
  const x = useLog
    ? d3.scaleSymlog().domain([domainMin, domainMax]).nice().range([0, width])
    : d3.scaleLinear().domain([domainMin, domainMax]).nice().range([0, width])

  const allLabels = isWaterfall ? waterfallData.map(d => d.label) : labels
  const y = d3.scaleBand<string>()
    .domain(allLabels)
    .range([0, height])
    .padding(resolveBarGapPadding(options.barGap))

  const categoryLabelOffset = useCategoryLabelLine ? categoryLabelLineHeight(y.bandwidth()) : 0
  const overlaySlotStart = (label: string) => (y(label) ?? 0) + categoryLabelOffset
  const overlaySlotSize = y.bandwidth() - categoryLabelOffset
  const labelTextOpts = { swapLabelValue, percent: options.valueLabels === 'percent', total: d3.sum(barData, d => d.value), formatValue }
  const labelBounds = { plotWidth: width, marginLeft: margin.left, marginRight: margin.right }
  const rowClear = (row: number): number => {
    const datum = barData.find(d => d.label === data.labels[row])
    if (!datum) {
      return x(0)
    }
    const start = overlayBase(row)
    const barEnd = Math.min(width, Math.max(x(start), x(start + datum.value)))
    if (!options.valueLabels) {
      return barEnd
    }
    const ink = estimateTextInk(valueLabelText(datum, labelTextOpts))
    const attrs = valueLabelAttrs(datum, x, y, valueLabelPos, categoryLabelOffset, labelBounds, ink)
    const isOutsideRight = !attrs.isInside && attrs.anchor === 'start'
    return isOutsideRight ? Math.max(barEnd, attrs.tx + ink) : barEnd
  }
  const overlayGeometry: OverlayGeometry = { orientation: 'horizontal', slotStart: overlaySlotStart, slotSize: overlaySlotSize, value: x, base: overlayBase, clear: rowClear }

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

  const colorOverrides = buildColorOverrides(options.colorizes)
  const highlightTargets = highlightTargetSet(options.highlights, allLabels)
  const cueFor = (label: string, value: number) => barCue(resolved.overlays, data.labels.indexOf(label), value)
  const barColor = (label: string, value: number) => {
    const override = colorOverrides.get(label)
    const cue = cueFor(label, value)
    const palette = (options.colors ?? DEFAULT_COLORS)[0]
    return override ?? cue.color ?? palette
  }
  const barOpacity = (label: string, value: number) => {
    const base = highlightOpacity(highlightTargets, label)
    return cueFor(label, value).faded ? CUE_FADE_OPACITY * base : base
  }

  // Clip bars to the chart area so they truncate at axis boundaries.
  // Stable id per (container, key) keeps <defs> from growing on re-renders.
  const svg = chartArea.ownerSVGElement!
  const clipId = ensureClipPath(svg, container, 'bars', { x: 0, y: 0, width, height })
  const defs = d3.select(svg).select<SVGDefsElement>('defs')
  // Stable suffix derived from the clip id so connection-gradient ids are
  // also deterministic across renders for the same container.
  const idSuffix = clipId.replace(/^bc-clip-/, '')
  const clippedGroup = d3.select(chartArea).append('g').attr('clip-path', `url(#${clipId})`)
  const mountOverlays = () => mountOverlayLayer(container, clippedGroup.node()!, priorOverlays, resolved.overlays, overlayLabels, overlayRows, () => overlayGeometry)
  const tooltipFormat = overlayTooltipFormat(resolved.overlays, data.labels, options.horizontalAxis?.numberFormat)

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
        return barColor(d.label, d.value)
      })
      .attr('opacity', (d: WaterfallDatum) => {
        const faded = !d.isTotal && cueFor(d.label, d.value).faded
        const highlight = highlightOpacity(highlightTargets, d.label)
        if (faded) {
          return CUE_FADE_OPACITY * highlight
        }
        return highlightTargets.size > 0 ? highlight : null
      })

    mountOverlays()

    if (options.valueLabels) {
      const pos = valueLabelPos
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
            if (!d.isTotal && cueFor(d.label, d.value).faded) {
              return 'currentColor'
            }
            return contrastTextColor(d.isTotal ? totalColor : barColor(d.label, d.value))
          }
          return 'currentColor'
        })
        .text((d: WaterfallDatum) => swapLabelValue ? d.label : formatValue(d.isTotal ? d.x1 : d.value))
    }
  }
  else {
    const orch = getSceneTransition(container)

    // Bars — one feature per category, keyed by label.
    const barLayer = clippedGroup.append('g').node()!
    // Re-insert prior bars (with their bound data) so the data-join matches them
    // as updates and tweens x/y/width/height from the prior scene's geometry.
    if (transition) {
      for (const el of priorBars) {
        barLayer.appendChild(el)
      }
    }
    featureJoin<BarDatum>(orch, {
      role: 'mark-per-category',
      parent: barLayer,
      selector: '.bc-bar',
      data: barData,
      key: d => d.label,
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      attrs: d => ({
        x: Math.min(x(0), x(d.value)),
        y: (y(d.label) ?? 0) + categoryLabelOffset,
        width: Math.abs(x(d.value) - x(0)),
        height: y.bandwidth() - categoryLabelOffset,
        fill: barColor(d.label, d.value),
        opacity: barOpacity(d.label, d.value),
      }),
    })
    mountOverlays()

    // Frame-geometry tween: ease the plot origin (chart-area transform) + clip
    // from the prior scene's rect to the new one on the SAME orchestrator clock,
    // so the bars (above), axis and value labels move in lockstep. The bar rects
    // redistribute via their numeric x/y/width/height tweens (no `d`). Same-type only.
    tweenPlotFrame(orch, {
      svg,
      clipId,
      group: chartArea,
      from: priorPlotRect,
      to: plotRect,
      active: transition && priorBars.length > 0,
    })

    // Plugins host — kept on the legacy D3Blueprint API. The draw is deferred
    // into the commit flush (when transitioning) so plugins bind after featureJoin
    // has created the `.bc-bar` marks, not before.
    const chart = createPluginHost(clippedGroup)
    if (options.tooltips) {
      chart.use(createTooltipPlugin({ numberFormat: options.horizontalAxis?.numberFormat, format: tooltipFormat }))
    }
    if (options.crosshair) {
      chart.use(createCrosshairPlugin({
        width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor, orientation: Orientation.Horizontal }))
    }
    if (options.annotations?.length) {
      chart.use(createAnnotationPlugin(options.annotations, {
        scaleX: y, scaleY: x, data: barData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: Orientation.Horizontal, transition, priorAnnotations }))
    }
    const drawPlugins = () => chart.draw(barData)
    if (orch.state === 'committing') {
      orch.register(drawPlugins)
    }
    else {
      drawPlugins()
    }

    if (options.valueLabels) {
      // Render value labels in an unclipped group so outside labels aren't truncated
      const labelParent = d3.select(chartArea).append('g') as d3.Selection<SVGGElement, unknown, null, undefined>
      renderValueLabels(labelParent, barData, x, y, {
        position: valueLabelPos,
        barColor,
        isFaded: d => cueFor(d.label, d.value).faded,
        transition,
        swapLabelValue,
        categoryLabelOffset,
        percent: labelTextOpts.percent,
        total: labelTextOpts.total,
        formatValue,
        bounds: labelBounds,
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

  drawOverlayDirectLabelGroup(chartArea, labelPlan.direct, overlayLabels, overlayRows, () => overlayGeometry)

  if (keyLayout.show) {
    const placement = keyLayout.place(width, height, margin)
    drawOverlayLegend(chartArea, keyEntries, placement)
  }

  setCachedChart(container, { chartType: 'bar-horizontal', margin, plotRect })

  if (fadeOverlay) {
    fadeIn(clippedGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}

function valueLabelText(d: BarDatum, opts: { swapLabelValue?: boolean, percent?: boolean, total?: number, formatValue: (value: number) => string }): string {
  if (opts.swapLabelValue) {
    return d.label
  }
  if (opts.percent && opts.total !== undefined) {
    return percentValueLabel(d.value, opts.total)
  }
  return opts.formatValue(d.value)
}

function valueLabelAttrs(
  d: BarDatum,
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  y: d3.ScaleBand<string>,
  pos: ValueLabelPosition,
  catOffset: number,
  bounds: LabelBounds,
  labelWidth: number,
) {
  const ty = (y(d.label) ?? 0) + catOffset + (y.bandwidth() - catOffset) / 2
  // Bars are clipped to the plot, so the label follows the visible mark rather
  // than the raw datum: a value the axis range excludes keeps its label on the
  // canvas instead of being painted past the edge, where the clip would cut it
  // mid-number and show a different, believable figure.
  const clip = (v: number) => Math.max(0, Math.min(bounds.plotWidth, v))
  const markEnd = x(d.value)
  const truncated = markEnd < 0 || markEnd > bounds.plotWidth
  const negative = d.value < 0
  const barEnd = negative ? Math.min(clip(x(0)), clip(markEnd)) : Math.max(clip(x(0)), clip(markEnd))
  // Keep the same breathing room against the canvas edge as against the bar:
  // a label that ends flush with the edge is the one the SVG clips mid-number.
  const fitsOutside = negative
    ? barEnd - VALUE_LABEL_GAP - labelWidth >= VALUE_LABEL_GAP - bounds.marginLeft
    : barEnd + VALUE_LABEL_GAP + labelWidth <= bounds.plotWidth + bounds.marginRight - VALUE_LABEL_GAP
  // A mark clipped to nothing has no inside to hold the label: fall back to the
  // outside position, which the clip above has already pulled into the plot.
  const roomInside = negative ? bounds.plotWidth - barEnd : barEnd
  const isInside = (pos === ValueLabelPosition.Inside || truncated || !fitsOutside)
    && roomInside >= labelWidth + VALUE_LABEL_GAP
  if (isInside) {
    return negative
      ? { tx: barEnd + VALUE_LABEL_GAP, ty, anchor: 'start', isInside }
      : { tx: barEnd - VALUE_LABEL_GAP, ty, anchor: 'end', isInside }
  }
  return negative
    ? { tx: barEnd - VALUE_LABEL_GAP, ty, anchor: 'end', isInside }
    : { tx: barEnd + VALUE_LABEL_GAP, ty, anchor: 'start', isInside }
}

function renderValueLabels(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  barData: BarDatum[],
  x: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  y: d3.ScaleBand<string>,
  opts: {
    position?: ValueLabelPosition
    barColor: (label: string, value: number) => string
    isFaded: (d: BarDatum) => boolean
    transition: boolean
    swapLabelValue?: boolean
    categoryLabelOffset?: number
    percent?: boolean
    total?: number
    formatValue: (value: number) => string
    bounds: LabelBounds
  },
): void {
  const pos = opts.position ?? ValueLabelPosition.Auto
  const catOffset = opts.categoryLabelOffset ?? 0
  const labelText = (d: BarDatum) => valueLabelText(d, opts)

  // Create a dedicated group for value labels so they sit above bars
  let labelGroup = parent.select<SVGGElement>('.bc-value-label-group')
  if (labelGroup.empty()) {
    labelGroup = parent.append('g').attr('class', 'bc-value-label-group')
  }

  // Resolve the container from the parent's owner. The parent here is the
  // unclipped group, which is mounted under the chartArea inside the chart's
  // SVG root, inside the chart container <div>.
  const ownerSvg = parent.node()!.ownerSVGElement
  const container = ownerSvg?.parentElement as HTMLElement
  const orch = getSceneTransition(container)

  const visibleData = barData.filter(d =>
    shouldRenderValueLabel({
      text: labelText(d),
      placement: pos === ValueLabelPosition.Inside ? 'inside' : 'outside',
      orientation: 'horizontal',
      barWidth: Math.abs(x(d.value) - x(0)),
      barHeight: y.bandwidth(),
    }),
  )

  featureJoin<BarDatum>(orch, {
    role: 'value-label',
    parent: labelGroup.node()!,
    selector: '.bc-value-label',
    data: visibleData,
    key: d => d.label,
    insert: sel => sel.append('text')
      .attr('class', 'bc-value-label')
      .attr('font-size', '11px')
      .attr('dominant-baseline', 'central'),
    attrs: (d) => {
      const a = valueLabelAttrs(d, x, y, pos, catOffset, opts.bounds, estimateTextInk(labelText(d)))
      return {
        'x': a.tx,
        'y': a.ty,
        'text-anchor': a.anchor,
        'fill': a.isInside && !opts.isFaded(d)
          ? contrastTextColor(opts.barColor(d.label, d.value))
          : 'currentColor',
      }
    },
  })

  // featureJoin only manages attributes, not text content. Set text content
  // for both enter and update bars in a second pass keyed by the same label.
  labelGroup.selectAll<SVGTextElement, BarDatum>('.bc-value-label')
    .data(visibleData, (d: BarDatum) => d.label)
    .text(labelText)
}
