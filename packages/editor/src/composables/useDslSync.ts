import { parse, propertyMap, extractChartTypeOptions, extractSceneOverrides, dataEntriesToString } from '@blueprint-chart/lib'
import type { PropertyNode, SeriesOverride, AnnotationConfig, PointAnnotationConfig, RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { useDataTransforms, type TransformType } from './useDataTransforms'
import { useScenes, type SceneOverride, type AnnotationVisibility } from './useScenes'

function readPosition(properties: PropertyNode[], key: string): number | string | undefined {
  const node = properties.find(p => p.key === key)
  if (!node) {
    return undefined
  }
  // Bare number (with or without %) = percentage
  if (node.isPercentage) {
    return node.value as number
  }
  if (typeof node.value === 'string') { // e.g. "150px"
    return node.value
  }
  return node.value // bare number = %
}

function readMaxWidth(properties: PropertyNode[]): number | string | undefined {
  const node = properties.find(p => p.key === 'maxWidth')
  if (!node) {
    return undefined
  }
  if (node.isPercentage) {
    return `${
      node.value}%`
  }
  if (typeof node.value === 'string') {
    return node.value
  }
  return node.value
}

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

      const sort = propMap.get('sort')
      if (sort === 'ascending' || sort === 'descending') {
        config.sort.value = sort
      }
      else {
        config.sort.value = 'none'
      }

      config.data.value = ast.data ? dataEntriesToString(ast.data) : ''

      store[ast.chartType] = extractChartTypeOptions(ast.chartType, ast.properties) as Partial<ChartTypeOptions>

      if (ast.highlights) {
        config.highlights.value = ast.highlights.map((h) => {
          const hProps = propertyMap(h.properties)
          return {
            target: h.target,
            color: String(hProps.get('color') ?? ''),
            label: String(hProps.get('label') ?? ''),
          }
        })
      }
      else {
        config.highlights.value = []
      }

      if (ast.areaFills) {
        config.areaFills.value = ast.areaFills.map((af) => {
          const afProps = propertyMap(af.properties)
          return {
            from: af.from,
            to: af.to,
            color: afProps.has('color') ? String(afProps.get('color')) : undefined,
            negativeColor: afProps.has('negativeColor') ? String(afProps.get('negativeColor')) : undefined,
            opacity: afProps.has('opacity') ? Number(afProps.get('opacity')) : undefined,
            interpolation: afProps.has('interpolation') ? String(afProps.get('interpolation')) : undefined,
          }
        })
      }
      else {
        config.areaFills.value = []
      }

      if (ast.annotations) {
        const toBool = (v: unknown) => v === 'true' || v === true
        config.annotations.value = ast.annotations.map((a): AnnotationConfig => {
          const aProps = propertyMap(a.properties)
          const kind = a.kind ?? 'point'

          if (kind === 'range') {
            const result: RangeAnnotationConfig = {
              kind: 'range',
              start: aProps.has('start') ? (isNaN(Number(aProps.get('start'))) ? String(aProps.get('start')) : Number(aProps.get('start'))) : 0,
              end: aProps.has('end') ? (isNaN(Number(aProps.get('end'))) ? String(aProps.get('end')) : Number(aProps.get('end'))) : 0,
            }
            if (aProps.has('id')) {
              result.id = String(aProps.get('id'))
            }
            if (aProps.has('orientation')) {
              result.orientation = String(aProps.get('orientation')) as 'vertical' | 'horizontal'
            }
            if (aProps.has('startAnchor')) {
              result.startAnchor = String(aProps.get('startAnchor')) as 'start' | 'center' | 'end'
            }
            if (aProps.has('endAnchor')) {
              result.endAnchor = String(aProps.get('endAnchor')) as 'start' | 'center' | 'end'
            }
            if (aProps.has('bgColor')) {
              result.bgColor = String(aProps.get('bgColor'))
            }
            if (aProps.has('bgOpacity')) {
              result.bgOpacity = Number(aProps.get('bgOpacity'))
            }
            if (aProps.has('direction')) {
              result.direction = String(aProps.get('direction')) as RangeAnnotationConfig['direction']
            }
            if (aProps.has('text')) {
              result.text = String(aProps.get('text'))
            }
            if (aProps.has('textColor')) {
              result.textColor = String(aProps.get('textColor'))
            }
            return result
          }

          if (kind === 'free') {
            const result: FreeAnnotationConfig = {
              kind: 'free',
              text: String(aProps.get('text') ?? ''),
              x: readPosition(a.properties, 'x') ?? 0,
              y: readPosition(a.properties, 'y') ?? 0,
            }
            if (aProps.has('id')) {
              result.id = String(aProps.get('id'))
            }
            if (aProps.has('textColor')) {
              result.textColor = String(aProps.get('textColor'))
            }
            const freeMaxW = readMaxWidth(a.properties)
            if (freeMaxW !== undefined) {
              result.maxWidth = freeMaxW
            }
            if (aProps.has('textOutline')) {
              result.textOutline = toBool(aProps.get('textOutline'))
            }
            return result
          }

          // kind === 'point' (default, also handles legacy)
          const target = 'target' in a ? a.target : ''
          const result: PointAnnotationConfig = {
            kind: 'point',
            target,
            text: String(aProps.get('text') ?? ''),
          }
          if (aProps.has('id')) {
            result.id = String(aProps.get('id'))
          }
          if (aProps.has('textColor')) {
            result.textColor = String(aProps.get('textColor'))
          }
          const pointMaxW = readMaxWidth(a.properties)
          if (pointMaxW !== undefined) {
            result.maxWidth = pointMaxW
          }
          if (aProps.has('textOutline')) {
            result.textOutline = toBool(aProps.get('textOutline'))
          }
          if (aProps.has('showLine')) {
            result.showLine = toBool(aProps.get('showLine'))
          }
          if (aProps.has('anchorDirection')) {
            result.anchorDirection = String(aProps.get('anchorDirection')) as PointAnnotationConfig['anchorDirection']
          }
          if (aProps.has('textOffsetX')) {
            result.textOffsetX = Number(aProps.get('textOffsetX'))
          }
          if (aProps.has('textOffsetY')) {
            result.textOffsetY = Number(aProps.get('textOffsetY'))
          }
          if (aProps.has('lineStyle')) {
            result.lineStyle = String(aProps.get('lineStyle')) as PointAnnotationConfig['lineStyle']
          }
          if (aProps.has('lineWeight')) {
            result.lineWeight = Number(aProps.get('lineWeight'))
          }
          if (aProps.has('showArrow')) {
            result.showArrow = toBool(aProps.get('showArrow'))
          }
          if (aProps.has('lineTargetDistance')) {
            result.lineTargetDistance = Number(aProps.get('lineTargetDistance'))
          }
          if (aProps.has('showCircle')) {
            result.showCircle = toBool(aProps.get('showCircle'))
          }
          if (aProps.has('circleSize')) {
            result.circleSize = Number(aProps.get('circleSize'))
          }
          if (aProps.has('circleStyle')) {
            result.circleStyle = String(aProps.get('circleStyle')) as PointAnnotationConfig['circleStyle']
          }
          if (aProps.has('circleColor')) {
            result.circleColor = String(aProps.get('circleColor'))
          }
          return result
        })
      }
      else {
        config.annotations.value = []
      }

      if (ast.series) {
        config.seriesOverrides.value = ast.series.map((s) => {
          const sProps = propertyMap(s.properties)
          const override: SeriesOverride = { name: s.name }
          if (sProps.has('color')) {
            override.color = String(sProps.get('color'))
          }
          if (sProps.has('lineWidth')) {
            override.lineWidth = Number(sProps.get('lineWidth'))
          }
          if (sProps.has('dash')) {
            override.dash = String(sProps.get('dash'))
          }
          if (sProps.has('interpolation')) {
            override.interpolation = String(sProps.get('interpolation'))
          }
          if (sProps.has('labelMode')) {
            override.labelMode = String(sProps.get('labelMode'))
          }
          if (sProps.has('labelText')) {
            override.labelText = String(sProps.get('labelText'))
          }
          if (sProps.has('valueLabels')) {
            override.valueLabels = sProps.get('valueLabels') === 'true' || sProps.get('valueLabels') === true
          }
          if (sProps.has('lineSymbols')) {
            override.lineSymbols = sProps.get('lineSymbols') === 'true' || sProps.get('lineSymbols') === true
          }
          if (sProps.has('hidden')) {
            override.hidden = sProps.get('hidden') === 'true' || sProps.get('hidden') === true
          }
          if (sProps.has('symbolShape')) {
            override.symbolShape = String(sProps.get('symbolShape'))
          }
          if (sProps.has('symbolShowOn')) {
            override.symbolShowOn = String(sProps.get('symbolShowOn'))
          }
          if (sProps.has('symbolStyle')) {
            override.symbolStyle = String(sProps.get('symbolStyle'))
          }
          if (sProps.has('symbolSize')) {
            override.symbolSize = Number(sProps.get('symbolSize'))
          }
          if (sProps.has('symbolOpacity')) {
            override.symbolOpacity = Number(sProps.get('symbolOpacity'))
          }
          return override
        })
      }
      else {
        config.seriesOverrides.value = []
      }

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
            scene.highlights = extracted.highlights.map((h) => {
              const hProps = propertyMap(h.properties)
              return {
                target: h.target,
                color: String(hProps.get('color') ?? ''),
                label: String(hProps.get('label') ?? ''),
              }
            })
          }
          if (extracted.areaFills.length > 0) {
            scene.areaFills = extracted.areaFills.map((af) => {
              const afProps = propertyMap(af.properties)
              return {
                from: af.from,
                to: af.to,
                color: afProps.has('color') ? String(afProps.get('color')) : undefined,
                negativeColor: afProps.has('negativeColor') ? String(afProps.get('negativeColor')) : undefined,
                opacity: afProps.has('opacity') ? Number(afProps.get('opacity')) : undefined,
                interpolation: afProps.has('interpolation') ? String(afProps.get('interpolation')) : undefined,
              }
            })
          }
          if (extracted.annotations.length > 0) {
            scene.annotations = extracted.annotations.map((a): AnnotationConfig => {
              const aProps = propertyMap(a.properties)
              const kind = a.kind ?? 'point'
              if (kind === 'range') {
                const result: RangeAnnotationConfig = {
                  kind: 'range',
                  start: aProps.has('start') ? (isNaN(Number(aProps.get('start'))) ? String(aProps.get('start')) : Number(aProps.get('start'))) : 0,
                  end: aProps.has('end') ? (isNaN(Number(aProps.get('end'))) ? String(aProps.get('end')) : Number(aProps.get('end'))) : 0,
                }
                if (aProps.has('text')) {
                  result.text = String(aProps.get('text'))
                }
                return result
              }
              if (kind === 'free') {
                const result: FreeAnnotationConfig = {
                  kind: 'free',
                  text: String(aProps.get('text') ?? ''),
                  x: readPosition(a.properties, 'x') ?? 0,
                  y: readPosition(a.properties, 'y') ?? 0,
                }
                return result
              }
              const target = 'target' in a ? a.target : ''
              const result: PointAnnotationConfig = {
                kind: 'point',
                target,
                text: String(aProps.get('text') ?? ''),
              }
              return result
            })
          }
          if (extracted.series.length > 0) {
            scene.seriesOverrides = extracted.series.map((s) => {
              const sProps = propertyMap(s.properties)
              const override: SeriesOverride = { name: s.name }
              if (sProps.has('color')) {
                override.color = String(sProps.get('color'))
              }
              return override
            })
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
