import type { Component } from 'vue'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhTextAa from '~icons/ph/text-aa'
import IPhPalette from '~icons/ph/palette'
import IPhPuzzlePiece from '~icons/ph/puzzle-piece'
import IPhWaves from '~icons/ph/waves'
import IPhVectorTwo from '~icons/ph/vector-two'
import IPhPushPin from '~icons/ph/push-pin'
import IPhCursorClick from '~icons/ph/cursor-click'

export interface ChartEditSection {
  key: string
  label: string
  icon: Component
  tooltip?: string
}

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

export function useChartEditSections() {
  const { chartType } = useChartConfig()
  const { availableOptionKeys } = useChartTypeOptions()
  const { scenes } = useScenes()

  const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))
  const hasInteraction = computed(() =>
    availableOptionKeys.value.includes('tooltips')
    || availableOptionKeys.value.includes('crosshair')
    || scenes.value.length >= 1,
  )

  const sections = computed<ChartEditSection[]>(() => {
    const base: ChartEditSection[] = [
      { key: 'type', label: 'Type', icon: IPhChartBar, tooltip: 'Chart Type' },
      { key: 'text', label: 'Text', icon: IPhTextAa },
      { key: 'style', label: 'Style', icon: IPhPalette },
    ]
    if (['line-multi', 'bar-multi', 'bar-split'].includes(chartType.value)) {
      base.push({ key: 'series', label: 'Series', icon: IPhWaves })
    }
    if (hasAxisOptions.value) {
      base.push({ key: 'axes', label: 'Axes', icon: IPhVectorTwo })
    }
    base.push({ key: 'layout', label: 'Layout', icon: IPhPuzzlePiece })
    base.push({ key: 'annotate', label: 'Annotate', icon: IPhPushPin })
    if (hasInteraction.value) {
      base.push({ key: 'interactions', label: 'Interactions', icon: IPhCursorClick })
    }
    return base
  })

  return { sections }
}
