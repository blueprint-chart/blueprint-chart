import { watch, type Ref } from 'vue'
import { useChartConfig } from './useChartConfig'

export function useChartPreview(containerRef: Ref<HTMLElement | null>) {
  const config = useChartConfig()

  watch(
    [config.chartType, config.title, config.data, config.sort],
    () => {
      if (!containerRef.value) return
      const title = config.title.value || 'Untitled'
      const type = config.chartType.value
      containerRef.value.innerHTML
        = `<div class="text-center text-muted p-5">Chart preview: ${type} &mdash; ${title}</div>`
    },
    { immediate: true },
  )

  return { config }
}
