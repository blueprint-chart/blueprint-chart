import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import { contrastTextColor } from '../contrast'

interface BarLabelPosition {
  tx: number
  ty: number
  anchor: string
  isInside: boolean
}

function computeHorizontalBarLabel(
  x: number, w: number, y: number, h: number, pos: string,
): BarLabelPosition {
  const barEnd = x + w
  const isInside = pos === 'inside' || (pos === 'auto' && w > 40)
  const ty = y + h / 2
  if (isInside) {
    return { tx: barEnd - 4, ty, anchor: 'end', isInside }
  }
  return { tx: barEnd + 4, ty, anchor: 'start', isInside }
}

function computeVerticalBarLabel(
  x: number, w: number, y: number, h: number, pos: string,
): BarLabelPosition {
  const isInside = pos === 'inside' || (pos === 'auto' && h > 20)
  const tx = x + w / 2
  const anchor = 'middle'
  if (isInside) {
    return { tx, ty: y + h / 2, anchor, isInside }
  }
  return { tx, ty: y - 4, anchor, isInside }
}

function appendValueLabel(
  parent: d3.Selection<SVGElement, unknown, null, undefined>,
  tx: number, ty: number, anchor: string,
  baseline: string, fillColor: string, text: string,
): void {
  parent.append('text')
    .attr('class', 'bc-value-label')
    .attr('x', tx)
    .attr('y', ty)
    .attr('text-anchor', anchor)
    .attr('dominant-baseline', baseline)
    .attr('font-size', '11px')
    .attr('fill', fillColor)
    .text(text)
}

function labelBar(
  barEl: SVGRectElement,
  pos: string, orientation: string,
  fmt: (v: number) => string,
): void {
  const rect = d3.select(barEl)
  const d = rect.datum() as { label: string, value: number }
  const x = parseFloat(rect.attr('x'))
  const y = parseFloat(rect.attr('y'))
  const w = parseFloat(rect.attr('width'))
  const h = parseFloat(rect.attr('height'))

  const lbl = orientation === 'horizontal'
    ? computeHorizontalBarLabel(x, w, y, h, pos)
    : computeVerticalBarLabel(x, w, y, h, pos)

  const barColor = rect.attr('fill') || '#ccc'
  const fillColor = lbl.isInside ? contrastTextColor(barColor) : 'currentColor'
  const baseline = orientation === 'horizontal' ? 'central' : (lbl.isInside ? 'central' : 'auto')
  const parent = d3.select(barEl.parentNode as SVGElement)
  appendValueLabel(parent, lbl.tx, lbl.ty, lbl.anchor, baseline, fillColor, fmt(d.value))
}

function labelDot(
  dotEl: SVGCircleElement,
  fmt: (v: number) => string,
): void {
  const dot = d3.select(dotEl)
  const d = dot.datum() as { label: string, value: number }
  const cx = parseFloat(dot.attr('cx'))
  const cy = parseFloat(dot.attr('cy'))

  const parent = d3.select(dotEl.parentNode as SVGElement)
  parent.append('text')
    .attr('class', 'bc-value-label')
    .attr('x', cx)
    .attr('y', cy - 8)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', 'currentColor')
    .text(fmt(d.value))
}

export function createValueLabelPlugin(options?: {
  position?: 'inside' | 'outside' | 'auto'
  format?: string
  orientation?: 'vertical' | 'horizontal'
}): Plugin {
  const pos = options?.position ?? 'auto'
  const orientation = options?.orientation ?? 'vertical'
  const fmt = options?.format ? d3.format(options.format) : (v: number) => String(v)

  return {
    name: 'value-labels',

    install() {},

    postDraw(chart: D3Blueprint) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      base.selectAll<SVGRectElement, { label: string, value: number }>('.bc-bar').each(function () {
        labelBar(this, pos, orientation, fmt)
      })

      base.selectAll<SVGCircleElement, { label: string, value: number }>('.bc-dot').each(function () {
        labelDot(this, fmt)
      })
    },
  }
}
