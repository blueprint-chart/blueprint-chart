import { watch, type Ref } from 'vue'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes, type SceneOverride } from './useScenes'
import { useDataTable, serializeTableData } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
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

/**
 * Fold scenes 0..index into a single resolved override.
 * Each field uses "last scene that defined it" semantics, so scene N
 * inherits anything set by scenes 0..N-1 that it doesn't override itself.
 */
export function resolveScene(scenes: SceneOverride[], index: number): SceneOverride | null {
  if (index < 0 || index >= scenes.length) {
    return null
  }
  const resolved: SceneOverride = { id: scenes[index].id, name: scenes[index].name }
  for (let i = 0; i <= index; i++) {
    const s = scenes[i]
    if (s.chartType !== undefined) {
      resolved.chartType = s.chartType
    }
    if (s.data !== undefined) {
      resolved.data = s.data
    }
    if (s.chartTypeOptions !== undefined) {
      resolved.chartTypeOptions = resolved.chartTypeOptions
        ? { ...resolved.chartTypeOptions, ...s.chartTypeOptions }
        : { ...s.chartTypeOptions }
    }
    if (s.highlights !== undefined) {
      resolved.highlights = s.highlights
    }
    if (s.areaFills !== undefined) {
      resolved.areaFills = s.areaFills
    }
    if (s.annotations !== undefined) {
      resolved.annotations = s.annotations
    }
    if (s.seriesOverrides !== undefined) {
      resolved.seriesOverrides = s.seriesOverrides
    }
    if (s.transforms !== undefined) {
      resolved.transforms = s.transforms
    }
    if (s.properties !== undefined) {
      resolved.properties = resolved.properties
        ? { ...resolved.properties, ...s.properties }
        : { ...s.properties }
    }
  }
  return resolved
}

export function useChartPreview(containerRef: Ref<HTMLElement | null>) {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { scenes, activeIndex, activeScene } = useScenes()
  const { columns, rows, columnTypes } = useDataTable()
  const { applyStepList } = useDataTransforms()
  const { theme } = useTheme()

  // Track previous active scene ref to detect scene navigation.
  // Symbol sentinel distinguishes "never rendered" from "rendered with no scene (null)".
  const UNSET = Symbol('unset')
  let prevActiveScene: unknown = UNSET

  function render() {
    if (!containerRef.value) {
      return
    }

    const rawScene = activeScene.value
    const scene = resolveScene(scenes.value, activeIndex.value)
    const chartType = scene?.chartType ?? config.chartType.value

    // Transition when the active scene changed (base→scene, scene→scene, scene→base)
    // but not on the very first render or when other config properties changed.
    const isSceneTransition = prevActiveScene !== UNSET && rawScene !== prevActiveScene

    // Skip clearing during scene transitions so render functions can
    // extract existing data elements for smooth D3 data-join animations
    if (!isSceneTransition) {
      containerRef.value.replaceChildren()
    }

    let dataStr: string
    if (scene?.data) {
      // Scene provides explicit data override
      dataStr = scene.data
    }
    else if (scene?.transforms?.length && columns.value.length > 0) {
      // Apply scene transforms to raw table data
      const result = applyStepList(scene.transforms, columns.value, rows.value, columnTypes.value)
      dataStr = serializeTableData(result.columns, result.rows)
    }
    else {
      dataStr = config.data.value
    }
    const data = parseData(dataStr)

    const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']
    if (data.series && data.series.length > 0 && singleSeriesTypes.includes(chartType)) {
      const colName = config.selectedColumn.value
      const match = data.series.find(s => s.name === colName)
      if (match) {
        data.values = match.values
      }
      delete data.series
    }

    if (data.labels.length === 0) {
      showPlaceholder(containerRef.value, 'No data to preview')
      return
    }

    const renderer = getChart(chartType)
    if (!renderer) {
      showPlaceholder(containerRef.value, `Unknown chart type: ${chartType}`)
      return
    }

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
    const mergedOpts = scene?.chartTypeOptions
      ? { ...currentOptions.value, ...scene.chartTypeOptions }
      : currentOptions.value
    const typeOpts = buildChartOptions(mergedOpts, bg)

    const highlights = scene?.highlights ?? config.highlights.value
    const areaFills = scene?.areaFills ?? config.areaFills.value
    const annotations = scene?.annotations ?? config.annotations.value
    const seriesOverrides = scene?.seriesOverrides ?? config.seriesOverrides.value

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
      highlights: highlights.length > 0 ? highlights : undefined,
      areaFills: areaFills.length > 0 ? areaFills : undefined,
      annotations: annotations.length > 0 ? annotations : undefined,
      seriesOverrides: seriesOverrides.length > 0 ? seriesOverrides : undefined,
    }, isSceneTransition)

    prevActiveScene = rawScene
  }

  watch(
    [containerRef, config.chartType, config.title, config.data, config.sort, config.sortMode, config.description, config.byline, config.note, config.source, config.sourceUrl, config.selectedColumn, config.highlights, config.areaFills, config.annotations, config.seriesOverrides, config.layout, currentOptions, activeScene, theme],
    render,
    { immediate: true, deep: true },
  )

  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)
  useResizeObserver(containerRef, throttledRender)

  return { config }
}
