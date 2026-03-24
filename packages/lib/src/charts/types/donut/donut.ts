import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { getDefaultTransitionMs, setRenderTransition, fadeIn, snapshotForFadeOut, commitFadeOut } from '../../motion'
import { getCachedChart, setCachedChart } from '../../transition-cache'
import { createFrame } from '../../frame/frame'
import { createCanvas, contentSize } from '../../canvas/canvas'
import { renderLegend } from '../../legend/legend'
import { estimateLegendSize } from '../../legend/legend-size'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createAnnotationPlugin, snapshotAnnotations, type AnnotationSnapshot } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'
import { renderArcLabels, renderInsideArcLabels, renderAutoArcLabels, estimateArcLabelMargins } from '../../plugins/arc-labels'
import type { ArcLabelDatum } from '../../plugins/arc-labels'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

class ArcChart extends D3Blueprint<d3.PieArcDatum<number>[]> {
  initialize() {
    this.configDefine('arc', { defaultValue: d3.arc<d3.PieArcDatum<number>>() })
    this.configDefine('colorScale', { defaultValue: d3.scaleOrdinal<string>() })
    this.configDefine('labels', { defaultValue: [] as string[] })

    const g = this.base.append('g')

    this.layer('arcs', g, {
      dataBind: (sel, data) => {
        const labels = this.config('labels') as string[]
        return sel.selectAll('.bc-arc').data(data, (_d: d3.PieArcDatum<number>, i: number) => labels[i])
      },
      insert: sel => sel.append('path').attr('class', 'bc-arc'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'enter': (sel: any) => {
          const arcGen = this.config('arc') as d3.Arc<unknown, d3.PieArcDatum<number>>
          const colorScale = this.config('colorScale') as d3.ScaleOrdinal<string, string>
          const labels = this.config('labels') as string[]
          sel
            .attr('d', arcGen)
            .attr('fill', (_d: d3.PieArcDatum<number>, i: number) => colorScale(labels[i]))
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'merge:transition': (sel: any) => {
          const arcGen = this.config('arc') as d3.Arc<unknown, d3.PieArcDatum<number>>
          const colorScale = this.config('colorScale') as d3.ScaleOrdinal<string, string>
          const labels = this.config('labels') as string[]
          sel.duration(getDefaultTransitionMs())
            .attr('d', arcGen)
            .attr('fill', (_d: d3.PieArcDatum<number>, i: number) => colorScale(labels[i]))
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
  // Preserve existing arc elements for smooth D3 data-join transitions
  let priorArcs: Element[] = []
  let fadeOverlay: HTMLElement | null = null
  let priorAnnotations: Map<string, AnnotationSnapshot> | undefined
  if (transition) {
    const cached = getCachedChart(container)
    const expectedType = innerRadiusRatio > 0 ? 'donut' : 'pie'
    if (cached?.chartType === expectedType) {
      priorArcs = Array.from(container.querySelectorAll('.bc-arc'))
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

  // Sort data
  let labels = [...data.labels]
  let values = [...data.values]
  if (options.sort === 'ascending' || options.sort === 'descending') {
    const pairs = labels.map((l, i) => ({ label: l, value: values[i] }))
    pairs.sort((a, b) => options.sort === 'ascending' ? a.value - b.value : b.value - a.value)
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

  const colors = options.colors ?? DEFAULT_COLORS
  const dlMode = typeof options.directLabelling === 'string'
    ? options.directLabelling
    : (options.directLabelling ? 'auto' : '')
  // 'auto' defers to legend when legend is explicitly true
  const useDirectLabels = !!dlMode && !(dlMode === 'auto' && options.legend === true)

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
  const legendSize = showLegend ? estimateLegendSize(legendSizeLabels, legendPos, containerWidth) : { width: 0, height: 0 }
  const legendH = showLegend ? legendSize.height + 10 : 0

  const marginOverrides: Record<string, number> = {}
  if (showLegend && legendPos === 'top') {
    marginOverrides.top = 20 + legendH
  }
  if (showLegend && legendPos === 'bottom') {
    marginOverrides.bottom = 40 + legendH
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
    const arcLabelMargins = estimateArcLabelMargins(labels, roughRadius)
    marginOverrides.left = (marginOverrides.left ?? defaultMargin) + arcLabelMargins.left
    marginOverrides.right = (marginOverrides.right ?? defaultMargin) + arcLabelMargins.right
    marginOverrides.top = (marginOverrides.top ?? defaultMargin) + arcLabelMargins.top
    marginOverrides.bottom = (marginOverrides.bottom ?? defaultMargin) + arcLabelMargins.bottom
  }

  const { chartArea, width, height } = createCanvas(body, marginOverrides)

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

  const pieData = pie(values)

  const chart = new ArcChart(centerGroup)
  chart.config({ arc: arcGen, colorScale, labels })

  // Re-insert prior arc elements so D3 data-join finds them and triggers merge:transition
  if (priorArcs.length > 0) {
    const layerG = centerGroup.node()!.querySelector('g')!
    priorArcs.forEach(el => layerG.appendChild(el))
  }

  if (options.tooltips) {
    chart.use(createTooltipPlugin())
  }
  chart.draw(pieData)

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
    if (dlMode === 'inside') {
      renderInsideArcLabels(labelParent, arcLabelData, labelOpts)
    }
    else if (dlMode === 'auto') {
      renderAutoArcLabels(labelParent, arcLabelData, labelOpts)
    }
    else {
      renderArcLabels(labelParent, arcLabelData, labelOpts)
    }
  }

  // Center total (only for donut — innerRadiusRatio > 0)
  if (options.showTotal && innerRadiusRatio > 0) {
    const totalText = options.displayAsPercentage ? '100%' : String(total)
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
      yPos = -(legendSize.height + 5)
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
    renderLegend(chartArea, labels, colors, yPos, legendPos, legendAnchor, width, height, xPos, legendSuffixes)
  }

  setCachedChart(container, { chartType: innerRadiusRatio > 0 ? 'donut' : 'pie' })

  if (fadeOverlay) {
    fadeIn(centerGroup.node()!)
    commitFadeOut(container, fadeOverlay)
  }
}
