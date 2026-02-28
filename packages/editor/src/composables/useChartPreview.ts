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

const SINGLE_SERIES_TYPES = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']

function selectSingleSeriesData(
  data: ReturnType<typeof parseData>,
  chartType: string,
  selectedColumn: string,
) {
  if (!data.series || data.series.length === 0 || !SINGLE_SERIES_TYPES.includes(chartType)) {
    return
  }
  const match = data.series.find(s => s.name === selectedColumn)
  if (match) {
    data.values = match.values
  }
  delete data.series
}

function applyDarkModeOverride(
  card: HTMLElement | null,
  allowDark: boolean,
  theme: string,
) {
  if (!card) {
    return
  }
  if (!allowDark && theme !== 'light') {
    card.setAttribute('data-bs-theme', 'light')
  }
  else {
    card.removeAttribute('data-bs-theme')
  }
}

function buildFrameOptions(config: ReturnType<typeof useChartConfig>) {
  return {
    title: config.title.value || undefined,
    description: config.description.value || undefined,
    byline: config.byline.value || undefined,
    note: config.note.value || undefined,
    source: config.source.value || undefined,
    sourceUrl: config.sourceUrl.value || undefined,
    showCredit: config.layout.value.showCredit,
  }
}

function buildRenderOptions(
  config: ReturnType<typeof useChartConfig>,
  typeOpts: ReturnType<typeof buildChartOptions>,
) {
  return {
    frame: buildFrameOptions(config),
    sort: config.sort.value,
    sortMode: config.sortMode.value !== 'none' ? config.sortMode.value : undefined,
    ...typeOpts,
    highlights: config.highlights.value.length > 0 ? config.highlights.value : undefined,
    areaFills: config.areaFills.value.length > 0 ? config.areaFills.value : undefined,
    annotations: config.annotations.value.length > 0 ? config.annotations.value : undefined,
    seriesOverrides: config.seriesOverrides.value.length > 0 ? config.seriesOverrides.value : undefined,
  }
}

function renderChart(
  el: HTMLElement,
  config: ReturnType<typeof useChartConfig>,
  currentOptions: { value: Record<string, unknown> },
  theme: { value: string },
) {
  el.replaceChildren()
  const data = parseData(config.data.value)
  selectSingleSeriesData(data, config.chartType.value, config.selectedColumn.value)

  if (data.labels.length === 0) {
    showPlaceholder(el, 'No data to preview')
    return
  }

  const renderer = getChart(config.chartType.value)
  if (!renderer) {
    showPlaceholder(el, `Unknown chart type: ${config.chartType.value}`)
    return
  }

  const allowDark = (currentOptions.value as Record<string, unknown>).allowDarkMode ?? true
  applyDarkModeOverride(el.parentElement, Boolean(allowDark), theme.value)

  const bg = resolveBackgroundColor(el)
  const typeOpts = buildChartOptions(currentOptions.value, bg)
  renderer(el, data, buildRenderOptions(config, typeOpts))
}

function watchPreviewSources(
  containerRef: Ref<HTMLElement | null>,
  config: ReturnType<typeof useChartConfig>,
  currentOptions: { value: Record<string, unknown> },
  theme: { value: string },
) {
  return [
    containerRef, config.chartType, config.title, config.data, config.sort,
    config.sortMode, config.description, config.byline, config.note,
    config.source, config.sourceUrl, config.selectedColumn,
    config.highlights, config.areaFills, config.annotations,
    config.seriesOverrides, config.layout, currentOptions, theme,
  ]
}

export function useChartPreview(containerRef: Ref<HTMLElement | null>) {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { theme } = useTheme()

  const render = () => {
    if (containerRef.value) {
      renderChart(containerRef.value, config, currentOptions, theme)
    }
  }

  watch(
    watchPreviewSources(containerRef, config, currentOptions, theme),
    render,
    { immediate: true, deep: true },
  )

  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)
  useResizeObserver(containerRef, throttledRender)

  return { config }
}
