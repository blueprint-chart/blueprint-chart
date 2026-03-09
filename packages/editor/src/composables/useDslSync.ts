import { parse, propertyMap, extractChartTypeOptions, extractSceneOverrides, dataEntriesToString, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { useDataTransforms, type TransformType } from './useDataTransforms'
import { useDataTable } from './useDataTable'
import { parseBpcData } from './useDataParser'
import { useScenes, type SceneOverride, type AnnotationVisibility } from './useScenes'

const VALID_TRANSFORM_TYPES = new Set<TransformType>(['sort', 'filter', 'hide-columns', 'transpose', 'parse', 'group-by', 'computed', 'pivot'])

export function useDslSync() {
  const config = useChartConfig()
  const { store } = useChartTypeOptions()
  const transforms = useDataTransforms()
  const scenesComposable = useScenes()

  function applyDsl(dslString: string): { success: boolean, error?: string } {
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

      const player = propMap.get('player')
      const validPlayerTypes = ['progress-bar', 'dot-stepper', 'minimal-arrows', 'none']
      if (player && validPlayerTypes.includes(String(player))) {
        config.layout.value = { ...config.layout.value, playerType: String(player) as 'progress-bar' | 'dot-stepper' | 'minimal-arrows' | 'none' }
      }
      else {
        config.layout.value = { ...config.layout.value, playerType: 'minimal-arrows' }
      }

      const sort = propMap.get('sort')
      if (sort === 'ascending' || sort === 'descending') {
        config.sort.value = sort
      }
      else {
        config.sort.value = 'none'
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

      config.highlights.value = ast.highlights ? convertHighlights(ast.highlights) : []

      config.areaFills.value = ast.areaFills ? convertAreaFills(ast.areaFills) : []

      config.annotations.value = ast.annotations ? convertAnnotations(ast.annotations) : []

      config.seriesOverrides.value = ast.series ? convertSeriesOverrides(ast.series) : []

      if (ast.transforms?.length) {
        transforms.reset()
        for (const t of ast.transforms) {
          if (!VALID_TRANSFORM_TYPES.has(t.transformType as TransformType)) {
            continue
          }
          const props = propertyMap(t.properties)
          const stepConfig: Record<string, string> = {}
          for (const [k, v] of props) {
            stepConfig[k] = String(v)
          }

          // Last sort transform with direction drives config.sort for the chart renderer
          if (t.transformType === 'sort' && props.has('direction')) {
            const dir = String(props.get('direction'))
            if (dir === 'ascending' || dir === 'descending') {
              config.sort.value = dir
            }
          }

          transforms.addStep(t.transformType as TransformType, stepConfig)
        }
      }
      else {
        transforms.reset()
      }

      if (ast.scenes?.length) {
        const extractedScenes: SceneOverride[] = ast.scenes.map((sceneNode) => {
          const extracted = extractSceneOverrides(sceneNode, ast.chartType)
          const scene: SceneOverride = {
            id: Math.random().toString(36).slice(2, 10),
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
          if (extracted.annotationVisibility.length > 0) {
            scene.annotationVisibility = extracted.annotationVisibility.map((v): AnnotationVisibility => ({
              action: v.action,
              kind: v.kind,
              id: v.id,
            }))
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
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { applyDsl }
}
