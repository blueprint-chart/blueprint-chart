import { watch, computed, type Ref } from 'vue'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes, type SceneOverride } from './useScenes'
import { useDataTable, serializeTableData } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useTheme } from './useTheme'
import { useChartTheme } from './useChartTheme'
import { getChart, parseData, buildChartOptions, resolveBackgroundColor, snapshotForFadeOut, commitFadeOut, fadeIn } from '@blueprint-chart/lib'

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
  const hiddenIds = new Set<string>()
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
    if (s.highlights !== undefined && s.highlights.length > 0) {
      resolved.highlights = s.highlights
    }
    else if (s.data !== undefined) {
      // When a scene provides new data, clear inherited highlights
      // since they likely target different series names
      resolved.highlights = []
    }
    if (s.areaFills !== undefined && s.areaFills.length > 0) {
      resolved.areaFills = s.areaFills
    }
    if (s.annotations !== undefined && s.annotations.length > 0) {
      resolved.annotations = s.annotations
    }
    if (s.annotationVisibility) {
      for (const v of s.annotationVisibility) {
        if (v.action === 'hide') {
          hiddenIds.add(v.id)
        }
        else {
          hiddenIds.delete(v.id)
        }
      }
    }
    if (s.seriesOverrides !== undefined && s.seriesOverrides.length > 0) {
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
  if (hiddenIds.size > 0) {
    resolved.hiddenAnnotationIds = hiddenIds
  }
  return resolved
}

/**
 * Extract sort direction from resolved scene transforms.
 * Returns the direction from the last sort transform, or undefined if none.
 */
export function resolveSortFromTransforms(scene: SceneOverride | null): string | undefined {
  if (!scene?.transforms?.length) {
    return undefined
  }
  for (let i = scene.transforms.length - 1; i >= 0; i--) {
    if (scene.transforms[i].type === 'sort') {
      return scene.transforms[i].config?.direction ?? 'ascending'
    }
  }
  return undefined
}

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

    const highlights = scene?.highlights ?? config.highlights.value
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
      },
      sort: resolveSortFromTransforms(scene) ?? config.sort.value,
      sortMode: config.sortMode.value !== 'none' ? config.sortMode.value : undefined,
      ...typeOpts,
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
    [containerRef, config.chartType, config.title, config.data, config.sort, config.sortMode, config.description, config.byline, config.note, config.source, config.sourceUrl, config.selectedColumn, config.highlights, config.areaFills, config.annotations, config.seriesOverrides, layoutTrigger, optionsTrigger, scenes, activeScene, theme, chartTheme],
    render,
    { immediate: true },
  )

  return { config }
}
