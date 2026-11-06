import type { Ref } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDataTable } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useTheme } from './useTheme'
import { useChartTheme } from './useChartTheme'
import { renderChart } from '@blueprint-chart/lib'
import { resolveScene, resolveSortFromTransforms } from '@/utils/scenes'
import { buildChartRender, type RenderSnapshot } from '@/utils/chart/chartRender'

export { resolveScene, resolveSortFromTransforms }

export function readRenderSnapshot(): RenderSnapshot {
  const config = useChartConfig()
  const { currentOptions, store: optionOverrides } = useChartTypeOptions()
  const { scenes, activeIndex } = useScenes()
  const { columns, rows, columnTypes } = useDataTable()
  const { steps } = useDataTransforms()
  const { chartTheme } = useChartTheme()
  return {
    scenes: scenes.value,
    activeIndex: activeIndex.value,
    chartType: config.chartType.value,
    text: {
      title: config.title.value,
      description: config.description.value,
      byline: config.byline.value,
      note: config.note.value,
      source: config.source.value,
      sourceUrl: config.sourceUrl.value,
    },
    layout: config.layout.value,
    sort: config.sort.value,
    data: config.data.value,
    selectedColumn: config.selectedColumn.value,
    colorizes: config.colorizes.value,
    areaFills: config.areaFills.value,
    seriesOverrides: config.seriesOverrides.value,
    baseHighlights: config._base.highlights.value,
    baseAnnotations: config._base.annotations.value,
    currentOptions: currentOptions.value,
    optionOverrides,
    table: { columns: columns.value, rows: rows.value, columnTypes: columnTypes.value },
    steps: steps.value,
    chartTheme: chartTheme.value,
  }
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
    const r = buildChartRender(readRenderSnapshot())

    if (r.kind === 'empty') {
      showPlaceholder(containerRef.value, 'No data to preview')
      return
    }

    const card = containerRef.value.parentElement
    if (card) {
      if (!r.allowDarkMode && theme.value !== 'light') {
        card.setAttribute('data-bs-theme', 'light')
      }
      else {
        card.removeAttribute('data-bs-theme')
      }
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
