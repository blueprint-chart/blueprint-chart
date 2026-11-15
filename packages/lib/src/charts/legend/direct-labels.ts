import { wrapLabel } from '../axis/horizontal-axis'
import { measureMaxTextWidth, measureTextWidth } from '../text-measure'
import { spreadLabels } from '../plugins/arc-labels'

export const NARROW_THRESHOLD = 350

const FONT_PX = 12
const RENDERED_FONT_SIZE = '11px'
const LINE_HEIGHT_PX = 14
const LINE_END_GAP_PX = 10
const MIN_CENTRE_GAP_PX = 14
const MAX_WIDTH_SHARE = 0.25
const SVG_NS = 'http://www.w3.org/2000/svg'

export interface DirectLabel {
  series: string
  lines: string[]
  x: number
  y: number
  color: string
}

export function wantsDirectLabels(
  directLabelling: string | boolean | undefined,
  legend: boolean | undefined,
  containerWidth: number,
): boolean {
  if (directLabelling === 'auto') {
    const isNarrow = containerWidth > 0 && containerWidth < NARROW_THRESHOLD
    const wantsLegend = legend === true || isNarrow
    return !wantsLegend
  }
  return !!directLabelling
}

function widestWord(texts: string[]): number {
  const words = texts.flatMap(text => text.split(/\s+/).filter(Boolean))
  return measureMaxTextWidth(words, FONT_PX)
}

export function layoutDirectLabels(texts: string[], containerWidth: number): { lines: string[][], width: number } {
  if (texts.length === 0) {
    return { lines: [], width: 0 }
  }
  const cap = Math.max(MAX_WIDTH_SHARE * containerWidth, widestWord(texts))
  const lines = texts.map((text) => {
    if (containerWidth <= 0) {
      return [text]
    }
    const wrapped = wrapLabel(text, cap, undefined, FONT_PX)
    return wrapped ?? [text]
  })
  const lineWidths = lines.flat().map(line => measureTextWidth(line, FONT_PX))
  const widest = Math.max(...lineWidths)
  return { lines, width: widest + LINE_END_GAP_PX }
}

function minCentreDistance(lineCountA: number, lineCountB: number): number {
  const halfHeights = (LINE_HEIGHT_PX * lineCountA + LINE_HEIGHT_PX * lineCountB) / 2
  return Math.max(MIN_CENTRE_GAP_PX, halfHeights)
}

function halfExtraHeight(lineCount: number): number {
  return (lineCount - 1) * LINE_HEIGHT_PX / 2
}

export function spreadWrappedLabels(naturalYs: number[], lineCounts: number[], top: number, bottom: number): number[] {
  if (naturalYs.length === 0) {
    return []
  }
  const offsets = [0]
  for (let i = 1; i < naturalYs.length; i++) {
    const distance = minCentreDistance(lineCounts[i - 1], lineCounts[i])
    offsets.push(offsets[i - 1] + distance - MIN_CENTRE_GAP_PX)
  }
  const shifted = naturalYs.map((y, i) => y - offsets[i])
  const lastOffset = offsets[offsets.length - 1]
  const firstHalf = halfExtraHeight(lineCounts[0])
  const lastHalf = halfExtraHeight(lineCounts[lineCounts.length - 1])
  const innerTop = top + firstHalf
  const innerBottom = Math.max(innerTop, bottom - lastOffset - lastHalf)
  const spread = spreadLabels(shifted, innerTop, innerBottom, MIN_CENTRE_GAP_PX)
  return spread.map((y, i) => y + offsets[i])
}

export function drawDirectLabel(parent: SVGGElement, label: DirectLabel): void {
  const blockHeight = (label.lines.length - 1) * LINE_HEIGHT_PX
  const doc = parent.ownerDocument
  const text = doc.createElementNS(SVG_NS, 'text')
  text.setAttribute('class', 'bc-direct-label')
  text.setAttribute('data-series', label.series)
  text.setAttribute('x', String(label.x))
  text.setAttribute('y', String(label.y - blockHeight / 2))
  text.setAttribute('font-size', RENDERED_FONT_SIZE)
  text.setAttribute('fill', label.color)
  const lastIndex = label.lines.length - 1
  label.lines.forEach((line, index) => {
    const tspan = doc.createElementNS(SVG_NS, 'tspan')
    tspan.setAttribute('x', String(label.x))
    tspan.setAttribute('dy', index === 0 ? '0.35em' : String(LINE_HEIGHT_PX))
    tspan.textContent = index === lastIndex ? line : `${line} `
    text.appendChild(tspan)
  })
  parent.appendChild(text)
}
