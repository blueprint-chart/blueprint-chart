import * as d3 from 'd3'
import 'd3-transition'
import { D3Blueprint } from 'd3-blueprint'
import { getTransitionDuration } from '../motion'
import { fitLegendItem, legendColumnWidth } from './legend-size'

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

    // Shared placement pass: positions every bound item from scratch using the
    // current layout/width settings. Runs on both enter and update so that
    // recycled items (positional bind across re-renders) don't keep stale
    // transforms or stale series identity.
    const placeItems = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sel: any,
    ) => {
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
        const fitted = fitLegendItem(d, suffix, layout === 'horizontal' ? maxWidth : 0)
        const itemWidth = fitted.width

        if (layout === 'horizontal' && maxWidth > 0 && xOffset > 0 && xOffset + itemWidth > maxWidth) {
          xOffset = 0
          yOffset += 20
        }

        item
          .attr('transform', `translate(${xOffset},${yOffset})`)
          .attr('data-series', d)
          .style('cursor', 'default')

        // Reuse swatch / text nodes if present, otherwise create them once.
        let rect = item.select<SVGRectElement>('rect')
        if (rect.empty()) {
          rect = item.append('rect')
            .attr('width', 12)
            .attr('height', 12)
        }
        rect.attr('fill', colors[i % colors.length])

        let textEl = item.select<SVGTextElement>('text')
        if (textEl.empty()) {
          textEl = item.append('text')
            .attr('x', 16)
            .attr('y', 10)
            .attr('font-size', '12px')
        }
        textEl.attr('fill', textColor)
        textEl.selectAll('tspan').remove()
        if (suffix) {
          textEl.text(null)
          textEl.append('tspan').attr('font-weight', 'bold').text(fitted.label)
          textEl.append('tspan').text(fitted.suffix)
        }
        else {
          textEl.text(fitted.label)
        }
        if (layout === 'vertical') {
          yOffset += 20
        }
        else {
          xOffset += itemWidth
        }
      })
    }

    this.layer('items', g, {
      // Key by series name so updates re-bind by identity, not position.
      // This keeps the swatch colour and label in sync when the visible series
      // set changes (hidden-series filter, re-order, …).
      dataBind: (sel, data) => sel.selectAll('.bc-legend-item').data(data, (d: unknown) => d as string),
      insert: sel => sel.append('g').attr('class', 'bc-legend-item'),
      events: {
        enter: placeItems,
        update: placeItems,
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
  if (legendItems.empty()) {
    return
  }

  let hoverTimer: ReturnType<typeof setTimeout> | null = null
  let activeKey: string | null = null

  function highlight(seriesKey: string) {
    activeKey = seriesKey

    // Dim other legend items
    legendItems.each(function () {
      const item = d3.select(this)
      const isCurrent = item.attr('data-series') === seriesKey
      item.transition().duration(150).style('opacity', isCurrent ? 1 : DIM_OPACITY)
    })

    // Dim other series elements in the chart; fully hide non-highlighted labels.
    // Highlighted labels get opacity 1 via inline style, which also reveals
    // labels hidden for lack of space (they use the opacity SVG attribute).
    const seriesEls = d3.select(chartArea).selectAll<SVGElement, unknown>('[data-series]')
      .filter(function () { return !this.closest('.bc-legend') })
    seriesEls.each(function () {
      const el = d3.select(this)
      const isCurrent = el.attr('data-series') === seriesKey
      const isLabel = this.classList.contains('bc-direct-label') || this.classList.contains('bc-value-label')
      el.transition().duration(150).style('opacity', isCurrent ? 1 : (isLabel ? 0 : DIM_OPACITY))
    })
  }

  function restore() {
    activeKey = null
    legendItems.transition().duration(150).style('opacity', 1)

    const seriesEls = d3.select(chartArea).selectAll<SVGElement, unknown>('[data-series]')
      .filter(function () { return !this.closest('.bc-legend') })
    seriesEls.transition().duration(150).style('opacity', null)
  }

  // Use D3's namespaced events so re-rendering the legend replaces — rather
  // than accumulates — listeners on the same node across renders.
  legendItems
    .on('mouseenter.bcHighlight', null)
    .on('mouseleave.bcHighlight', null)
    .on('mouseenter.bcHighlight', function () {
      const key = d3.select(this).attr('data-series') ?? ''
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
      hoverTimer = setTimeout(() => highlight(key), getTransitionDuration(HOVER_DELAY))
    })
    .on('mouseleave.bcHighlight', () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
        hoverTimer = null
      }
      if (activeKey !== null) {
        restore()
      }
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
  frameInset: { left?: number, right?: number } = {},
): SVGGElement {
  const layout = (position === 'left' || position === 'right') ? 'vertical' : 'horizontal'
  const chart = new LegendChart(d3.select(chartArea))
  chart.config({ colors, yOffset, layout, valueSuffixes, maxWidth: chartWidth })
  chart.draw(labels)

  const legendEl = chartArea.querySelector('.bc-legend') as SVGGElement

  if (legendEl) {
    let legendWidth: number
    let legendHeight: number
    if (layout === 'horizontal') {
      const itemWidths = labels.map((l, i) => fitLegendItem(l, valueSuffixes[i], chartWidth).width)
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
      legendWidth = legendColumnWidth(labels.map((l, i) => valueSuffixes[i] ? `${l} ${valueSuffixes[i]}` : l))
      legendHeight = labels.length * 20
    }

    const insetLeft = frameInset.left ?? 0
    const insetRight = frameInset.right ?? 0
    let tx = xOffset
    let ty = yOffset
    if (layout === 'horizontal') {
      if (anchor === 'middle') {
        tx += -insetLeft + (chartWidth + insetLeft + insetRight - legendWidth) / 2
      }
      else if (anchor === 'end') {
        tx += chartWidth + insetRight - legendWidth
      }
      else {
        tx += -insetLeft
      }
    }
    else {
      if (anchor === 'middle') {
        ty += (chartHeight - legendHeight) / 2
      }
      else if (anchor === 'end') {
        ty += chartHeight - legendHeight
      }
    }
    legendEl.setAttribute('transform', `translate(${tx},${ty})`)
  }

  setupLegendHighlight(chartArea)

  return legendEl
}
