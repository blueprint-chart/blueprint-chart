import * as d3 from 'd3'
import { measureTextWidth } from '../../text-measure'
import type { ScatterPoint } from './points'

const STEPS = [1, 2, 5]
const TEXT_PX = 11
const TEXT_SIZE = `${TEXT_PX}px`
const BASELINE_OFFSET = 8
const LABEL_GAP = 6
const ROW_HEIGHT = 16
const SECTION_GAP = 8
const TREND_LINE_WIDTH = 24
const TREND_DASH = '4 3'
const formatValue = d3.format('~s')

export function groupColors(points: ScatterPoint[], palette: string[]): Map<string, string> {
  const groups = [...new Set(points.map(p => p.group).filter((g): g is string => !!g))]
  return new Map(groups.map((group, i) => [group, palette[i % palette.length]]))
}

export function sizeLegendValues(maxSize: number): number[] {
  const exponent = Math.floor(Math.log10(maxSize))
  const nice = [exponent - 1, exponent]
    .flatMap(e => STEPS.map(step => step * 10 ** e))
    .filter(value => value <= maxSize)
  return nice.slice(-3)
}

export interface KeyConfig {
  sizeLabel?: string
  sizeValues: number[]
  radius: (value: number) => number
  trend: boolean
}

function drawText(parent: d3.Selection<SVGGElement, unknown, null, undefined>, text: string, x: number, y: number) {
  return parent.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('font-size', TEXT_SIZE)
    .attr('fill', 'currentColor')
    .text(text)
}

function drawSizeLegend(parent: SVGGElement, { sizeLabel, sizeValues, radius }: KeyConfig, bottom: number): void {
  const g = d3.select(parent).append('g').attr('class', 'bc-size-legend')
  const maxRadius = radius(sizeValues[sizeValues.length - 1])
  if (sizeLabel) {
    drawText(g, sizeLabel, 0, bottom - maxRadius * 2 - LABEL_GAP)
  }
  sizeValues.forEach((value) => {
    const r = radius(value)
    g.append('circle')
      .attr('cx', maxRadius)
      .attr('cy', bottom - r)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.6)
    drawText(g, formatValue(value), maxRadius * 2 + LABEL_GAP, bottom - r * 2 + BASELINE_OFFSET)
  })
}

function drawTrendKey(parent: SVGGElement): void {
  const g = d3.select(parent).append('g').attr('class', 'bc-trend-key').attr('transform', `translate(0,${-ROW_HEIGHT})`)
  g.append('line')
    .attr('x1', 0)
    .attr('x2', TREND_LINE_WIDTH)
    .attr('y1', 6)
    .attr('y2', 6)
    .attr('stroke', 'currentColor')
    .attr('stroke-dasharray', TREND_DASH)
  drawText(g, 'Trend', TREND_LINE_WIDTH + LABEL_GAP, 10)
}

export function scatterKeyWidth({ sizeLabel, sizeValues, radius, trend }: KeyConfig): number {
  const widths = [0]
  if (sizeValues.length > 0) {
    const labels = sizeValues.map(formatValue)
    widths.push(radius(sizeValues[sizeValues.length - 1]) * 2 + LABEL_GAP + Math.max(...labels.map(l => measureTextWidth(l, TEXT_PX))))
    widths.push(measureTextWidth(sizeLabel ?? '', TEXT_PX))
  }
  if (trend) {
    widths.push(TREND_LINE_WIDTH + LABEL_GAP + measureTextWidth('Trend', TEXT_PX))
  }
  return Math.ceil(Math.max(...widths))
}

export function renderScatterKey(parent: SVGGElement, cfg: KeyConfig): SVGGElement | null {
  const hasSize = cfg.sizeValues.length > 0
  if (!hasSize && !cfg.trend) {
    return null
  }
  const key = d3.select(parent).append('g').attr('class', 'bc-scatter-key').node() as SVGGElement
  if (hasSize) {
    drawSizeLegend(key, cfg, cfg.trend ? -(ROW_HEIGHT + SECTION_GAP) : 0)
  }
  if (cfg.trend) {
    drawTrendKey(key)
  }
  return key
}
