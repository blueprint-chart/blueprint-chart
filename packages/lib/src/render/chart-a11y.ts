import type { ChartData, FrameOptions } from '../charts/types'

export interface ChartAccessibility {
  /** Accessible name: what a screen reader announces for the graphic. */
  label: string
  /** Long description: the author's own, then a summary of the plotted data. */
  description: string
}

const SVG_NS = 'http://www.w3.org/2000/svg'

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function summariseData(kind: string, data: ChartData): string {
  const series = data.series ?? []
  const values = (series.length > 0 ? series.flatMap(s => s.values) : data.values)
    .filter(value => Number.isFinite(value))
  const categories = `${data.labels.length} categor${data.labels.length === 1 ? 'y' : 'ies'}`
  const across = series.length > 0
    ? ` across ${series.length} series (${series.map(s => s.name).join(', ')})`
    : ''
  const range = values.length > 0
    ? `, values from ${Math.min(...values)} to ${Math.max(...values)}`
    : ''
  return `${kind} of ${categories}${across}${range}.`
}

export function buildChartAccessibility(
  chartType: string,
  frame: FrameOptions | null | undefined,
  data: ChartData,
): ChartAccessibility {
  const kind = `${chartType.replace(/-/g, ' ')} chart`
  const title = frame?.title ? collapseWhitespace(frame.title) : ''
  const description = frame?.description ? collapseWhitespace(frame.description) : ''
  return {
    label: title || kind,
    description: [description, summariseData(kind, data)].filter(Boolean).join(' '),
  }
}

/** Upserts a direct `<title>`/`<desc>` child, keeping `<title>` first. */
function setMetadata(svg: SVGSVGElement, tag: 'title' | 'desc', text: string): void {
  const existing = Array.from(svg.children).find(child => child.tagName === tag)
  const element = existing ?? svg.ownerDocument.createElementNS(SVG_NS, tag)
  element.textContent = text
  if (!existing) {
    svg.insertBefore(element, svg.firstChild)
  }
}

/**
 * Without this the plot is an unlabelled pile of shapes: assistive technology
 * walks into the marks and announces nothing about the graphic. `role="img"`
 * collapses the subtree to one node, and `aria-label` names it.
 */
export function applyChartAccessibility(svg: SVGSVGElement, a11y: ChartAccessibility): void {
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', a11y.label)
  setMetadata(svg, 'desc', a11y.description)
  setMetadata(svg, 'title', a11y.label)
}
