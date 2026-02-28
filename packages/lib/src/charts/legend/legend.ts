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

interface LegendItemCtx {
  colors: string[]
  layout: string
  suffixes: string[]
  textColor: string
  maxWidth: number
  xOffset: number
  yOffset: number
}

function wrapLegendRow(ctx: LegendItemCtx, itemWidth: number): void {
  if (ctx.layout === 'horizontal' && ctx.maxWidth > 0 && ctx.xOffset > 0 && ctx.xOffset + itemWidth > ctx.maxWidth) {
    ctx.xOffset = 0
    ctx.yOffset += 20
  }
}

function renderLegendItemText(item: d3.Selection<SVGGElement, string, null, undefined>, d: string, suffix: string | undefined, textColor: string): void {
  const textEl = item.append('text')
    .attr('x', 16).attr('y', 10)
    .attr('font-size', '12px').attr('fill', textColor)
  if (suffix) {
    textEl.append('tspan').attr('font-weight', 'bold').text(d)
    textEl.append('tspan').text(` ${suffix}`)
  }
  else {
    textEl.text(d)
  }
}

function renderLegendItem(item: d3.Selection<SVGGElement, string, null, undefined>, d: string, i: number, ctx: LegendItemCtx): void {
  const suffix = ctx.suffixes[i]
  const fullLen = suffix ? d.length + 1 + suffix.length : d.length
  const itemWidth = 16 + fullLen * 7 + 12

  wrapLegendRow(ctx, itemWidth)

  item
    .attr('transform', `translate(${ctx.xOffset},${ctx.yOffset})`)
    .attr('data-series', i)
    .style('cursor', 'default')
  item.append('rect')
    .attr('width', 12).attr('height', 12)
    .attr('fill', ctx.colors[i % ctx.colors.length])

  renderLegendItemText(item, d, suffix, ctx.textColor)

  if (ctx.layout === 'vertical') {
    ctx.yOffset += 20
  }
  else {
    ctx.xOffset += itemWidth
  }
}

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
        enter: (sel: any) => this.renderItems(sel),
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderItems(sel: any): void {
    const rootEl = (this.base.node() as SVGElement)?.ownerSVGElement?.parentElement ?? document.documentElement
    const ctx: LegendItemCtx = {
      colors: this.config('colors') as string[],
      layout: this.config('layout') as string,
      suffixes: this.config('valueSuffixes') as string[],
      textColor: getComputedStyle(rootEl).getPropertyValue('--bc-text-color').trim() || '#555',
      maxWidth: this.config('maxWidth') as number,
      xOffset: 0,
      yOffset: 0,
    }
    sel.each(function (this: SVGGElement, d: string, i: number) {
      renderLegendItem(d3.select(this) as unknown as d3.Selection<SVGGElement, string, null, undefined>, d, i, ctx)
    })
  }

  preDraw() {
    const yOffset = this.config('yOffset') as number
    this.base.select('.bc-legend').attr('transform', `translate(0,${yOffset})`)
  }
}

function selectNonLegendSeries(chartArea: SVGGElement): d3.Selection<SVGElement, unknown, SVGGElement, unknown> {
  return d3.select(chartArea).selectAll<SVGElement, unknown>('[data-series]')
    .filter(function () { return !this.closest('.bc-legend') })
}

function dimToIndex(legendItems: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>, chartArea: SVGGElement, idx: string): void {
  legendItems.each(function () {
    const item = d3.select(this)
    item.transition().duration(150).style('opacity', item.attr('data-series') === idx ? 1 : DIM_OPACITY)
  })
  selectNonLegendSeries(chartArea).each(function () {
    const el = d3.select(this)
    el.transition().duration(150).style('opacity', el.attr('data-series') === idx ? null : DIM_OPACITY)
  })
}

function restoreAll(legendItems: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>, chartArea: SVGGElement): void {
  legendItems.transition().duration(150).style('opacity', 1)
  selectNonLegendSeries(chartArea).transition().duration(150).style('opacity', null)
}

function createLegendEnterHandler(
  legendItems: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>,
  chartArea: SVGGElement,
  seriesIndex: number,
  state: { hoverTimer: ReturnType<typeof setTimeout> | null, activeIndex: number | null },
): () => void {
  return () => {
    if (state.hoverTimer) {
      clearTimeout(state.hoverTimer)
    }
    state.hoverTimer = setTimeout(() => {
      state.activeIndex = seriesIndex
      dimToIndex(legendItems, chartArea, String(seriesIndex))
    }, getTransitionDuration(HOVER_DELAY))
  }
}

function createLegendLeaveHandler(
  legendItems: d3.Selection<SVGGElement, unknown, SVGGElement, unknown>,
  chartArea: SVGGElement,
  state: { hoverTimer: ReturnType<typeof setTimeout> | null, activeIndex: number | null },
): () => void {
  return () => {
    if (state.hoverTimer) {
      clearTimeout(state.hoverTimer)
      state.hoverTimer = null
    }
    if (state.activeIndex !== null) {
      state.activeIndex = null
      restoreAll(legendItems, chartArea)
    }
  }
}

function setupLegendHighlight(chartArea: SVGGElement): void {
  const legendItems = d3.select(chartArea).selectAll<SVGGElement, unknown>('.bc-legend-item')
  if (legendItems.empty()) {
    return
  }

  const state = { hoverTimer: null as ReturnType<typeof setTimeout> | null, activeIndex: null as number | null }

  legendItems.each(function () {
    const el = this as SVGGElement
    const seriesIndex = parseInt(d3.select(el).attr('data-series') ?? '0', 10)
    el.addEventListener('mouseenter', createLegendEnterHandler(legendItems, chartArea, seriesIndex, state))
    el.addEventListener('mouseleave', createLegendLeaveHandler(legendItems, chartArea, state))
  })
}

function computeFullLabelLengths(labels: string[], valueSuffixes: string[]): number[] {
  return labels.map((l, i) => {
    const s = valueSuffixes[i]
    return s ? l.length + 1 + s.length : l.length
  })
}

function computeHorizontalLegendSize(fullLens: number[], chartWidth: number): { width: number, height: number } {
  const itemWidths = fullLens.map(len => 16 + len * 7 + 12)
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
  return { width: Math.max(maxRowWidth, rowWidth), height: rows * 20 }
}

function positionLegend(
  legendEl: SVGGElement, layout: string, anchor: string,
  xOffset: number, yOffset: number, chartWidth: number, chartHeight: number,
  legendWidth: number, legendHeight: number,
): void {
  let tx = xOffset
  let ty = yOffset
  if (layout === 'horizontal') {
    if (anchor === 'middle') {
      tx += (chartWidth - legendWidth) / 2
    }
    else if (anchor === 'end') {
      tx += chartWidth - legendWidth
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
  applyLegendLayout(legendEl, labels, valueSuffixes, layout, anchor, xOffset, yOffset, chartWidth, chartHeight)
  setupLegendHighlight(chartArea)
  return legendEl
}

function applyLegendLayout(
  legendEl: SVGGElement | null, labels: string[], valueSuffixes: string[],
  layout: string, anchor: string, xOffset: number, yOffset: number,
  chartWidth: number, chartHeight: number,
): void {
  if (!legendEl) {
    return
  }
  const fullLens = computeFullLabelLengths(labels, valueSuffixes)
  const { width: lw, height: lh } = layout === 'horizontal'
    ? computeHorizontalLegendSize(fullLens, chartWidth)
    : { width: Math.max(...fullLens) * 7 + 16 + 8, height: labels.length * 20 }
  positionLegend(legendEl, layout, anchor, xOffset, yOffset, chartWidth, chartHeight, lw, lh)
}
