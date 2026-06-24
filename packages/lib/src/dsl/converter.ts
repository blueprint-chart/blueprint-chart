import type { PropertyNode, DataNode, SceneNode, ColorizeNode, HighlightNode, AnnotationNode, SeriesNode, AreaFillNode } from './types'
import type { ColorizeConfig, HighlightConfig, AnnotationConfig, PointAnnotationConfig, RangeAnnotationConfig, FreeAnnotationConfig, AreaFillConfig, SeriesOverride } from '../charts/types'
import { getChartOptions } from '../charts/registry'
import { AnnotationKind, ChartOptionType, Orientation, RangeAnchor } from '../enums'

/**
 * Convert an array of AST property nodes into a key→value map.
 */
export function propertyMap(properties: PropertyNode[]): Map<string, string | number | boolean> {
  return new Map(properties.map(p => [p.key, p.value]))
}

/**
 * Extract typed chart-type options from AST properties by using the registry's
 * option definitions to determine the correct type for each key.
 */
export function extractChartTypeOptions(
  chartType: string,
  properties: PropertyNode[],
): Record<string, unknown> {
  const propMap = propertyMap(properties)
  const defs = getChartOptions(chartType)
  const supported = new Set(defs.map(d => d.key))
  const opts: Record<string, unknown> = {}

  for (const def of defs) {
    const raw = propMap.get(def.key)
    if (raw === undefined) {
      continue
    }
    if (!supported.has(def.key)) {
      continue
    }

    if (def.type === ChartOptionType.Colors) {
      opts[def.key] = String(raw).split(',').map(s => s.trim()).filter(Boolean)
    }
    else if (def.type === ChartOptionType.Boolean) {
      if (def.key === 'valueLabels' && String(raw).toLowerCase() === 'percent') {
        opts[def.key] = 'percent'
      }
      else {
        opts[def.key] = raw === 'true' || raw === true
      }
    }
    else {
      opts[def.key] = String(raw)
    }
  }

  return opts
}

/**
 * Convert data entries from the AST back to the editor's raw data string format.
 * Preserves percentage syntax and series metadata.
 */
function needsQuoting(val: string): boolean {
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return false
  }
  if (/^-?\d+(\.\d+)?%$/.test(val)) {
    return false
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(val)) {
    return false
  }
  return true
}

export function dataEntriesToString(data: DataNode): string {
  return data.entries
    .map((e) => {
      // Multi-value entries (new format). A quoted "series" key is a real
      // data row (quotedKey), never the column meta-row.
      if (e.values && e.values.length > 1) {
        if (e.key === 'series' && !e.quotedKey) {
          return `series = ${e.values.map(v => `"${v}"`).join(',')}`
        }
        const vals = e.values.join(',')
        return `"${e.key}" = ${vals}`
      }
      // Legacy single-value entries
      const val = e.isPercentage ? `${e.value}%` : String(e.value)
      if (e.key === 'series' && !e.quotedKey) {
        return `series = "${val}"`
      }
      if (typeof e.value === 'string' && needsQuoting(val)) {
        return `"${e.key}" = "${val}"`
      }
      return `"${e.key}" = ${val}`
    })
    .join('\n')
}

/**
 * Extract scene overrides from a SceneNode, returning structured data
 * suitable for applying scene-level configuration.
 */
export function extractSceneOverrides(
  scene: SceneNode,
  chartType: string,
): {
    name: string | null
    chartType: string | undefined
    properties: Map<string, string | number | boolean>
    data: DataNode | null
    chartTypeOptions: Record<string, unknown>
    colorizes: SceneNode['colorizes']
    highlights: SceneNode['highlights']
    areaFills: SceneNode['areaFills']
    annotations: SceneNode['annotations']
    series: SceneNode['series']
    transforms: SceneNode['transforms']
  } {
  const props = propertyMap(scene.properties)
  const typeOverride = props.get('type') as string | undefined
  const effectiveType = typeOverride ?? chartType

  return {
    name: scene.name,
    chartType: typeOverride as string | undefined,
    properties: props,
    data: scene.data,
    chartTypeOptions: extractChartTypeOptions(effectiveType, scene.properties),
    colorizes: scene.colorizes,
    highlights: scene.highlights,
    areaFills: scene.areaFills,
    annotations: scene.annotations,
    series: scene.series,
    transforms: scene.transforms,
  }
}

function readProp(nodes: PropertyNode[], key: string): string | undefined {
  const p = nodes.find(x => x.key === key)
  return p ? String(p.value) : undefined
}

function readPosition(properties: PropertyNode[], key: string): number | string | undefined {
  const node = properties.find(p => p.key === key)
  if (!node) {
    return undefined
  }
  if (node.isPercentage) {
    return node.value as number
  }
  return node.value
}

function readMaxWidth(properties: PropertyNode[]): number | string | undefined {
  const node = properties.find(p => p.key === 'maxWidth')
  if (!node) {
    return undefined
  }
  if (node.isPercentage) {
    return `${node.value}%`
  }
  return node.value
}

const toBool = (v: unknown) => v === 'true' || v === true

/**
 * Convert AST highlight nodes to ColorizeConfig objects.
 */
export function convertColorizes(nodes: ColorizeNode[]): ColorizeConfig[] {
  return nodes.map(h => ({
    target: h.target,
    color: readProp(h.properties, 'color') ?? '#e15759',
    label: readProp(h.properties, 'label'),
  }))
}

/**
 * Convert AST highlight nodes to HighlightConfig objects.
 */
export function convertHighlights(nodes: HighlightNode[]): HighlightConfig[] {
  return nodes.map(h => ({ target: h.target }))
}

/**
 * Convert AST area-fill nodes to AreaFillConfig objects.
 */
export function convertAreaFills(nodes: AreaFillNode[]): AreaFillConfig[] {
  return nodes.map((af) => {
    const p = propertyMap(af.properties)
    return {
      from: af.from,
      to: af.to,
      color: p.has('color') ? String(p.get('color')) : undefined,
      negativeColor: p.has('negativeColor') ? String(p.get('negativeColor')) : undefined,
      opacity: p.has('opacity') ? Number(p.get('opacity')) : undefined,
      interpolation: p.has('interpolation') ? String(p.get('interpolation')) : undefined,
    }
  })
}

/**
 * Read an annotation's `repeat` lifespan from its properties. `repeat` counts
 * the EXTRA scenes the annotation carries into beyond its own:
 * `true` → 'always'; `false`/absent → once (undefined, no extra); a positive
 * integer N → N additional scenes (so the annotation shows on N+1 scenes total).
 * Out-of-range values are rejected upstream by validate.ts; this coerces defensively.
 */
function readRepeat(props: Map<string, string | number | boolean>): number | 'always' | undefined {
  const raw = props.get('repeat')
  if (raw === true || raw === 'true') {
    return 'always'
  }
  if (raw === undefined || raw === false || raw === 'false') {
    return undefined
  }
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : undefined
}

/**
 * Convert AST annotation nodes to AnnotationConfig objects.
 */
export function convertAnnotations(nodes: AnnotationNode[]): AnnotationConfig[] {
  return nodes.map((a): AnnotationConfig => {
    const aProps = propertyMap(a.properties)
    const kind = a.kind ?? AnnotationKind.Point

    if (kind === AnnotationKind.Range) {
      const result: RangeAnnotationConfig = {
        kind: AnnotationKind.Range,
        start: aProps.has('start') ? (isNaN(Number(aProps.get('start'))) ? String(aProps.get('start')) : Number(aProps.get('start'))) : 0,
        end: aProps.has('end') ? (isNaN(Number(aProps.get('end'))) ? String(aProps.get('end')) : Number(aProps.get('end'))) : 0,
      }
      result.repeat = readRepeat(aProps)
      if (aProps.has('orientation')) {
        result.orientation = String(aProps.get('orientation')) as Orientation
      }
      if (aProps.has('startAnchor')) {
        result.startAnchor = String(aProps.get('startAnchor')) as RangeAnchor
      }
      if (aProps.has('endAnchor')) {
        result.endAnchor = String(aProps.get('endAnchor')) as RangeAnchor
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

    if (kind === AnnotationKind.Free) {
      const result: FreeAnnotationConfig = {
        kind: AnnotationKind.Free,
        text: String(aProps.get('text') ?? ''),
        x: readPosition(a.properties, 'x') ?? 0,
        y: readPosition(a.properties, 'y') ?? 0,
      }
      result.repeat = readRepeat(aProps)
      if (aProps.has('textColor')) {
        result.textColor = String(aProps.get('textColor'))
      }
      const maxW = readMaxWidth(a.properties)
      if (maxW !== undefined) {
        result.maxWidth = maxW
      }
      if (aProps.has('textOutline')) {
        result.textOutline = toBool(aProps.get('textOutline'))
      }
      return result
    }

    // point (default)
    const target = 'target' in a ? a.target : ''
    const result: PointAnnotationConfig = {
      kind: AnnotationKind.Point,
      target,
      text: String(aProps.get('text') ?? ''),
    }
    result.repeat = readRepeat(aProps)
    if (aProps.has('textColor')) {
      result.textColor = String(aProps.get('textColor'))
    }
    const maxW = readMaxWidth(a.properties)
    if (maxW !== undefined) {
      result.maxWidth = maxW
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

/**
 * Convert AST series nodes to SeriesOverride objects.
 */
export function convertSeriesOverrides(nodes: SeriesNode[]): SeriesOverride[] {
  return nodes.map((s) => {
    const p = propertyMap(s.properties)
    const override: SeriesOverride = { name: s.name }
    if (p.has('color')) {
      override.color = String(p.get('color'))
    }
    if (p.has('lineWidth')) {
      override.lineWidth = Number(p.get('lineWidth'))
    }
    if (p.has('dash')) {
      override.dash = String(p.get('dash'))
    }
    if (p.has('interpolation')) {
      override.interpolation = String(p.get('interpolation'))
    }
    if (p.has('labelMode')) {
      override.labelMode = String(p.get('labelMode'))
    }
    if (p.has('labelText')) {
      override.labelText = String(p.get('labelText'))
    }
    if (p.has('valueLabels')) {
      const raw = p.get('valueLabels')
      override.valueLabels = String(raw).toLowerCase() === 'percent' ? 'percent' : toBool(raw)
    }
    if (p.has('lineSymbols')) {
      override.lineSymbols = toBool(p.get('lineSymbols'))
    }
    if (p.has('hidden')) {
      override.hidden = toBool(p.get('hidden'))
    }
    if (p.has('symbolShape')) {
      override.symbolShape = String(p.get('symbolShape'))
    }
    if (p.has('symbolShowOn')) {
      override.symbolShowOn = String(p.get('symbolShowOn'))
    }
    if (p.has('symbolStyle')) {
      override.symbolStyle = String(p.get('symbolStyle'))
    }
    if (p.has('symbolSize')) {
      override.symbolSize = Number(p.get('symbolSize'))
    }
    if (p.has('symbolOpacity')) {
      override.symbolOpacity = Number(p.get('symbolOpacity'))
    }
    return override
  })
}
