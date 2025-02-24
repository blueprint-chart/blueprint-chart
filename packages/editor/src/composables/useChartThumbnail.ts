import { watch } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { useChartSession } from './useChartSession'
import { getChart, parseData, buildChartOptions } from '@blueprint-chart/lib'
import type { ChartData } from '@blueprint-chart/lib'

const THUMB_KEY = (id: string) => `blueprint-chart:${id}:thumbnail`
const THROTTLE_MS = 30_000

export function renderThumbnailSvg(
  chartType: string,
  data: ChartData,
  typeOpts: Partial<ChartTypeOptions>,
  sort: 'ascending' | 'descending' | 'none',
): string | null {
  const renderer = getChart(chartType)
  if (!renderer) return null
  if (data.labels.length === 0) return null

  const THUMB_W = 600
  const THUMB_H = 400

  // Build an offscreen container whose .bc-frame-body child will have a
  // concrete size so that createCanvas picks up the right dimensions.
  // We inject a stylesheet that forces frame elements to fill the container.
  const container = document.createElement('div')
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${THUMB_W}px;height:${THUMB_H}px;overflow:hidden;`

  const style = document.createElement('style')
  style.textContent = [
    `#__bc_thumb .bc-frame { height:${THUMB_H}px; display:flex; flex-direction:column; }`,
    `#__bc_thumb .bc-frame-header, #__bc_thumb .bc-frame-footer { display:none; }`,
    `#__bc_thumb .bc-frame-body { flex:1; min-height:0; }`,
  ].join('\n')
  container.id = '__bc_thumb'

  document.head.appendChild(style)
  document.body.appendChild(container)

  try {
    const chartOpts = buildChartOptions(typeOpts)
    renderer(container, data, {
      sort,
      ...chartOpts,
    })

    const svg = container.querySelector('svg')
    if (!svg) return null

    // Add a viewBox so the SVG scales proportionally when displayed at
    // thumbnail size, instead of being clipped.
    const w = svg.getAttribute('width')
    const h = svg.getAttribute('height')
    if (w && h && !svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    }
    svg.removeAttribute('width')
    svg.removeAttribute('height')

    return svg.outerHTML
  }
  finally {
    document.body.removeChild(container)
    document.head.removeChild(style)
  }
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

  const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']
  if (data.series && data.series.length > 0 && singleSeriesTypes.includes(chartConfig.chartType)) {
    const match = data.series.find(s => s.name === chartConfig.selectedColumn)
    if (match) {
      data.values = match.values
    }
    delete data.series
  }

  const typeOpts = chartTypeOptions[chartConfig.chartType] ?? {}
  return renderThumbnailSvg(chartConfig.chartType, data, typeOpts, chartConfig.sort)
}

export function useChartThumbnail() {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { sessionId } = useChartSession()

  let lastRenderTime = 0
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null

  function generate() {
    if (!sessionId.value) return
    if (!config.data.value) return

    const data = parseData(config.data.value)

    const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']
    if (data.series && data.series.length > 0 && singleSeriesTypes.includes(config.chartType.value)) {
      const match = data.series.find(s => s.name === config.selectedColumn.value)
      if (match) {
        data.values = match.values
      }
      delete data.series
    }

    const svg = renderThumbnailSvg(config.chartType.value, data, currentOptions.value, config.sort.value)
    if (svg) {
      saveThumbnail(sessionId.value, svg)
    }
  }

  function throttledGenerate() {
    const now = Date.now()
    const elapsed = now - lastRenderTime

    if (elapsed >= THROTTLE_MS) {
      lastRenderTime = now
      generate()
    }
    else if (!pendingTimeout) {
      pendingTimeout = setTimeout(() => {
        pendingTimeout = null
        lastRenderTime = Date.now()
        generate()
      }, THROTTLE_MS - elapsed)
    }
  }

  watch(
    [config.chartType, config.data, config.sort, config.selectedColumn, currentOptions],
    throttledGenerate,
    { deep: true },
  )
}
