import { computed, type CSSProperties, type Ref } from 'vue'
import type { ChartLayout } from './useChartConfig'

export function parseAspectRatio(ratio: string): number | undefined {
  const parts = ratio.split(':')
  if (parts.length !== 2) {
    return undefined
  }
  const w = Number(parts[0])
  const h = Number(parts[1])
  return w && h ? w / h : undefined
}

export function useCanvasCardStyle(layout: Ref<ChartLayout>, classPrefix: string) {
  const hasConstrainedHeight = computed(() =>
    layout.value.heightMode === 'fixed' || layout.value.heightMode === 'aspect-ratio',
  )

  const cardClass = computed(() => ({
    [`${classPrefix}--fixed`]: layout.value.sizing === 'fixed',
    [`${classPrefix}--max-width`]: layout.value.sizing === 'max-width',
    [`${classPrefix}--transparent`]: layout.value.transparentBackground,
    [`${classPrefix}--constrained-height`]: hasConstrainedHeight.value,
  }))

  const cardStyle = computed<CSSProperties>(() => {
    const l = layout.value
    const style: CSSProperties = {
      padding: `${l.padding}px`,
    }
    if (l.sizing === 'fixed') {
      style.width = `${l.fixedWidth}px`
    }
    else if (l.sizing === 'max-width') {
      style.maxWidth = `${l.maxWidth}px`
      style.width = '100%'
    }
    if (l.heightMode === 'fixed') {
      style.height = `${l.fixedHeight}px`
    }
    else if (l.heightMode === 'aspect-ratio') {
      const ratio = parseAspectRatio(l.aspectRatio)
      if (ratio) {
        style.aspectRatio = String(ratio)
      }
    }
    return style
  })

  return { cardClass, cardStyle, hasConstrainedHeight }
}
