import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas, labelPositionMargins, estimateCategoryLabelWidth } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
import { computeLinearDomain } from '../../scale-helpers'
import { createValueLabelPlugin } from '../../plugins/value-labels'
import { createTooltipPlugin } from '../../plugins/tooltip'
import { createCrosshairPlugin } from '../../plugins/crosshair'
import { createAnnotationPlugin } from '../../plugins/annotations'
import { resolveBackgroundColor } from '../../contrast'

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
      dataBind: (sel, data) => sel.selectAll('.bc-bar').data(data),
      insert: sel => sel.append('rect').attr('class', 'bc-bar'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
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
      },
    })
  }
}

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  const { body } = createFrame(container, options.frame)
  const containerWidth = body.getBoundingClientRect().width
  const vLabelW = estimateCategoryLabelWidth(data.labels)
  const lpMargins = labelPositionMargins(containerWidth, options.verticalAxis?.labelPosition, options.horizontalAxis?.labelPosition, options.verticalAxis?.direction, vLabelW)
  const { chartArea, width, height, margin } = createCanvas(body, lpMargins)

  const labels = sortLabels(data, options)
  const barData: BarDatum[] = labels.map(l => ({
    label: l,
    value: data.values[data.labels.indexOf(l)],
  }))

  const useLog = options.horizontalAxis?.scaleType === 'log'
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

  renderHorizontalAxis(chartArea, x, height, { ...options.horizontalAxis, width })
  renderVerticalAxis(chartArea, y, height, { ...options.verticalAxis, topPadding: margin.top })

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

  const chart = new BarHorizontalChart(d3.select(chartArea))
  chart.config({ x, y, width, height, colors: options.colors ?? DEFAULT_COLORS, highlights })
  if (options.valueLabels) chart.use(createValueLabelPlugin({ position: options.valueLabelPosition, orientation: 'horizontal' }))
  if (options.tooltips) chart.use(createTooltipPlugin())
  if (options.crosshair) chart.use(createCrosshairPlugin({ width, height, direction: options.crosshairDirection, style: options.crosshairStyle, color: options.crosshairColor }))
  if (options.annotations?.length) chart.use(createAnnotationPlugin(options.annotations, { scaleX: y, scaleY: x, data: barData, width, height, backgroundColor: resolveBackgroundColor(container), orientation: 'horizontal' }))
  chart.draw(barData)
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
