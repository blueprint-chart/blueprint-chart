import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import { getTransitionDuration } from '../motion'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

const HOVER_DELAY = 200
const DIM_OPACITY = 0.2

class LegendChart extends D3Blueprint<string[]> {
  initialize() {
    this.configDefine('colors', { defaultValue: DEFAULT_COLORS })
    this.configDefine('yOffset', { defaultValue: -10 })
    this.configDefine('layout', { defaultValue: 'horizontal' })
    this.configDefine('valueSuffixes', { defaultValue: [] as string[] })
    this.configDefine('maxWidth', { defaultValue: 0 })

    const g = this.base.append('g').attr('class', 'bc-legend')

    this.layer('items', g, {
      dataBind: (sel, data) => sel.selectAll('.bc-legend-item').data(data),
      insert: sel => sel.append('g').attr('class', 'bc-legend-item'),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enter: (sel: any) => {
          const colors = this.config('colors') as string[]
          const layout = this.config('layout') as string
          const suffixes = this.config('valueSuffixes') as string[]
          const rootEl = (this.base.node() as SVGElement)?.ownerSVGElement?.parentElement ?? document.documentElement
          const textColor = getComputedStyle(rootEl).getPropertyValue('--bc-text-color').trim() || '#555'
          const maxWidth = this.config('maxWidth') as number
          let xOffset = 0
          let yOffset = 0
          sel.each(function (this: SVGGElement, d: string, i: number) {
            const item = d3.select(this)
            const suffix = suffixes[i]
            const fullLen = suffix ? d.length + 1 + suffix.length : d.length
            const itemWidth = 16 + fullLen * 7 + 12

            // Wrap to next row if item exceeds available width
            if (layout === 'horizontal' && maxWidth > 0 && xOffset > 0 && xOffset + itemWidth > maxWidth) {
              xOffset = 0
              yOffset += 20
            }

            item
              .attr('transform', `translate(${xOffset},${yOffset})`)
              .attr('data-series', i)
              .style('cursor', 'default')
            item.append('rect')
              .attr('width', 12)
              .attr('height', 12)
              .attr('fill', colors[i % colors.length])
            const textEl = item.append('text')
              .attr('x', 16)
              .attr('y', 10)
              .attr('font-size', '12px')
              .attr('fill', textColor)
            if (suffix) {
              textEl.append('tspan').attr('font-weight', 'bold').text(d)
              textEl.append('tspan').text(` ${suffix}`)
            }
            else {
              textEl.text(d)
            }
            if (layout === 'vertical') {
              yOffset += 20
            }
            else {
              xOffset += itemWidth
            }
          })
        },
      },
    })
  }

  preDraw() {
    const yOffset = this.config('yOffset') as number
    this.base.select('.bc-legend').attr('transform', `translate(0,${yOffset})`)
  }
}

function setupLegendHighlight(chartArea: SVGGElement): void {
  const legendItems = d3.select(chartArea).selectAll<SVGGElement, unknown>('.bc-legend-item')
  if (legendItems.empty()) { return }

  let hoverTimer: ReturnType<typeof setTimeout> | null = null
  let activeIndex: number | null = null

  function highlight(seriesIndex: number) {
    activeIndex = seriesIndex
    const idx = String(seriesIndex)

    // Dim other legend items
    legendItems.each(function () {
      const item = d3.select(this)
      const isCurrent = item.attr('data-series') === idx
      item.transition().duration(150).style('opacity', isCurrent ? 1 : DIM_OPACITY)
    })

    // Dim other series elements in the chart
    const seriesEls = d3.select(chartArea).selectAll<SVGElement, unknown>('[data-series]')
      .filter(function () { return !this.closest('.bc-legend') })
    seriesEls.each(function () {
      const el = d3.select(this)
      const isCurrent = el.attr('data-series') === idx
      el.transition().duration(150).style('opacity', isCurrent ? null : DIM_OPACITY)
    })
  }

  function restore() {
    activeIndex = null
    legendItems.transition().duration(150).style('opacity', 1)

    const seriesEls = d3.select(chartArea).selectAll<SVGElement, unknown>('[data-series]')
      .filter(function () { return !this.closest('.bc-legend') })
    seriesEls.transition().duration(150).style('opacity', null)
  }

  legendItems.each(function () {
    const el = this as SVGGElement
    const seriesIndex = parseInt(d3.select(el).attr('data-series') ?? '0', 10)

    el.addEventListener('mouseenter', () => {
      if (hoverTimer) { clearTimeout(hoverTimer) }
      hoverTimer = setTimeout(() => highlight(seriesIndex), getTransitionDuration(HOVER_DELAY))
    })

    el.addEventListener('mouseleave', () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
        hoverTimer = null
      }
      if (activeIndex !== null) { restore() }
    })
  })
}

export function renderLegend(
  chartArea: SVGGElement,
  labels: string[],
  colors: string[] = DEFAULT_COLORS,
  yOffset: number = -10,
  position: string = 'top',
  anchor: string = 'start',
  chartWidth: number = 0,
  chartHeight: number = 0,
  xOffset: number = 0,
  valueSuffixes: string[] = [],
): SVGGElement {
  const layout = (position === 'left' || position === 'right') ? 'vertical' : 'horizontal'
  const chart = new LegendChart(d3.select(chartArea))
  chart.config({ colors, yOffset, layout, valueSuffixes, maxWidth: chartWidth })
  chart.draw(labels)

  const legendEl = chartArea.querySelector('.bc-legend') as SVGGElement

  if (legendEl) {
    let legendWidth = 0
    let legendHeight = 0
    const fullLens = labels.map((l, i) => {
      const s = valueSuffixes[i]
      return s ? l.length + 1 + s.length : l.length
    })
    if (layout === 'horizontal') {
      const itemWidths = fullLens.map(len => 16 + len * 7 + 12)
      // Account for wrapping
      let rows = 1
      let rowWidth = 0
      let maxRowWidth = 0
      for (const w of itemWidths) {
        if (chartWidth > 0 && rowWidth > 0 && rowWidth + w > chartWidth) {
          maxRowWidth = Math.max(maxRowWidth, rowWidth)
          rows++
          rowWidth = w
        }
        else {
          rowWidth += w
        }
      }
      maxRowWidth = Math.max(maxRowWidth, rowWidth)
      legendWidth = maxRowWidth
      legendHeight = rows * 20
    }
    else {
      const maxLen = Math.max(...fullLens)
      legendWidth = maxLen * 7 + 16 + 8
      legendHeight = labels.length * 20
    }

    let tx = xOffset
    let ty = yOffset
    if (layout === 'horizontal') {
      if (anchor === 'middle') { tx += (chartWidth - legendWidth) / 2 }
      else if (anchor === 'end') { tx += chartWidth - legendWidth }
    }
    else {
      if (anchor === 'middle') { ty += (chartHeight - legendHeight) / 2 }
      else if (anchor === 'end') { ty += chartHeight - legendHeight }
    }
    legendEl.setAttribute('transform', `translate(${tx},${ty})`)
  }

  setupLegendHighlight(chartArea)

  return legendEl
}
