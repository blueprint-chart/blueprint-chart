import { parse, propertyMap, readPlaybackSettings, extractChartTypeOptions, extractSceneOverrides, dataEntriesToString, convertColorizes, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides, SortDirection, toBool, TRANSFORM_TYPES } from '@blueprint-chart/lib'
import type { AnnotationConfig, AreaFillConfig, HighlightConfig, SeriesOverride } from '@blueprint-chart/lib'
import { layoutDefaults, type ChartColorize, type ChartLayout } from '@/composables/useChartConfig'
import type { ChartTypeOptions } from '@/composables/useChartTypeOptions'
import type { SceneOverride } from '@/composables/useScenes'
import { TransformType } from '@/enums'
import type { ChartConfig } from '@/stores/chartConfig'

type Properties = ReturnType<typeof propertyMap>

// The pipeline's own set, so a step the renderer executes is never dropped here.
const VALID_TRANSFORM_TYPES = TRANSFORM_TYPES

export interface ChartState {
  chartType: string
  title: string
  description: string
  altText: string
  byline: string
  note: string
  source: string
  sourceUrl: string
  chartTheme: string
  layout: ChartLayout
  sort: SortDirection
  data: string
  optionOverrides: Partial<ChartTypeOptions>
  colorizes: ChartColorize[]
  highlights: HighlightConfig[]
  areaFills: AreaFillConfig[]
  annotations: AnnotationConfig[]
  seriesOverrides: SeriesOverride[]
  transforms: { type: TransformType, config: Record<string, string> }[]
  scenes: SceneOverride[]
}

function parseLayout(propMap: Properties): ChartLayout {
  const ly: Partial<ChartLayout> = {}

  const sizing = propMap.get('sizing')
  const validSizing = ['responsive', 'fixed', 'max-width'] as const
  if (sizing && validSizing.includes(String(sizing) as typeof validSizing[number])) {
    ly.sizing = String(sizing) as ChartLayout['sizing']
  }

  const fixedWidth = propMap.get('fixedWidth')
  if (fixedWidth !== undefined) {
    ly.fixedWidth = Number(fixedWidth)
  }

  const maxWidth = propMap.get('maxWidth')
  if (maxWidth !== undefined) {
    ly.maxWidth = Number(maxWidth)
  }

  const heightMode = propMap.get('heightMode')
  const validHeightModes = ['auto', 'fixed', 'aspect-ratio'] as const
  if (heightMode && validHeightModes.includes(String(heightMode) as typeof validHeightModes[number])) {
    ly.heightMode = String(heightMode) as ChartLayout['heightMode']
  }

  const fixedHeight = propMap.get('fixedHeight')
  if (fixedHeight !== undefined) {
    ly.fixedHeight = Number(fixedHeight)
  }

  const aspectRatio = propMap.get('aspectRatio')
  if (aspectRatio !== undefined) {
    ly.aspectRatio = String(aspectRatio)
  }

  const padding = propMap.get('padding')
  if (padding !== undefined) {
    // A bare number stays a px count for the numeric control; anything with
    // a unit or several values is kept verbatim, since coercing it to a
    // number turns `24px 32px` into NaN and drops the padding entirely.
    const asNumber = Number(padding)
    ly.padding = Number.isFinite(asNumber) ? asNumber : String(padding)
  }

  const transparentBg = propMap.get('transparentBackground')
  if (transparentBg !== undefined) {
    ly.transparentBackground = toBool(transparentBg)
  }

  const getTheData = propMap.get('getTheData')
  if (getTheData !== undefined) {
    ly.getTheData = toBool(getTheData)
  }

  const player = propMap.get('player')
  const validPlayerTypes = ['buttons', 'progress-bar', 'dot-stepper', 'minimal-arrows', 'none']
  if (player && validPlayerTypes.includes(String(player))) {
    ly.playerType = String(player) as ChartLayout['playerType']
  }

  const playerPos = propMap.get('playerPosition')
  const validPositions = ['left', 'center', 'right'] as const
  if (playerPos && validPositions.includes(String(playerPos) as typeof validPositions[number])) {
    ly.playerPosition = String(playerPos) as ChartLayout['playerPosition']
  }

  const playback = readPlaybackSettings(propMap)
  ly.autoplay = playback.autoplay
  ly.sceneDuration = playback.sceneDuration
  ly.loop = playback.loop

  return { ...layoutDefaults, ...ly }
}

function parseScene(sceneNode: Parameters<typeof extractSceneOverrides>[0], chartType: string, index: number): SceneOverride {
  const extracted = extractSceneOverrides(sceneNode, chartType)
  const scene: SceneOverride = {
    id: `scene-${index}`,
    name: extracted.name,
  }
  if (extracted.chartType) {
    scene.chartType = extracted.chartType
  }
  if (extracted.data) {
    scene.data = dataEntriesToString(extracted.data)
  }
  if (Object.keys(extracted.chartTypeOptions).length > 0) {
    scene.chartTypeOptions = extracted.chartTypeOptions as Partial<ChartTypeOptions>
  }
  if (extracted.colorizes.length > 0) {
    scene.colorizes = convertColorizes(extracted.colorizes)
  }
  if (extracted.highlights.length > 0) {
    scene.highlights = convertHighlights(extracted.highlights)
  }
  if (extracted.areaFills.length > 0) {
    scene.areaFills = convertAreaFills(extracted.areaFills)
  }
  if (extracted.annotations.length > 0) {
    scene.annotations = convertAnnotations(extracted.annotations)
  }
  if (extracted.series.length > 0) {
    scene.seriesOverrides = convertSeriesOverrides(extracted.series)
  }
  if (extracted.transforms.length > 0) {
    scene.transforms = extracted.transforms.map((t, i) => ({
      id: String(i),
      type: t.transformType as TransformType,
      config: Object.fromEntries(
        t.properties.map(p => [p.key, String(p.value)]),
      ),
    }))
  }
  // Map scene-level properties (title, description, source, etc.)
  const sceneProps = Object.fromEntries(
    [...extracted.properties.entries()].filter(
      ([k]) => !['type'].includes(k),
    ),
  ) as Record<string, string | number>
  if (Object.keys(sceneProps).length > 0) {
    scene.properties = sceneProps
  }
  return scene
}

/** Stored charts are DSL, or a pre-DSL `{ "chartConfig": ... }` JSON payload. */
export function parseStoredChartState(raw: string): ChartState {
  if (!raw.trimStart().startsWith('{')) {
    return parseChartState(raw)
  }
  const { chartConfig } = JSON.parse(raw) as { chartConfig: Partial<ChartConfig> }
  return {
    ...parseChartState(`chart ${chartConfig.chartType} {}`),
    ...chartConfig,
    layout: { ...layoutDefaults, ...chartConfig.layout },
  } as ChartState
}

export function parseChartState(dsl: string): ChartState {
  const ast = parse(dsl)
  const propMap = propertyMap(ast.properties)
  const theme = propMap.get('theme')
  const sort = propMap.get('sort')

  const transforms: ChartState['transforms'] = []
  for (const t of ast.transforms ?? []) {
    if (!VALID_TRANSFORM_TYPES.has(t.transformType)) {
      continue
    }
    const config: Record<string, string> = {}
    for (const [k, v] of propertyMap(t.properties)) {
      config[k] = String(v)
    }
    transforms.push({ type: t.transformType as TransformType, config })
  }

  return {
    chartType: ast.chartType,
    title: String(propMap.get('title') ?? ''),
    description: String(propMap.get('description') ?? ''),
    altText: String(propMap.get('altText') ?? ''),
    byline: String(propMap.get('byline') ?? ''),
    note: String(propMap.get('note') ?? ''),
    source: String(propMap.get('source') ?? ''),
    sourceUrl: String(propMap.get('sourceUrl') ?? ''),
    chartTheme: theme ? String(theme) : 'blueprint',
    layout: parseLayout(propMap),
    sort: sort === SortDirection.Ascending || sort === SortDirection.Descending ? sort as SortDirection : SortDirection.None,
    data: ast.data ? dataEntriesToString(ast.data) : '',
    optionOverrides: extractChartTypeOptions(ast.chartType, ast.properties) as Partial<ChartTypeOptions>,
    colorizes: ast.colorizes ? convertColorizes(ast.colorizes) : [],
    highlights: ast.highlights ? convertHighlights(ast.highlights) : [],
    areaFills: ast.areaFills ? convertAreaFills(ast.areaFills) : [],
    annotations: ast.annotations ? convertAnnotations(ast.annotations) : [],
    seriesOverrides: ast.series ? convertSeriesOverrides(ast.series) : [],
    transforms,
    scenes: (ast.scenes ?? []).map((node, i) => parseScene(node, ast.chartType, i)),
  }
}
