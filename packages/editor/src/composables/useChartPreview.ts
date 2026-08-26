import type { Ref } from 'vue'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDataTable, serializeTableData } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useTheme } from './useTheme'
import { useChartTheme } from './useChartTheme'
import { parseData, renderChart } from '@blueprint-chart/lib'
import { resolveScene, resolveSortFromTransforms, resolveVisibleAnnotations } from '@/utils/scenes'

export { resolveScene, resolveSortFromTransforms }

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
  const { currentOptions, store: optionOverrides } = useChartTypeOptions()
  const { scenes, activeIndex, activeScene } = useScenes()
  const { columns, rows, columnTypes, serializeTransformed } = useDataTable()
  const { steps, applyStepList, applyTransforms } = useDataTransforms()
  const { theme } = useTheme()
  const { chartTheme } = useChartTheme()

  // Track previous active scene ref to detect scene navigation.
  // Symbol sentinel distinguishes "never rendered" from "rendered with no scene (null)".
  const UNSET = Symbol('unset')
  let prevActiveScene: unknown = UNSET
  let rendering = false

  function render() {
    if (!containerRef.value || rendering) {
      return
    }
    rendering = true
    try {
      _render()
    }
    finally {
      rendering = false
    }
  }

  function _render() {
    if (!containerRef.value) {
      return
    }

    const rawScene = activeScene.value
    const scene = resolveScene(scenes.value, activeIndex.value)
    const chartType = scene?.chartType ?? config.chartType.value

    // Pre-resolve data: scene data > base pipeline + scene transforms > base
    // pipeline > base config. The base pipeline always runs first: the chart's
    // `data` block holds the source table, not the pipeline's output.
    let dataStr: string
    if (scene?.data !== undefined) {
      dataStr = scene.data
    }
    else if (scene?.transforms?.length && columns.value.length > 0) {
      const base = applyTransforms(columns.value, rows.value, columnTypes.value)
      const result = applyStepList(scene.transforms, base.columns, base.rows, base.columnTypes)
      dataStr = serializeTableData(result.columns, result.rows)
    }
    else {
      dataStr = serializeTransformed() ?? config.data.value
    }
    const data = parseData(dataStr)

    // Single-series flattening (editor-specific shaping)
    const singleSeriesTypes = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.VerticalBar, ChartType.HorizontalBar]
    if (data.series && data.series.length > 0 && singleSeriesTypes.includes(chartType)) {
      const match = data.series.find(s => s.name === config.selectedColumn.value)
      if (match) {
        data.values = match.values
      }
      delete data.series
    }

    if (data.labels.length === 0) {
      showPlaceholder(containerRef.value, 'No data to preview')
      return
    }

    // allowDarkMode → flip the parent card data-bs-theme when needed
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

    // Detect scene change for transition flag; lib handles cross-type fade itself.
    const isSceneTransition = prevActiveScene !== UNSET && rawScene !== prevActiveScene

    // Build ChartDefinition with the pre-resolved active scene baked in.
    // We pass NO scenes array — the editor pre-resolves the active scene above.
    const mergedOpts = scene?.chartTypeOptions
      ? { ...currentOptions.value, ...scene.chartTypeOptions }
      : currentOptions.value

    const colorizes = scene?.colorizes ?? config.colorizes.value
    const highlights = scene ? (scene.highlights ?? []) : config._base.highlights.value
    const areaFills = scene?.areaFills ?? config.areaFills.value
    const annotations = resolveVisibleAnnotations(
      config._base.annotations.value,
      scenes.value,
      activeIndex.value,
    ).map(v => ({ ...v.config, key: v.key }))
    const seriesOverrides = scene?.seriesOverrides ?? config.seriesOverrides.value

    const sp = scene?.properties
    const layoutPadding = config.layout.value.padding
    const frame = {
      title: (sp?.title as string | undefined) ?? (config.title.value || undefined),
      description: (sp?.description as string | undefined) ?? (config.description.value || undefined),
      byline: config.byline.value || undefined,
      note: config.note.value || undefined,
      source: (sp?.source as string | undefined) ?? (config.source.value || undefined),
      sourceUrl: (sp?.sourceUrl as string | undefined) ?? (config.sourceUrl.value || undefined),
      padding: typeof layoutPadding === 'number' ? `${layoutPadding}px` : layoutPadding,
      transparentBackground: config.layout.value.transparentBackground || undefined,
    }

    renderChart(containerRef.value, {
      chartType,
      data,
      options: mergedOpts,
      frame,
      colorizes,
      highlights,
      areaFills,
      annotations,
      seriesOverrides,
      sort: resolveSortFromTransforms(scene) ?? config.sort.value,
      // Explicit overrides only. `buildChartOptions` does not pass the registry
      // default through either, so resolving it here would sort bar-multi and
      // bar-grouped in the canvas while renderBpc of the same file leaves them
      // in source order.
      sortMode: scene?.chartTypeOptions?.sortMode ?? optionOverrides[chartType]?.sortMode,
      theme: chartTheme.value,
    }, {
      transition: isSceneTransition,
      // Layout is driven by reactive layout config on the container element, not BPC properties.
      // Bypass lib's BPC-property-based layout pass so we don't re-apply.
      ignoreLayout: true,
    })

    prevActiveScene = rawScene
  }

  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)
  useResizeObserver(containerRef, throttledRender)

  // Use a shallow comparison for most refs. Deep watch is needed for
  // currentOptions and layout (objects where individual properties change).
  // Use JSON.stringify to create a stable trigger for deep objects.
  const layoutTrigger = computed(() => JSON.stringify(config.layout.value))
  const optionsTrigger = computed(() => JSON.stringify(currentOptions.value))
  const stepsTrigger = computed(() => JSON.stringify(steps.value))

  watch(
    [containerRef, config.chartType, config.title, config.data, config.sort, config.description, config.byline, config.note, config.source, config.sourceUrl, config.selectedColumn, config.colorizes, config.highlights, config.areaFills, config.annotations, config.seriesOverrides, stepsTrigger, layoutTrigger, optionsTrigger, scenes, activeScene, theme, chartTheme],
    render,
    // flush: 'post' ensures Vue has applied the container's style/class bindings
    // (aspect-ratio, flex-direction) before we read them via getComputedStyle.
    // With 'pre' (the default), frame.ts could see stale CSS and fail to detect
    // constrained-height mode on the first render after a layout change.
    { immediate: true, flush: 'post' },
  )

  return { config }
}
