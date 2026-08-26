import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { SortDirection, DirectLabelMode } from '../../../enums'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize } from '../../canvas/canvas'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { renderArcLabels, renderInsideArcLabels, renderAutoArcLabels, estimateArcLabelMargins } from '../../plugins/arc-labels'
import type { ArcLabelDatum } from '../../plugins/arc-labels'
import { featureJoin, getSceneTransition } from '../../../transitions'
import { expandColorsToSeries } from '../../series-helpers'
import { highlightTargetSet, highlightOpacity } from '../../plugins/highlight'
import { buildColorOverrides } from '../../plugins/colorize'

export const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

interface ArcDatum {
  label: string
  arc: d3.PieArcDatum<number>
  color: string
}

class ArcChart extends D3Blueprint<ArcDatum[]> {
  initialize(): void {
    // Arc slices are rendered via featureJoin against the SceneTransition
    // orchestrator (see renderArc()). This class is retained only as a host
    // for legacy plugins (tooltips, annotations) that consume the
    // D3Blueprint API. Plugins will migrate to the orchestrator in later stages.
  }
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  renderArc(container, data, options, 0.6, transition)
}

export function renderArc(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
  innerRadiusRatio: number,
  transition = false,
): void {
  setRenderTransition(transition)
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  if (transition) {
    const cached = getCachedChart(container)
    const expectedType = innerRadiusRatio > 0 ? 'donut' : 'pie'
    if (cached && cached.chartType !== expectedType) {
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

  // Sort data
  let labels = [...data.labels]
  let values = [...data.values]
  if (options.sort === SortDirection.Ascending || options.sort === SortDirection.Descending) {
    const pairs = labels.map((l, i) => ({ label: l, value: values[i] }))
    pairs.sort((a, b) => options.sort === SortDirection.Ascending ? a.value - b.value : b.value - a.value)
    labels = pairs.map(p => p.label)
    values = pairs.map(p => p.value)
  }

  // Auto-group small slices
  if (options.sliceMax && options.sliceMax > 0 && labels.length > options.sliceMax) {
    const keep = options.sliceMax - 1
    const keptLabels = labels.slice(0, keep)
    const keptValues = values.slice(0, keep)
    const restSum = values.slice(keep).reduce((a, b) => a + b, 0)
    keptLabels.push(options.sliceGroupLabel ?? 'Others')
    keptValues.push(restSum)
    labels = keptLabels
    values = keptValues
  }

  // Compute percentages
  const total = values.reduce((a, b) => a + b, 0)
  const percentages = values.map(v => total > 0 ? (v / total) * 100 : 0)

  // When the supplied palette has fewer entries than slices, d3.scaleOrdinal
  // recycles colors and two distinct categories end up identical (e.g. the 4-color
  // Heep palette over 6 browsers paints Chrome and Opera the same blue).
  const colors = expandColorsToSeries(options.colors ?? DEFAULT_COLORS, labels.length)
  const dlMode = typeof options.directLabelling === 'string'
    ? options.directLabelling
    : (options.directLabelling ? DirectLabelMode.Auto : DirectLabelMode.Off)
  // 'auto' defers to legend when legend is explicitly true
  const useDirectLabels = !!dlMode && !(dlMode === DirectLabelMode.Auto && options.legend === true)

  // Build legend value suffixes when showValues is on and labels are shown as legend
  const showValuesInLegend = (options.showValues ?? true) && !useDirectLabels
  const legendSuffixes = showValuesInLegend
    ? values.map((v, i) => {
        const formatted = options.displayAsPercentage
          ? `${Math.round(percentages[i])}%`
          : String(v)
        return `(${formatted})`
      })
    : []

  // Compute margin adjustments for legend
  const showLegend = options.legend !== false && !useDirectLabels
  const containerWidth = contentSize(body).width
  const NARROW_THRESHOLD = 350
  const requestedLegendPos = options.legendPosition ?? 'top'
  // On narrow containers, move side legends to top to preserve chart space
  const legendPos = (containerWidth > 0 && containerWidth < NARROW_THRESHOLD && (requestedLegendPos === 'left' || requestedLegendPos === 'right'))
    ? 'top'
    : requestedLegendPos
  const legendAnchor = options.legendAnchor ?? 'start'
  const legendSizeLabels = legendSuffixes.length > 0
    ? labels.map((l, i) => `${l} ${legendSuffixes[i]}`)
    : labels
  // Estimate using the chart-area width (container minus default left/right margins)
  const legendAvailableWidth = Math.max(0, containerWidth - 50 - 20)
  const legendSize = showLegend ? estimateLegendSize(legendSizeLabels, legendPos, legendAvailableWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 15 : 0

  const marginOverrides: Record<string, number> = {}
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = legendH
  }
  if (showLegend && legendPos === 'bottom') {
    marginOverrides.bottom = 24 + legendH
  }
  if (showLegend && legendPos === 'left') {
    marginOverrides.left = 50 + legendSize.width + 10
  }
  if (showLegend && legendPos === 'right') {
    marginOverrides.right = 20 + legendSize.width + 10
  }

  // For direct labels we need to know the approximate outerRadius to estimate
  // margins, but radius depends on margins.  Use a two-pass approach: estimate
  // the radius from the raw container size, compute label margins, then create
  // the canvas with final margins.
  if (useDirectLabels) {
    const containerInner = contentSize(body)
    const defaultMargin = 20
    const roughW = containerInner.width - 2 * defaultMargin
    // Height may be 0 before the SVG is created; fall back to the default canvas height
    const roughH = (containerInner.height > 0 ? containerInner.height : 400) - 2 * defaultMargin
    const roughRadius = Math.min(roughW, roughH) / 2
    const arcLabelMargins = estimateArcLabelMargins(labels, roughRadius, { width: roughW, height: roughH })
    marginOverrides.left = (marginOverrides.left ?? defaultMargin) + arcLabelMargins.left
    marginOverrides.right = (marginOverrides.right ?? defaultMargin) + arcLabelMargins.right
    marginOverrides.top = (marginOverrides.top ?? defaultMargin) + arcLabelMargins.top
    marginOverrides.bottom = (marginOverrides.bottom ?? defaultMargin) + arcLabelMargins.bottom
  }

  const { chartArea, width, height, margin } = createCanvas(body, marginOverrides)

  const radius = Math.min(width, height) / 2
  const innerRadius = radius * innerRadiusRatio
  const colorScale = d3.scaleOrdinal<string>()
    .domain(labels)
    .range(colors)

  const pie = d3.pie<number>().sort(null)
  const arcGen = d3.arc<d3.PieArcDatum<number>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)

  const centerGroup = d3.select(chartArea)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  const colorOverrides = buildColorOverrides(options.colorizes)
  const pieData = pie(values)
  const arcData: ArcDatum[] = pieData.map((arc, i) => ({
    label: labels[i],
    arc,
    color: colorOverrides.get(labels[i]) ?? colorScale(labels[i]),
  }))

  const orch = getSceneTransition(container)
  const highlightTargets = highlightTargetSet(options.highlights, labels)

  // Arc slices — one feature per category, keyed by label.
  const arcLayer = centerGroup.append('g').node()!
  featureJoin<ArcDatum>(orch, {
    role: 'mark-per-category',
    parent: arcLayer,
    selector: '.bc-arc',
    data: arcData,
    key: d => d.label,
    insert: sel => sel.append('path').attr('class', 'bc-arc'),
    attrs: (d) => {
      const base = { d: arcGen(d.arc) ?? '', fill: d.color }
      return highlightTargets.size > 0
        ? { ...base, opacity: highlightOpacity(highlightTargets, d.label) }
        : base
    },
  })

  // Plugins host — kept on the legacy D3Blueprint path. Mounting on
  // centerGroup so plugins find the `.bc-arc` elements that featureJoin
  // just inserted under arcLayer.
  const chart = new ArcChart(centerGroup)
  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  chart.draw(arcData)

  // Render annotations at chartArea level (not centerGroup) so coordinates
  // are relative to the plot area origin, not the center-translated arc group
  if (options.annotations?.length) {
    const freeAnnotations = options.annotations.filter(a => a.kind === 'free')
    if (freeAnnotations.length) {
      const annPlugin = createAnnotationPlugin(freeAnnotations, {
        scaleX: d3.scaleBand<string>().domain([]).range([0, width]),
        scaleY: d3.scaleLinear().domain([0, 1]).range([height, 0]),
        data: [],
        width,
        height,
        backgroundColor: resolveBackgroundColor(container),
        transition,
        priorAnnotations,
      })
      annPlugin.postDraw!({ base: d3.select(chartArea) } as unknown as D3Blueprint, undefined as unknown as d3.PieArcDatum<number>[])
    }
  }

  if (useDirectLabels) {
    const arcLabelData: ArcLabelDatum[] = pieData.map((d, i) => ({
      label: labels[i],
      value: d.data,
      startAngle: d.startAngle,
      endAngle: d.endAngle,
      color: colorScale(labels[i]),
      percentage: percentages[i],
      displayAsPercentage: options.displayAsPercentage,
      showLabel: options.showLabels ?? true,
      showValue: options.showValues ?? true,
    }))
    const labelParent = centerGroup as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    const bgColor = resolveBackgroundColor(container)
    const labelOpts = { outerRadius: radius, innerRadius, chartWidth: width, chartHeight: height, bgColor }
    if (dlMode === DirectLabelMode.Inside) {
      renderInsideArcLabels(labelParent, arcLabelData, labelOpts)
    }
    else if (dlMode === DirectLabelMode.Auto) {
      renderAutoArcLabels(labelParent, arcLabelData, labelOpts)
    }
    else {
      renderArcLabels(labelParent, arcLabelData, labelOpts)
    }
  }

  // Center total (only for donut — innerRadiusRatio > 0).
  // Suppressed when displayAsPercentage is on: the center would always read "Total 100%",
  // which is trivially true for a donut and adds no information.
  if (options.showTotal && innerRadiusRatio > 0 && !options.displayAsPercentage) {
    const totalText = String(total)
    centerGroup.append('text')
      .attr('class', 'bc-arc-total-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-size', '11px')
      .attr('fill', 'var(--bc-text-color, #555)')
      .attr('opacity', 0.7)
      .text('Total')
    centerGroup.append('text')
      .attr('class', 'bc-arc-total-value')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', 'var(--bc-text-color, #555)')
      .text(totalText)
  }

  if (showLegend) {
    let xPos = 0
    let yPos = 0
    if (legendPos === 'top') {
      yPos = -(legendSize.height + 10)
    }
    else if (legendPos === 'bottom') {
      yPos = height + 25
    }
    else if (legendPos === 'left') {
      xPos = -(legendSize.width + 10)
    }
    else if (legendPos === 'right') {
      xPos = width + 10
    }
    renderLegend(chartArea, labels, colors, yPos, legendPos, legendAnchor, width, height, xPos, legendSuffixes, { left: margin.left, right: margin.right })
  }

  setCachedChart(container, { chartType: innerRadiusRatio > 0 ? 'donut' : 'pie' })

  if (fadeOverlay) {
    fadeIn(centerGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
