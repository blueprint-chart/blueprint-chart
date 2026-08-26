import { parse, propertyMap, extractChartTypeOptions, extractSceneOverrides, dataEntriesToString, convertColorizes, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides, SortDirection, toBool } from '@blueprint-chart/lib'
import type { DslApplyResult } from '@/dsl-lang/diagnostics'
import { useChartConfig, layoutDefaults, type ChartLayout } from './useChartConfig'
import { useChartThemeStore } from './useChartTheme'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { TransformType } from '../enums'
import { useDataTransforms } from '@/stores/dataTransforms'
import { useDataTable } from './useDataTable'
import { parseBpcData } from './useDataParser'
import { useScenes, type SceneOverride } from './useScenes'

const VALID_TRANSFORM_TYPES = new Set<string>(Object.values(TransformType))

export function useDslSync() {
  const config = useChartConfig()
  const themeStore = useChartThemeStore()
  const chartTheme = storeToRefs(themeStore).chartTheme
  const { store, ensureDefaults } = useChartTypeOptions()
  const transforms = useDataTransforms()
  const scenesComposable = useScenes()

  function applyDsl(dslString: string): DslApplyResult {
    try {
      const ast = parse(dslString)

      // Bypass scene-aware refs: all writes go to base state
      scenesComposable.setActive(-1)

      config.chartType.value = ast.chartType

      const propMap = propertyMap(ast.properties)

      config.title.value = String(propMap.get('title') ?? '')
      config.description.value = String(propMap.get('description') ?? '')
      config.byline.value = String(propMap.get('byline') ?? '')
      config.source.value = String(propMap.get('source') ?? '')
      config.sourceUrl.value = String(propMap.get('sourceUrl') ?? '')

      const theme = propMap.get('theme')
      chartTheme.value = theme ? String(theme) : 'blueprint'

      // Layout properties
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

      config.layout.value = { ...layoutDefaults, ...ly }

      const sort = propMap.get('sort')
      if (sort === SortDirection.Ascending || sort === SortDirection.Descending) {
        config.sort.value = sort as SortDirection
      }
      else {
        config.sort.value = SortDirection.None
      }

      const dataStr = ast.data ? dataEntriesToString(ast.data) : ''
      config.data.value = dataStr

      // Populate data table with parsed BPC data so scene transforms can reference columns
      if (dataStr) {
        const dataTable = useDataTable()
        const parsed = parseBpcData(dataStr)
        dataTable.loadParsed(parsed)
        dataTable.rawInput.value = dataStr
        dataTable.sourceFormat.value = 'bpc'
      }

      store[ast.chartType] = extractChartTypeOptions(ast.chartType, ast.properties) as Partial<ChartTypeOptions>
      // Populate any defaults not present in the DSL so that baseOptions/currentOptions
      // computeds remain pure readers — no side-effects inside a computed getter.
      ensureDefaults(ast.chartType)

      config.colorizes.value = ast.colorizes ? convertColorizes(ast.colorizes) : []

      config.highlights.value = ast.highlights ? convertHighlights(ast.highlights) : []

      config.areaFills.value = ast.areaFills ? convertAreaFills(ast.areaFills) : []

      config.annotations.value = ast.annotations ? convertAnnotations(ast.annotations) : []

      config.seriesOverrides.value = ast.series ? convertSeriesOverrides(ast.series) : []

      if (ast.transforms?.length) {
        transforms.reset()
        for (const t of ast.transforms) {
          if (!VALID_TRANSFORM_TYPES.has(t.transformType)) {
            continue
          }
          const stepConfig: Record<string, string> = {}
          for (const [k, v] of propertyMap(t.properties)) {
            stepConfig[k] = String(v)
          }

          transforms.addStep(t.transformType as TransformType, stepConfig)
        }
      }
      else {
        transforms.reset()
      }

      if (ast.scenes?.length) {
        // Reuse existing scene ids by position so re-parsing the same DSL keeps
        // stable identities (a random id per parse churned references on every
        // keystroke). New scenes fall back to a deterministic positional id.
        const prevSceneIds = scenesComposable.scenes.value.map(s => s.id)
        const extractedScenes: SceneOverride[] = ast.scenes.map((sceneNode, sceneIndex) => {
          const extracted = extractSceneOverrides(sceneNode, ast.chartType)
          const scene: SceneOverride = {
            id: prevSceneIds[sceneIndex] ?? `scene-${sceneIndex}`,
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
        })
        scenesComposable.hydrate({ scenes: extractedScenes, activeIndex: -1 })
      }
      else {
        scenesComposable.reset()
      }

      return { success: true }
    }
    catch (err) {
      const loc = (err && typeof err === 'object' && 'location' in err)
        ? (err as { location?: { start?: { line: number, column: number } } }).location?.start
        : undefined
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        location: loc ? { line: loc.line, column: loc.column } : undefined,
      }
    }
  }

  return { applyDsl }
}
