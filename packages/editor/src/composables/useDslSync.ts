import { parse, propertyMap, extractChartTypeOptions, dataEntriesToString } from '@blueprint-chart/lib'
import type { PropertyNode, SeriesOverride, AnnotationConfig, PointAnnotationConfig, RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'
import { useDataTransforms, type TransformType } from './useDataTransforms'

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

const VALID_TRANSFORM_TYPES = new Set<TransformType>(['sort', 'filter', 'hide-columns', 'transpose', 'group-by', 'computed', 'pivot'])

export function useDslSync() {
  const config = useChartConfig()
  const { store } = useChartTypeOptions()
  const transforms = useDataTransforms()

  function applyDsl(dslString: string): { success: boolean, error?: string } {
    try {
      const ast = parse(dslString)

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

      return { success: true }
    }
    catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { applyDsl }
}
