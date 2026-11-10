import type { Ref, ToRefs } from 'vue'
import type { ChartConfig } from './useChartConfig'
import type { ChartTypeOptions } from './useChartTypeOptions'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDataTable } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useChartTheme } from './useChartTheme'
import { useEditorPanel } from '@/stores/editorPanel'
import { renderChart } from '@blueprint-chart/lib'
import { resolveScene, resolveSortFromTransforms } from '@/utils/scenes'
import { buildChartRender, type RenderSnapshot } from '@/utils/chart/chartRender'

export { resolveScene, resolveSortFromTransforms }

type ConfigRefs = ToRefs<ChartConfig>

function snapshotFrom(source: ConfigRefs, activeIndex: number, currentOptions: Partial<ChartTypeOptions>): RenderSnapshot {
  const config = useChartConfig()
  const { store: optionOverrides } = useChartTypeOptions()
  const { scenes } = useScenes()
  const { columns, rows, columnTypes } = useDataTable()
  const { steps } = useDataTransforms()
  const { chartTheme } = useChartTheme()
  return {
    scenes: scenes.value,
    activeIndex,
    chartType: source.chartType.value,
    text: {
      title: source.title.value,
      description: source.description.value,
      altText: source.altText.value,
      byline: source.byline.value,
      note: source.note.value,
      source: source.source.value,
      sourceUrl: source.sourceUrl.value,
    },
    layout: source.layout.value,
    sort: source.sort.value,
    data: source.data.value,
    selectedColumn: source.selectedColumn.value,
    colorizes: source.colorizes.value,
    areaFills: source.areaFills.value,
    overlays: source.overlays.value,
    seriesOverrides: source.seriesOverrides.value,
    baseHighlights: config._base.highlights.value,
    baseAnnotations: config._base.annotations.value,
    currentOptions,
    optionOverrides,
    table: { columns: columns.value, rows: rows.value, columnTypes: columnTypes.value },
    steps: steps.value,
    chartTheme: chartTheme.value,
  }
}

export function readRenderSnapshot(): RenderSnapshot {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const { activeIndex } = useScenes()
  return snapshotFrom(config as ConfigRefs, activeIndex.value, currentOptions.value)
}

export function readBaseRenderSnapshot(): RenderSnapshot {
  const { _base } = useChartConfig()
  const { baseOptions } = useChartTypeOptions()
  return snapshotFrom(_base, -1, baseOptions.value)
}

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
  const { scenes, activeScene } = useScenes()
  const { steps } = useDataTransforms()
  const { resolvedCanvasMode } = useEditorPanel()
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
    const r = buildChartRender(readRenderSnapshot())

    const card = containerRef.value.parentElement
    if (r.kind === 'chart' && !r.allowDarkMode && resolvedCanvasMode.value === 'dark') {
      card?.setAttribute('data-bs-theme', 'light')
    }
    else {
      card?.removeAttribute('data-bs-theme')
    }

    if (r.kind === 'empty') {
      showPlaceholder(containerRef.value, 'No data to preview')
      return
    }

    // Detect scene change for transition flag; lib handles cross-type fade itself.
    const isSceneTransition = prevActiveScene !== UNSET && rawScene !== prevActiveScene

    renderChart(containerRef.value, r.definition, {
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
    [containerRef, config.chartType, config.title, config.data, config.sort, config.description, config.altText, config.byline, config.note, config.source, config.sourceUrl, config.selectedColumn, config.colorizes, config.highlights, config.areaFills, config.overlays, config.annotations, config.seriesOverrides, stepsTrigger, layoutTrigger, optionsTrigger, scenes, activeScene, resolvedCanvasMode, chartTheme],
    render,
    // flush: 'post' ensures Vue has applied the container's style/class bindings
    // (aspect-ratio, flex-direction) before we read them via getComputedStyle.
    // With 'pre' (the default), frame.ts could see stale CSS and fail to detect
    // constrained-height mode on the first render after a layout change.
    { immediate: true, flush: 'post' },
  )

  return { config }
}
