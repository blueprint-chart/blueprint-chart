import { ref, watch, isRef, type Ref, type ComputedRef } from 'vue'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { useTheme } from './useTheme'
import {
  parse,
  parseData,
  buildChartOptions,
  getChart,
  resolveBackgroundColor,
  propertyMap,
  extractChartTypeOptions,
  extractSceneOverrides,
  dataEntriesToString,
  convertHighlights,
  convertAreaFills,
  convertAnnotations,
  convertSeriesOverrides,
} from '@blueprint-chart/lib'

const RESIZE_THROTTLE_MS = 150

export interface DslRenderOptions {
  /** Hide frame header/footer for thumbnail-style rendering */
  thumbnail?: boolean
  /** Strip colors/colorPalette so the default theme palette is used */
  stripColors?: boolean
  /** Default frame padding (e.g. '1rem') when not specified in BPC */
  padding?: string
  /** When set, render the scene at this index (0-based) instead of the base chart */
  sceneIndex?: number
}

/**
 * Return the number of scenes in a BPC string.
 */
export function parseDslSceneCount(bpc: string): number {
  if (!bpc) {
    return 0
  }
  return parse(bpc).scenes.length
}

/**
 * Parse a BPC DSL string and render the chart into a container element.
 * Pure function — no Vue reactivity, only DOM mutation on the container.
 */
export function renderDsl(
  container: HTMLElement,
  bpc: string,
  options?: DslRenderOptions,
): void {
  container.replaceChildren()

  if (!bpc) {
    return
  }

  const ast = parse(bpc)

  if (options?.stripColors) {
    ast.properties = ast.properties.filter(p => p.key !== 'colors' && p.key !== 'colorPalette')
  }

  const pMap = propertyMap(ast.properties)

  // Apply aspect ratio from BPC property
  const ratio = pMap.get('aspectRatio')
  if (ratio) {
    const parts = String(ratio).split(':').map(Number)
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      container.style.aspectRatio = `${parts[0]} / ${parts[1]}`
      container.style.height = 'auto'
    }
  }

  // Resolve scene overrides when a scene index is specified
  const sceneIdx = options?.sceneIndex
  let scene: ReturnType<typeof extractSceneOverrides> | null = null
  if (sceneIdx != null && sceneIdx >= 0 && sceneIdx < ast.scenes.length) {
    scene = extractSceneOverrides(ast.scenes[sceneIdx], ast.chartType)
  }

  const chartType = scene?.chartType ?? ast.chartType

  const dataStr = scene?.data
    ? dataEntriesToString(scene.data)
    : ast.data ? dataEntriesToString(ast.data) : ''
  const data = parseData(dataStr)
  if (data.labels.length === 0) {
    return
  }

  const renderer = getChart(chartType)
  if (!renderer) {
    return
  }

  const mergedTypeOpts = scene?.chartTypeOptions
    ? { ...extractChartTypeOptions(chartType, ast.properties), ...scene.chartTypeOptions }
    : extractChartTypeOptions(chartType, ast.properties)
  const bg = resolveBackgroundColor(container)
  const chartOpts = buildChartOptions(mergedTypeOpts, bg)

  const highlights = scene?.highlights?.length
    ? convertHighlights(scene.highlights)
    : convertHighlights(ast.highlights)
  const areaFills = scene?.areaFills?.length
    ? convertAreaFills(scene.areaFills)
    : convertAreaFills(ast.areaFills)
  const annotations = scene?.annotations?.length
    ? convertAnnotations(scene.annotations)
    : convertAnnotations(ast.annotations)
  const seriesOverrides = scene?.seriesOverrides?.length
    ? convertSeriesOverrides(scene.series)
    : convertSeriesOverrides(ast.series)

  const sPMap = scene?.properties
  const sortVal = sPMap?.get('sort') ?? pMap.get('sort')
  const sortStr = sortVal ? String(sortVal) : undefined
  const sort = sortStr === 'ascending' || sortStr === 'descending' ? sortStr : undefined

  const getString = (key: string) => String(sPMap?.get(key) ?? pMap.get(key) ?? '') || undefined

  const frame = options?.thumbnail
    ? undefined
    : {
        title: getString('title'),
        description: getString('description'),
        source: getString('source'),
        sourceUrl: getString('sourceUrl'),
        byline: getString('byline'),
        note: getString('note'),
        padding: String(pMap.get('padding') ?? '') || options?.padding || undefined,
      }

  renderer(container, data, {
    frame,
    sort,
    ...chartOpts,
    highlights: highlights.length > 0 ? highlights : undefined,
    areaFills: areaFills.length > 0 ? areaFills : undefined,
    annotations: annotations.length > 0 ? annotations : undefined,
    seriesOverrides: seriesOverrides.length > 0 ? seriesOverrides : undefined,
  })
}

/**
 * Reactive composable: render a BPC DSL string into a container.
 *
 * Reactive mode — re-renders when dsl or container changes:
 *   useChartFromDsl(containerRef, dslRef, options?)
 *
 * Imperative mode — returns applyDsl for manual control:
 *   const { applyDsl } = useChartFromDsl(containerRef, options?)
 */
export function useChartFromDsl(
  containerRef: Ref<HTMLElement | null>,
  dslOrOptions?: Ref<string> | ComputedRef<string> | DslRenderOptions,
  maybeOptions?: DslRenderOptions,
): { applyDsl: (bpc: string) => void } {
  const isReactive = isRef(dslOrOptions)
  const dslRef = isReactive ? dslOrOptions as Ref<string> : ref('')
  const options = isReactive ? maybeOptions : dslOrOptions as DslRenderOptions | undefined

  const { theme } = useTheme()

  function render() {
    if (!containerRef.value || !dslRef.value) {
      return
    }
    renderDsl(containerRef.value, dslRef.value, options)
  }

  const throttledRender = useThrottleFn(render, RESIZE_THROTTLE_MS)

  watch([containerRef, dslRef, theme], render, { immediate: true })
  useResizeObserver(containerRef, throttledRender)

  function applyDsl(bpc: string) {
    dslRef.value = bpc
  }

  return { applyDsl }
}
