import { watch, type Ref } from 'vue'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useTheme } from './useTheme'
import { getChart, parseData, buildChartOptions, resolveBackgroundColor } from '@blueprint-chart/lib'

function showPlaceholder(el: HTMLElement, message: string) {
  el.replaceChildren()
  const div = document.createElement('div')
  div.className = 'text-center text-muted p-5'
  div.textContent = message
  el.appendChild(div)
}

const RESIZE_THROTTLE_MS = 150

export function useChartPreview(containerRef: Ref<HTMLElement | null>) {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { theme } = useTheme()

  function render() {
    if (!containerRef.value) return
    containerRef.value.replaceChildren()

    const data = parseData(config.data.value)

    const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']
    if (data.series && data.series.length > 0 && singleSeriesTypes.includes(config.chartType.value)) {
      const colName = config.selectedColumn.value
      const match = data.series.find(s => s.name === colName)
      if (match) {
        data.values = match.values
      }
      // else keep default (first series values already assigned)
      delete data.series // don't pass series to single-series renderer
    }

    if (data.labels.length === 0) {
      showPlaceholder(containerRef.value, 'No data to preview')
      return
    }

    const renderer = getChart(config.chartType.value)
    if (!renderer) {
      showPlaceholder(containerRef.value, `Unknown chart type: ${config.chartType.value}`)
      return
    }

    // When dark mode is not allowed, force light theme on the preview card
    // so the chart always renders with a light background.
    const allowDark = currentOptions.value.allowDarkMode ?? true
    const card = containerRef.value.parentElement
    if (card) {
      if (!allowDark && theme.value !== 'light') {
        card.setAttribute('data-bs-theme', 'light')
      }
      else {
        card.removeAttribute('data-bs-theme')
      }
    }

    const bg = resolveBackgroundColor(containerRef.value)
    const typeOpts = buildChartOptions(currentOptions.value, bg)

    renderer(containerRef.value, data, {
      frame: {
        title: config.title.value || undefined,
        description: config.description.value || undefined,
        byline: config.byline.value || undefined,
        note: config.note.value || undefined,
        source: config.source.value || undefined,
        sourceUrl: config.sourceUrl.value || undefined,
        showCredit: config.layout.value.showCredit,
      },
      sort: config.sort.value,
      sortMode: config.sortMode.value !== 'none' ? config.sortMode.value : undefined,
      ...typeOpts,
      highlights: config.highlights.value.length > 0 ? config.highlights.value : undefined,
      areaFills: config.areaFills.value.length > 0 ? config.areaFills.value : undefined,
      annotations: config.annotations.value.length > 0 ? config.annotations.value : undefined,
      seriesOverrides: config.seriesOverrides.value.length > 0 ? config.seriesOverrides.value : undefined,
    })
  }

  watch(
    [containerRef, config.chartType, config.title, config.data, config.sort, config.sortMode, config.description, config.byline, config.note, config.source, config.sourceUrl, config.selectedColumn, config.highlights, config.areaFills, config.annotations, config.seriesOverrides, config.layout, currentOptions, theme],
    render,
    { immediate: true, deep: true },
  )

  // Re-render when the container itself resizes (panel drag, window resize, etc.)
  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)
  useResizeObserver(containerRef, throttledRender)

  return { config }
}
