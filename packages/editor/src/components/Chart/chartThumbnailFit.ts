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

export function fitCard(box: Size, card: Size, padding: number): { scale: number, x: number, y: number } {
  const scale = Math.max(0, Math.min(1, (box.width - padding * 2) / card.width, (box.height - padding * 2) / card.height))
  return {
    scale,
    x: Math.max(0, (box.width - card.width * scale) / 2),
    y: Math.max(0, (box.height - card.height * scale) / 2),
  }
}
