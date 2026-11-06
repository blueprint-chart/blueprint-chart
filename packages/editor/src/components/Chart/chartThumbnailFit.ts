import type { ChartLayout } from '@/composables/useChartConfig'

export const THUMBNAIL_RESPONSIVE_WIDTH = 640

interface Size {
  width: number
  height: number
}

export function thumbnailWidth(layout: ChartLayout): number {
  if (layout.sizing === 'fixed') {
    return layout.fixedWidth
  }
  if (layout.sizing === 'max-width') {
    return layout.maxWidth
  }
  return THUMBNAIL_RESPONSIVE_WIDTH
}

export function fitCard(box: Size, card: Size, maxPadding: number): { scale: number, x: number, y: number } {
  const padding = Math.min(maxPadding, box.width / 16, box.height / 16)
  const scale = Math.min(1, (box.width - padding * 2) / card.width, (box.height - padding * 2) / card.height)
  if (!(scale > 0) || !(card.width > 0) || !(card.height > 0)) {
    return { scale: 0, x: 0, y: 0 }
  }
  return {
    scale,
    x: Math.max(0, (box.width - card.width * scale) / 2),
    y: Math.max(0, (box.height - card.height * scale) / 2),
  }
}
