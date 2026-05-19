import type { ChartDefinition, ResolvedChartState } from './types'
import type { SceneNode, ColorizeNode, HighlightNode, AreaFillNode, AnnotationNode, SeriesNode } from '../dsl/types'
import { AnnotationAction } from '../enums'
import { extractChartTypeOptions, propertyMap, convertColorizes, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides } from '../dsl/converter'
import { resolveChartTypeOptions } from '../charts/resolve'

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
      fold.annotations = s.annotations
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

  const data = base.data

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

  return {
    ...base,
    chartType,
    data,
    options,
    colorizes,
    highlights,
    areaFills,
    annotations,
    seriesOverrides,
  }
}
