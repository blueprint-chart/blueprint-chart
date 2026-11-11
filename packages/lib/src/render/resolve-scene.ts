import type { ChartDefinition, ResolvedChartState } from './types'
import type { ChartTypeOptions, FrameOptions, AnnotationConfig, OverlayConfig } from '../charts/types'
import type { SceneNode, ColorizeNode, HighlightNode, AreaFillNode, SeriesNode, TransformNode } from '../dsl/types'
import { LabelPosition, SortMode } from '../enums'
import { extractChartTypeOptions, propertyMap, dataEntriesToString, convertColorizes, convertHighlights, convertAreaFills, convertOverlays, convertAnnotations, convertSeriesOverrides } from '../dsl/converter'
import { getChartTypeDefaults, resolveChartTypeOptions } from '../charts/resolve'
import { parseData } from '../charts/chart-helpers'
import { applyTransformNodesToChartData, TRANSFORM_TYPES } from '../transforms'

// A scene that changes chart type keeps every inherited option except the two
// label positions, whose registry defaults encode whether values are drawn on
// the mark or on the axis (registry.ts:326 and :339, both keyed off
// `valueAxisLabelsOff`). Without this a `bar-vertical` base freezes
// `verticalLabelPosition = off` onto a `line` scene and the y axis loses every
// tick label. An explicit value, on the base or on the scene, still wins.
//
// The rule is reveal-only: a scene type defaulting to `off` never hides labels
// the base shows. Hiding them would need the scene's `valueLabels` default too,
// which stays inherited, so the scene would end up with no numbers at all.
const LABEL_POSITION_KEYS = ['verticalLabelPosition', 'horizontalLabelPosition'] as const

function applySceneLabelPositions(
  options: Partial<ChartTypeOptions>,
  chartType: string,
  explicit: Record<string, unknown>,
): Partial<ChartTypeOptions> {
  const defaults = getChartTypeDefaults(chartType) as Record<string, unknown>
  const result = { ...options } as Record<string, unknown>
  for (const key of LABEL_POSITION_KEYS) {
    if (explicit[key] === undefined && defaults[key] !== undefined && defaults[key] !== LabelPosition.Off) {
      result[key] = defaults[key]
    }
  }
  return result as Partial<ChartTypeOptions>
}

const warnedTransformTypes = new Set<string>()

function applyTransformsToSortMode(
  transforms: TransformNode[],
  current: SortMode | undefined,
  context: string,
): SortMode | undefined {
  let result = current
  for (const t of transforms) {
    if (t.transformType === 'sort') {
      // Both ascending and descending map onto SortMode.Total because the
      // underlying chart types only support total/within-groups/none.
      result = SortMode.Total
    }
    else if (!TRANSFORM_TYPES.has(t.transformType) && !warnedTransformTypes.has(t.transformType)) {
      warnedTransformTypes.add(t.transformType)
      console.warn(`[blueprint-chart] Unknown transform "${t.transformType}" in ${context}; ignored.`)
    }
  }
  return result
}

/** @internal — exposed for tests that need to reset the warn-once cache. */
export function __resetTransformWarnings(): void {
  warnedTransformTypes.clear()
}

interface SceneFold {
  chartType?: string
  data?: SceneNode['data']
  properties: Map<string, string | number | boolean>
  chartTypeOptions: Record<string, unknown>
  colorizes: ColorizeNode[]
  highlights: HighlightNode[]
  areaFills: AreaFillNode[]
  seriesOverrides: SeriesNode[]
  transforms: TransformNode[]
}

function emptyFold(): SceneFold {
  return {
    properties: new Map(),
    chartTypeOptions: {},
    colorizes: [],
    highlights: [],
    areaFills: [],
    seriesOverrides: [],
    transforms: [],
  }
}

function foldScene(fold: SceneFold, s: SceneNode, baseChartType: string): void {
  const sProps = propertyMap(s.properties)
  const typeOverride = sProps.get('type') as string | undefined
  if (typeOverride) {
    fold.chartType = typeOverride
  }
  const effectiveType = fold.chartType ?? baseChartType
  if (s.data) {
    fold.data = s.data
  }
  const sceneTypeOpts = extractChartTypeOptions(effectiveType, s.properties)
  fold.chartTypeOptions = { ...fold.chartTypeOptions, ...sceneTypeOpts }
  if (s.colorizes.length > 0) {
    fold.colorizes = s.colorizes
  }
  else if (s.data) {
    fold.colorizes = []
  }
  // highlights are scene-only: the last folded scene is the target one
  fold.highlights = s.highlights
  if (s.areaFills.length > 0) {
    fold.areaFills = s.areaFills
  }
  if (s.series.length > 0) {
    fold.seriesOverrides = s.series
  }
  if (s.transforms.length > 0) {
    fold.transforms = [...fold.transforms, ...s.transforms]
  }
  for (const [k, v] of sProps) {
    fold.properties.set(k, v)
  }
}

// `repeat` is the number of EXTRA frames an annotation or overlay carries into
// beyond its own (undefined/absent → 0 → shows once). So it is visible across
// [anchor, anchor + extra] inclusive.
function repeatVisible(anchor: number, repeat: number | 'always' | undefined, index: number): boolean {
  if (index < anchor) {
    return false
  }
  if (repeat === 'always') {
    return true
  }
  const extra = typeof repeat === 'number' ? repeat : 0
  return index <= anchor + extra
}

interface Anchored<T> {
  anchor: number
  config: T
}

interface AnchoredItems {
  annotations: Anchored<AnnotationConfig>[]
  overlays: Anchored<OverlayConfig>[]
}

// Top-level annotations and overlays belong to the base chart, the first frame
// before scene 0, so they anchor at -1: with no repeat they show only on the
// base render (sceneIndex == null), `repeat = N` carries them into the first N
// scenes, and `always` shows them in every scene. Scene items anchor at their
// own scene index.
function anchorItems(def: ChartDefinition, scenes: SceneNode[]): AnchoredItems {
  const annotations: Anchored<AnnotationConfig>[] = (def.annotations ?? []).map((config, i) => ({
    anchor: -1,
    config: { ...config, key: config.key ?? `base:${i}:${config.kind}` },
  }))
  const overlays: Anchored<OverlayConfig>[] = (def.overlays ?? []).map(config => ({ anchor: -1, config }))
  scenes.forEach((scene, j) => {
    convertAnnotations(scene.annotations).forEach((config, i) => {
      annotations.push({ anchor: j, config: { ...config, key: config.key ?? `s${j}:${i}:${config.kind}` } })
    })
    for (const config of convertOverlays(scene.overlays)) {
      overlays.push({ anchor: j, config })
    }
  })
  return { annotations, overlays }
}

function visibleAt<T extends { repeat?: number | 'always' }>(items: Anchored<T>[], index: number): T[] {
  const visible = items.filter(({ anchor, config }) => repeatVisible(anchor, config.repeat, index))
  return visible.map(({ config }) => config)
}

function resolveBase(def: ChartDefinition): ResolvedChartState {
  const baseOptions = def.options ?? (def.properties
    ? resolveChartTypeOptions(def.chartType, extractChartTypeOptions(def.chartType, def.properties))
    : {})

  return {
    chartType: def.chartType,
    data: def.data,
    options: baseOptions,
    frame: def.frame,
    colorizes: def.colorizes ?? [],
    highlights: def.highlights ?? [],
    areaFills: def.areaFills ?? [],
    overlays: def.overlays ?? [],
    annotations: (def.annotations ?? []).map((config, i) => ({
      ...config,
      key: config.key ?? `base:${i}:${config.kind}`,
    })),
    seriesOverrides: def.seriesOverrides ?? [],
    sort: def.sort,
    sortMode: def.sortMode,
    theme: def.theme,
  }
}

export function resolveScene(
  def: ChartDefinition,
  sceneIndex: number | undefined,
): ResolvedChartState {
  const base = resolveBase(def)
  if (sceneIndex == null || !def.scenes || sceneIndex < 0 || sceneIndex >= def.scenes.length) {
    return base
  }
  const scenes = def.scenes.slice(0, sceneIndex + 1)
  const fold = emptyFold()
  for (const scene of scenes) {
    foldScene(fold, scene, def.chartType)
  }
  return resolveFolded(def, base, fold, anchorItems(def, scenes), sceneIndex)
}

/**
 * Resolve every scene of `def` in one pass, folding each scene once. Same
 * result as calling `resolveScene(def, i)` for each index.
 */
export function resolveScenes(def: ChartDefinition): ResolvedChartState[] {
  const scenes = def.scenes ?? []
  const base = resolveBase(def)
  const anchored = anchorItems(def, scenes)
  const fold = emptyFold()
  return scenes.map((scene, i) => {
    foldScene(fold, scene, def.chartType)
    return resolveFolded(def, base, fold, anchored, i)
  })
}

function resolveFolded(
  def: ChartDefinition,
  base: ResolvedChartState,
  fold: SceneFold,
  anchored: AnchoredItems,
  sceneIndex: number,
): ResolvedChartState {
  const baseOptions = base.options
  const chartType = fold.chartType ?? def.chartType

  // S1: when a scene supplies data, re-parse it via the canonical chart-helpers
  // pipeline so the resolved state reflects scene-level data overrides. Its own
  // transforms then run on top of the base pipeline's output, and a scene that
  // replaces the data wholesale keeps it as given: both match the editor's
  // resolution order in useChartPreview.ts.
  const data = fold.data
    ? parseData(dataEntriesToString(fold.data))
    : applyTransformNodesToChartData(base.data, fold.transforms)

  const inherited = Object.keys(fold.chartTypeOptions).length > 0
    ? resolveChartTypeOptions(chartType, { ...baseOptions, ...fold.chartTypeOptions })
    : baseOptions

  // `def.options` callers pre-resolve their options, so an explicit value cannot
  // be told apart from a default there and the label positions are left alone.
  const options = chartType !== def.chartType && !def.options && def.properties
    ? applySceneLabelPositions(inherited, chartType, {
        ...extractChartTypeOptions(chartType, def.properties),
        ...fold.chartTypeOptions,
      })
    : inherited

  const colorizes = fold.colorizes.length > 0
    ? convertColorizes(fold.colorizes)
    : fold.data
      ? []
      : base.colorizes

  const highlights = convertHighlights(fold.highlights)

  const areaFills = fold.areaFills.length > 0
    ? convertAreaFills(fold.areaFills)
    : base.areaFills
  const overlays = visibleAt(anchored.overlays, sceneIndex)
  const annotations = visibleAt(anchored.annotations, sceneIndex)

  const seriesOverrides = fold.seriesOverrides.length > 0
    ? convertSeriesOverrides(fold.seriesOverrides)
    : base.seriesOverrides

  // S2/S9: a scene's own `sortMode` overrides the base one, then any sort
  // transforms accumulated from scenes override both.
  const foldedSortMode = fold.properties.get('sortMode')
  const sceneSortMode = Object.values(SortMode).includes(foldedSortMode as SortMode)
    ? foldedSortMode as SortMode
    : undefined
  const sortMode = applyTransformsToSortMode(fold.transforms, sceneSortMode ?? base.sortMode, `scene ${sceneIndex}`)

  // Apply frame-relevant scene-property overrides to the base frame. The
  // whitelist matches the editor's `useChartPreview.ts` contract: only string
  // fields that are safe to vary per scene appear here. Layout/style fields
  // like `padding`, `showCredit`, `transparentBackground` are intentionally
  // excluded because they would cause layout shifts mid-transition.
  const FRAME_PROPERTY_KEYS = ['title', 'description', 'altText', 'source', 'sourceUrl', 'byline', 'note'] as const
  const frameOverrides: Partial<FrameOptions> = {}
  for (const k of FRAME_PROPERTY_KEYS) {
    const v = fold.properties.get(k)
    if (typeof v === 'string') {
      frameOverrides[k] = v
    }
  }
  const frame = Object.keys(frameOverrides).length > 0
    ? { ...base.frame, ...frameOverrides }
    : base.frame

  return {
    ...base,
    chartType,
    data,
    options,
    frame,
    colorizes,
    highlights,
    areaFills,
    overlays,
    annotations,
    seriesOverrides,
    sortMode,
  }
}
