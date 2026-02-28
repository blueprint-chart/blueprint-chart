import { watch } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { useChartSession } from './useChartSession'
import { getChart, parseData, buildChartOptions } from '@blueprint-chart/lib'
import type { ChartData, SeriesOverride } from '@blueprint-chart/lib'
import type { ChartHighlight } from './useChartConfig'

const THUMB_KEY = (id: string) => `blueprint-chart:${id}:thumbnail`
const THROTTLE_MS = 30_000
const THUMB_W = 600
const THUMB_H = 400

function createOffscreenContainer(): { container: HTMLElement, style: HTMLStyleElement } {
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${THUMB_W}px;height:${THUMB_H}px;overflow:hidden;`

  const style = document.createElement('style')
  style.textContent = [
    `#__bc_thumb .bc-frame { height:${THUMB_H}px; display:flex; flex-direction:column; }`,
    `#__bc_thumb .bc-frame-header, #__bc_thumb .bc-frame-footer { display:none; }`,
    `#__bc_thumb .bc-frame-body { flex:1; min-height:0; }`,
  ].join('\n')
  container.id = '__bc_thumb'

  return { container, style }
}

function normalizeSvgViewBox(svg: SVGSVGElement): void {
  const w = svg.getAttribute('width')
  const h = svg.getAttribute('height')
  if (w && h && !svg.getAttribute('viewBox')) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')
}

function selectSingleSeries(data: ChartData, chartType: string, selectedColumn?: string): void {
  const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']
  if (!data.series || data.series.length === 0 || !singleSeriesTypes.includes(chartType)) {
    return
  }
  const colName = selectedColumn ?? ''
  const match = data.series.find(s => s.name === colName)
  if (match) {
    data.values = match.values
  }
  delete data.series
}

export function renderThumbnailSvg(
  chartType: string,
  data: ChartData,
  typeOpts: Partial<ChartTypeOptions>,
  sort: 'ascending' | 'descending' | 'none',
  options?: { highlights?: ChartHighlight[], seriesOverrides?: SeriesOverride[] },
): string | null {
  const renderer = getChart(chartType)
  if (!renderer || data.labels.length === 0) {
    return null
  }

  const { container, style } = createOffscreenContainer()
  document.head.appendChild(style)
  document.body.appendChild(container)

  try {
    return renderInContainer(container, renderer, data, typeOpts, sort, options)
  }
  finally {
    document.body.removeChild(container)
    document.head.removeChild(style)
  }
}

function renderInContainer(
  container: HTMLElement,
  renderer: ReturnType<typeof getChart>,
  data: ChartData,
  typeOpts: Partial<ChartTypeOptions>,
  sort: 'ascending' | 'descending' | 'none',
  options?: { highlights?: ChartHighlight[], seriesOverrides?: SeriesOverride[] },
): string | null {
  const chartOpts = buildChartOptions(typeOpts)
  renderer!(container, data, {
    sort,
    ...chartOpts,
    highlights: options?.highlights,
    seriesOverrides: options?.seriesOverrides,
  })

  const svg = container.querySelector('svg')
  if (!svg) {
    return null
  }
  normalizeSvgViewBox(svg)
  return svg.outerHTML
}

export function getThumbnail(id: string): string | null {
  return localStorage.getItem(THUMB_KEY(id))
}

export function saveThumbnail(id: string, svg: string): void {
  localStorage.setItem(THUMB_KEY(id), svg)
}

export function deleteThumbnail(id: string): void {
  localStorage.removeItem(THUMB_KEY(id))
}

export function renderThumbnailFromPayload(payload: {
  chartConfig: { chartType: string, data: string, sort: 'ascending' | 'descending' | 'none', selectedColumn: string }
  chartTypeOptions: Record<string, Partial<ChartTypeOptions>>
}): string | null {
  const { chartConfig, chartTypeOptions } = payload
  const data = parseData(chartConfig.data)
  selectSingleSeries(data, chartConfig.chartType, chartConfig.selectedColumn)
  const typeOpts = chartTypeOptions[chartConfig.chartType] ?? {}
  return renderThumbnailSvg(chartConfig.chartType, data, typeOpts, chartConfig.sort)
}

function generateThumbnail(
  config: ReturnType<typeof useChartConfig>,
  currentOptions: { value: Partial<ChartTypeOptions> },
  sessionId: { value: string },
) {
  if (!sessionId.value || !config.data.value) {
    return
  }
  const data = parseData(config.data.value)
  selectSingleSeries(data, config.chartType.value, config.selectedColumn.value)
  const svg = renderThumbnailSvg(config.chartType.value, data, currentOptions.value, config.sort.value, {
    highlights: config.highlights.value.length > 0 ? config.highlights.value : undefined,
    seriesOverrides: config.seriesOverrides.value.length > 0 ? config.seriesOverrides.value : undefined,
  })
  if (svg) {
    saveThumbnail(sessionId.value, svg)
  }
}

export function useChartThumbnail() {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { sessionId } = useChartSession()

  const throttledGenerate = useThrottleFn(
    () => generateThumbnail(config, currentOptions, sessionId),
    THROTTLE_MS,
  )

  watch(
    [config.chartType, config.data, config.sort, config.selectedColumn, config.highlights, config.seriesOverrides, currentOptions],
    throttledGenerate,
    { deep: true },
  )
}
