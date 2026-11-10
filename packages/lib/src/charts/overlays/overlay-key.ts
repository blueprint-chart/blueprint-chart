import type { ChartOptions } from '../types'
import { estimateLegendSize } from '../legend/legend-size'
import type { OverlayKeyEntry, OverlayLegendPlacement } from './overlays'

export type Margins = Partial<Record<'top' | 'bottom' | 'left' | 'right', number>>

export interface OverlayKeyLayout {
  show: boolean
  margins: Margins
  place: (width: number, height: number, margin: { left: number, right: number, bottom: number }) => OverlayLegendPlacement
}

const NARROW_KEY_WIDTH = 350
const KEY_ANCHOR = 'start'

export function overlayKeyLayout(entries: OverlayKeyEntry[], options: ChartOptions, containerWidth: number, lpMargins: Margins, hasCategoryLabelLine: boolean): OverlayKeyLayout {
  const show = entries.length > 0 && options.legend !== false
  const margins: Margins = { ...lpMargins }
  const titles = entries.map(entry => entry.title)
  const requested = options.legendPosition ?? 'top'
  const isSide = requested === 'left' || requested === 'right'
  const isNarrow = containerWidth > 0 && containerWidth < NARROW_KEY_WIDTH
  const position = isNarrow && isSide ? 'top' : requested
  const availableWidth = Math.max(0, containerWidth - (lpMargins.left ?? 50) - (lpMargins.right ?? 20))
  const size = show ? estimateLegendSize(titles, position, availableWidth) : { width: 0, height: 0 }
  const legendH = show ? size.height + 15 : 0
  const insideGap = lpMargins.top != null ? 15 : 0
  if (show && position === 'top') {
    margins.top = legendH + insideGap
  }
  if (show && position === 'left') {
    margins.left = (margins.left ?? 50) + size.width + 10
  }
  if (show && position === 'right') {
    margins.right = (margins.right ?? 20) + size.width + 10
  }
  if (show && position === 'bottom') {
    const labelH = hasCategoryLabelLine ? 0 : Math.max(margins.bottom ?? 24, 24)
    margins.bottom = labelH + legendH
  }
  const place = (width: number, height: number, margin: { left: number, right: number, bottom: number }): OverlayLegendPlacement => {
    const inset = { left: margin.left, right: margin.right }
    const base = { position, anchor: KEY_ANCHOR, width, height, inset }
    if (position === 'top') {
      return { ...base, x: 0, y: -(size.height + 10 + insideGap) }
    }
    if (position === 'bottom') {
      return { ...base, x: 0, y: height + Math.max(margin.bottom - legendH, 0) }
    }
    if (position === 'left') {
      return { ...base, x: -(size.width + 10), y: 0 }
    }
    return { ...base, x: width + 10, y: 0 }
  }
  return { show, margins, place }
}
