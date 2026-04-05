import type { Ref } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDataTable, serializeTableData } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useTheme } from './useTheme'
import { useChartTheme } from './useChartTheme'
import { getChart, parseData, buildChartOptions, resolveBackgroundColor, snapshotForFadeOut, commitFadeOut, fadeIn } from '@blueprint-chart/lib'
import { resolveScene, resolveSortFromTransforms } from '@/utils/scenes'

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
  const { currentOptions } = useChartTypeOptions()
  const { scenes, activeIndex, activeScene } = useScenes()
  const { columns, rows, columnTypes } = useDataTable()
  const { applyStepList } = useDataTransforms()
  const { theme } = useTheme()
  const { chartTheme } = useChartTheme()

  // Track previous active scene ref to detect scene navigation.
  // Symbol sentinel distinguishes "never rendered" from "rendered with no scene (null)".
  const UNSET = Symbol('unset')
  let prevActiveScene: unknown = UNSET
  let prevChartType: string | null = null
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

    // Transition when the active scene changed (base→scene, scene→scene, scene→base)
    // but not on the very first render or when other config properties changed.
    const isSceneTransition = prevActiveScene !== UNSET && rawScene !== prevActiveScene
    const isCrossType = isSceneTransition && prevChartType !== null && prevChartType !== chartType

    // Cross-type scene transitions: snapshot the old chart for fade-out, then
    // clear the container and render the new chart type fresh.
    // Same-type transitions: keep the DOM so D3 can morph shapes and colors.
    let fadeOverlay: HTMLElement | null = null
    if (isCrossType) {
      fadeOverlay = snapshotForFadeOut(containerRef.value)
      containerRef.value.replaceChildren()
    }
    else if (!isSceneTransition) {
      containerRef.value.replaceChildren()
    }

    let dataStr: string
    if (scene?.data !== undefined) {
      // Scene provides data (cascaded from resolveScene, may be inherited from prior scene)
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

    const colorizes = scene?.colorizes ?? config.colorizes.value
    // Highlights are ephemeral emphasis — only the current scene's highlights
    // apply. Do not fall back to config.highlights (which inherits from prior
    // scenes via sceneDirectRef).
    const highlights = scene ? (scene.highlights ?? []) : config._base.highlights.value
    const areaFills = scene?.areaFills ?? config.areaFills.value
    // Base annotations are always the foundation; scene annotations are additions.
    // Visibility directives (hide/show) control which annotations appear.
    const baseAnnotations = config._base.annotations.value
    const sceneAnnotations = scene?.annotations ?? []
    const rawAnnotations = [...baseAnnotations, ...sceneAnnotations]
    const annotations = scene?.hiddenAnnotationIds
      ? rawAnnotations.filter(a => !a.id || !scene.hiddenAnnotationIds!.has(a.id))
      : rawAnnotations
    const seriesOverrides = scene?.seriesOverrides ?? config.seriesOverrides.value

    const sp = scene?.properties
    renderer(containerRef.value, data, {
      frame: {
        title: (sp?.title as string | undefined) ?? (config.title.value || undefined),
        description: (sp?.description as string | undefined) ?? (config.description.value || undefined),
        byline: config.byline.value || undefined,
        note: config.note.value || undefined,
        source: (sp?.source as string | undefined) ?? (config.source.value || undefined),
        sourceUrl: (sp?.sourceUrl as string | undefined) ?? (config.sourceUrl.value || undefined),
        showCredit: config.layout.value.showCredit,
        padding: `${config.layout.value.padding}px`,
        transparentBackground: config.layout.value.transparentBackground || undefined,
      },
      sort: resolveSortFromTransforms(scene) ?? config.sort.value,
      sortMode: config.sortMode.value !== 'none' ? config.sortMode.value : undefined,
      ...typeOpts,
      colorizes: colorizes.length > 0 ? colorizes : undefined,
      highlights: highlights.length > 0 ? highlights : undefined,
      areaFills: areaFills.length > 0 ? areaFills : undefined,
      annotations: annotations.length > 0 ? annotations : undefined,
      seriesOverrides: seriesOverrides.length > 0 ? seriesOverrides : undefined,
    }, isSceneTransition && !isCrossType)

    // Cross-type fade: old chart fades out on top while new chart fades in
    if (fadeOverlay && containerRef.value) {
      const newFrame = containerRef.value.querySelector('.bc-frame')
      if (newFrame) {
        fadeIn(newFrame)
      }
      commitFadeOut(containerRef.value, fadeOverlay)
    }

    // Apply chart theme and constrained-height classes to the .bc-frame element
    const frame = containerRef.value.querySelector('.bc-frame')
    if (frame) {
      // Remove any existing theme classes
      frame.classList.forEach((cls) => {
        if (cls.startsWith('bc-theme-')) {
          frame.classList.remove(cls)
        }
      })
      frame.classList.add(`bc-theme-${chartTheme.value}`)

      // Add constrained-height class when the layout uses fixed or aspect-ratio height
      const hm = config.layout.value.heightMode
      if (hm === 'fixed' || hm === 'aspect-ratio') {
        frame.classList.add('bc-frame--constrained')
      }
    }

    prevActiveScene = rawScene
    prevChartType = chartType
  }

  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)
  useResizeObserver(containerRef, throttledRender)

  // Use a shallow comparison for most refs. Deep watch is needed for
  // currentOptions and layout (objects where individual properties change).
  // Use JSON.stringify to create a stable trigger for deep objects.
  const layoutTrigger = computed(() => JSON.stringify(config.layout.value))
  const optionsTrigger = computed(() => JSON.stringify(currentOptions.value))

  watch(
    [containerRef, config.chartType, config.title, config.data, config.sort, config.sortMode, config.description, config.byline, config.note, config.source, config.sourceUrl, config.selectedColumn, config.colorizes, config.highlights, config.areaFills, config.annotations, config.seriesOverrides, layoutTrigger, optionsTrigger, scenes, activeScene, theme, chartTheme],
    render,
    // flush: 'post' ensures Vue has applied the container's style/class bindings
    // (aspect-ratio, flex-direction) before we read them via getComputedStyle.
    // With 'pre' (the default), frame.ts could see stale CSS and fail to detect
    // constrained-height mode on the first render after a layout change.
    { immediate: true, flush: 'post' },
  )

  return { config }
}
