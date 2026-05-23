import type { ChartDefinition, ResolvedChartState } from './types'
import type { FrameOptions } from '../charts/types'
import type { SceneNode, ColorizeNode, HighlightNode, AreaFillNode, AnnotationNode, SeriesNode, TransformNode } from '../dsl/types'
import { AnnotationAction, SortMode } from '../enums'
import { extractChartTypeOptions, propertyMap, dataEntriesToString, convertColorizes, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides } from '../dsl/converter'
import { resolveChartTypeOptions } from '../charts/resolve'
import { parseData } from '../charts/chart-helpers'

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
    else if (!warnedTransformTypes.has(t.transformType)) {
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
  annotations: AnnotationNode[]
  seriesOverrides: SeriesNode[]
  hiddenAnnotationIds: Set<string>
  transforms: TransformNode[]
}

function emptyFold(): SceneFold {
  return {
    properties: new Map(),
    chartTypeOptions: {},
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],
    seriesOverrides: [],
    hiddenAnnotationIds: new Set(),
    transforms: [],
  }
}

function foldScenes(scenes: SceneNode[], index: number, baseChartType: string): SceneFold {
  const fold = emptyFold()
  for (let i = 0; i <= index; i++) {
    const s = scenes[i]
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
    // highlights are scene-only: only the target scene's highlights apply
    if (i === index) {
      fold.highlights = s.highlights
    }
    if (s.areaFills.length > 0) {
      fold.areaFills = s.areaFills
    }
    if (s.annotations.length > 0) {
      // Accumulate annotations across scenes. Later scenes win on id collisions.
      const merged = [...fold.annotations]
      for (const a of s.annotations) {
        const id = propertyMap(a.properties).get('id')
        if (id != null) {
          const existingIdx = merged.findIndex((m) => {
            const mid = propertyMap(m.properties).get('id')
            return mid === id
          })
          if (existingIdx >= 0) {
            merged[existingIdx] = a
            continue
          }
        }
        merged.push(a)
      }
      fold.annotations = merged
    }
    for (const v of s.annotationVisibility) {
      if (v.action === AnnotationAction.Hide) {
        fold.hiddenAnnotationIds.add(v.id)
      }
      else {
        fold.hiddenAnnotationIds.delete(v.id)
      }
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
  return fold
}

export function resolveScene(
  def: ChartDefinition,
  sceneIndex: number | undefined,
): ResolvedChartState {
  const baseOptions = def.options ?? (def.properties
    ? resolveChartTypeOptions(def.chartType, extractChartTypeOptions(def.chartType, def.properties))
    : {})

  const base: ResolvedChartState = {
    chartType: def.chartType,
    data: def.data,
    options: baseOptions,
    frame: def.frame,
    colorizes: def.colorizes ?? [],
    highlights: def.highlights ?? [],
    areaFills: def.areaFills ?? [],
    annotations: def.annotations ?? [],
    seriesOverrides: def.seriesOverrides ?? [],
    sort: def.sort,
    sortMode: def.sortMode,
    theme: def.theme,
  }

  if (sceneIndex == null || !def.scenes || sceneIndex < 0 || sceneIndex >= def.scenes.length) {
    return base
  }

  const fold = foldScenes(def.scenes, sceneIndex, def.chartType)
  const chartType = fold.chartType ?? def.chartType

  // S1: when a scene supplies data, re-parse it via the canonical chart-helpers
  // pipeline so the resolved state reflects scene-level data overrides.
  const data = fold.data
    ? parseData(dataEntriesToString(fold.data))
    : base.data

  const options = Object.keys(fold.chartTypeOptions).length > 0
    ? resolveChartTypeOptions(chartType, { ...baseOptions, ...fold.chartTypeOptions })
    : baseOptions

  const colorizes = fold.colorizes.length > 0
    ? convertColorizes(fold.colorizes)
    : fold.data
      ? []
      : base.colorizes

  const highlights = sceneIndex != null
    ? convertHighlights(fold.highlights)
    : base.highlights

  const areaFills = fold.areaFills.length > 0
    ? convertAreaFills(fold.areaFills)
    : base.areaFills

  // S3: accumulate annotations across base + every scene up to sceneIndex.
  // `fold.annotations` is already accumulated (with id-dedup keeping the latest).
  const sceneAnnotations = fold.annotations.length > 0
    ? convertAnnotations(fold.annotations)
    : []
  const mergedAnnotations = [...base.annotations, ...sceneAnnotations]
  const annotations = fold.hiddenAnnotationIds.size > 0
    ? mergedAnnotations.filter(a => !a.id || !fold.hiddenAnnotationIds.has(a.id))
    : mergedAnnotations

  const seriesOverrides = fold.seriesOverrides.length > 0
    ? convertSeriesOverrides(fold.seriesOverrides)
    : base.seriesOverrides

  // S2/S9: apply any sort transforms accumulated from scenes onto sortMode.
  const sortMode = applyTransformsToSortMode(fold.transforms, base.sortMode, `scene ${sceneIndex}`)

  // Apply frame-relevant scene-property overrides to the base frame. The
  // whitelist matches the editor's `useChartPreview.ts` contract: only string
  // fields that are safe to vary per scene appear here. Layout/style fields
  // like `padding`, `showCredit`, `transparentBackground` are intentionally
  // excluded because they would cause layout shifts mid-transition.
  const FRAME_PROPERTY_KEYS = ['title', 'description', 'source', 'sourceUrl', 'byline', 'note'] as const
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
    annotations,
    seriesOverrides,
    sortMode,
  }
}
