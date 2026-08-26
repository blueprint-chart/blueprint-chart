import type { AnnotationNode, AreaFillNode, ChartNode, DataNode, ColorizeNode, HighlightNode, PropertyNode, SceneNode, SeriesNode, TransformNode } from './types'
import { getChartOptions } from '../charts/registry'
import { AnnotationKind } from '../enums'
import { quoteDslString } from './quoting'

function commentLines(comments: string[] | undefined, indent: string): string[] {
  // A captured comment may contain embedded newlines (multi-line block
  // comments). Emit every physical line as its own `// ` line so the result
  // re-parses as comments rather than bare continuation text.
  return (comments ?? []).flatMap(c =>
    c.split('\n').map(line => `${indent}// ${line.trim()}`),
  )
}

function serializeValue(prop: PropertyNode): string {
  if (typeof prop.value === 'number') {
    return prop.isPercentage ? `${prop.value}%` : `${prop.value}`
  }
  if (typeof prop.value === 'string' && prop.value.startsWith('#')) {
    return quoteDslString(prop.value)
  }
  if (typeof prop.value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(prop.value)) {
    return prop.value
  }
  return quoteDslString(String(prop.value))
}

function serializeKey(key: string): string {
  return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) ? key : quoteDslString(key)
}

function serializeProperty(prop: PropertyNode, indent: string): string {
  const key = serializeKey(prop.key)
  const line = `${indent}${key} = ${serializeValue(prop)}`
  return [...commentLines(prop.leadingComments, indent), line].join('\n')
}

function serializeDataEntry(prop: PropertyNode, indent: string): string {
  let line: string
  // A quoted "series" key is a real data row, never the column meta-row —
  // keep it quoted so it cannot be re-read as the header.
  if (prop.key === 'series' && prop.quotedKey && !(prop.values && prop.values.length > 1)) {
    line = `${indent}"series" = ${serializeValue(prop)}`
  }
  else if (prop.values && prop.values.length > 1) {
    const key = prop.key === 'series' && !prop.quotedKey ? prop.key : quoteDslString(prop.key)
    const vals = prop.values.map((v) => {
      if (typeof v === 'number') {
        return `${v}`
      }
      return quoteDslString(String(v))
    })
    line = `${indent}${key} = ${vals.join(',')}`
  }
  else {
    // Inline the single-value case (do NOT call serializeProperty, which would
    // emit this entry's comment a second time).
    line = `${indent}${serializeKey(prop.key)} = ${serializeValue(prop)}`
  }
  return [...commentLines(prop.leadingComments, indent), line].join('\n')
}

function serializeData(data: DataNode, indent: string): string {
  const lines = [...commentLines(data.leadingComments, indent), `${indent}data {`]
  for (const entry of data.entries) {
    lines.push(serializeDataEntry(entry, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeColorize(colorize: ColorizeNode, indent: string): string {
  const keyword = colorize.fromHighlight ? 'highlight' : 'colorize'
  const lines = [...commentLines(colorize.leadingComments, indent), `${indent}${keyword} ${quoteDslString(colorize.target)} {`]
  for (const prop of colorize.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeHighlight(highlight: HighlightNode, indent: string): string {
  return [...commentLines(highlight.leadingComments, indent), `${indent}highlight ${quoteDslString(highlight.target)}`].join('\n')
}

function serializeAreaFill(areaFill: AreaFillNode, indent: string): string {
  const lines = [...commentLines(areaFill.leadingComments, indent), `${indent}area-fill ${quoteDslString(areaFill.from)} ${quoteDslString(areaFill.to)} {`]
  for (const prop of areaFill.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeAnnotation(annotation: AnnotationNode, indent: string): string {
  const kind = annotation.kind ?? AnnotationKind.Point
  if (kind === AnnotationKind.Range) {
    const lines = [...commentLines(annotation.leadingComments, indent), `${indent}range {`]
    for (const prop of annotation.properties) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
    lines.push(`${indent}}`)
    return lines.join('\n')
  }
  if (kind === AnnotationKind.Free) {
    const lines = [...commentLines(annotation.leadingComments, indent), `${indent}note {`]
    for (const prop of annotation.properties) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
    lines.push(`${indent}}`)
    return lines.join('\n')
  }
  // point (default)
  const target = 'target' in annotation ? annotation.target : ''
  const lines = [...commentLines(annotation.leadingComments, indent), `${indent}annotation ${quoteDslString(target)} {`]
  for (const prop of annotation.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeSeries(series: SeriesNode, indent: string): string {
  const lines = [...commentLines(series.leadingComments, indent), `${indent}series ${quoteDslString(series.name)} {`]
  for (const prop of series.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeScene(scene: SceneNode, indent: string): string {
  const header = scene.name != null ? `${indent}scene ${quoteDslString(scene.name)} {` : `${indent}scene {`
  const lines = [...commentLines(scene.leadingComments, indent), header]
  for (const prop of scene.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  if (scene.data) {
    lines.push(serializeData(scene.data, `${indent}  `))
  }
  for (const colorize of scene.colorizes) {
    lines.push(serializeColorize(colorize, `${indent}  `))
  }
  for (const highlight of scene.highlights) {
    lines.push(serializeHighlight(highlight, `${indent}  `))
  }
  for (const areaFill of scene.areaFills) {
    lines.push(serializeAreaFill(areaFill, `${indent}  `))
  }
  for (const annotation of scene.annotations) {
    lines.push(serializeAnnotation(annotation, `${indent}  `))
  }
  for (const s of scene.series) {
    lines.push(serializeSeries(s, `${indent}  `))
  }
  for (const transform of scene.transforms) {
    lines.push(serializeTransform(transform, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeTransform(transform: TransformNode, indent: string): string {
  const lines = [...commentLines(transform.leadingComments, indent), `${indent}transform ${transform.transformType} {`]
  for (const prop of transform.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function isDefaultValue(key: string, value: string | number, chartType: string): boolean {
  const optionDefs = getChartOptions(chartType)
  const def = optionDefs.find(d => d.key === key)
  if (!def || def.default === undefined) {
    return false
  }
  return String(def.default) === String(value)
}

export function serialize(ast: ChartNode): string {
  const lines = [`chart ${ast.chartType} {`]
  for (const prop of ast.properties) {
    lines.push(serializeProperty(prop, '  '))
  }
  if (ast.data) {
    lines.push(serializeData(ast.data, '  '))
  }
  for (const colorize of ast.colorizes) {
    lines.push(serializeColorize(colorize, '  '))
  }
  for (const highlight of ast.highlights) {
    lines.push(serializeHighlight(highlight, '  '))
  }
  for (const areaFill of ast.areaFills) {
    lines.push(serializeAreaFill(areaFill, '  '))
  }
  for (const annotation of ast.annotations) {
    lines.push(serializeAnnotation(annotation, '  '))
  }
  for (const s of ast.series) {
    lines.push(serializeSeries(s, '  '))
  }
  for (const scene of ast.scenes) {
    lines.push(serializeScene(scene, '  '))
  }
  for (const transform of ast.transforms) {
    lines.push(serializeTransform(transform, '  '))
  }
  lines.push('}')
  return lines.join('\n')
}

// propValueMap is used by compactSerializeDeep in Task 2 (scene/series scope
// purging) — declared alongside redundantInScope for co-location.
function propValueMap(props: PropertyNode[]): Map<string, string | number> {
  return new Map(props.map(p => [p.key, p.value]))
}

// Redundant in a scope iff the value equals the effective inherited value:
//  - inherited.has(key)  → equals the value inherited from the enclosing scope
//  - otherwise           → equals the registered default for this chart type
// Non-option keys (no registered ChartOptionDef) are never redundant — title,
// description, `type`, etc. are kept untouched.
function redundantInScope(
  key: string,
  value: string | number,
  chartType: string,
  inherited: Map<string, string | number>,
): boolean {
  const def = getChartOptions(chartType).find(d => d.key === key)
  if (!def) {
    return false
  }
  if (inherited.has(key)) {
    return String(inherited.get(key)) === String(value)
  }
  if (def.default === undefined) {
    return false
  }
  return String(def.default) === String(value)
}

function compactSerializeSeries(
  series: SeriesNode,
  indent: string,
  chartType: string,
  inherited: Map<string, string | number>,
): string {
  const lines = [...commentLines(series.leadingComments, indent), `${indent}series ${quoteDslString(series.name)} {`]
  for (const prop of series.properties) {
    if (prop.isPercentage || !redundantInScope(prop.key, prop.value, chartType, inherited)) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function compactSerializeScene(
  scene: SceneNode,
  indent: string,
  baseChartType: string,
  baseInherited: Map<string, string | number>,
): string {
  const typeProp = scene.properties.find(p => p.key === 'type')
  const effectiveType = typeProp ? String(typeProp.value) : baseChartType
  const header = scene.name != null ? `${indent}scene ${quoteDslString(scene.name)} {` : `${indent}scene {`
  const lines = [...commentLines(scene.leadingComments, indent), header]
  // Scene-scope inherited map for nested series: base effective overlaid with
  // the scene's own (non-redundant or not) option values.
  const sceneInherited = new Map(baseInherited)
  for (const prop of scene.properties) {
    if (prop.key === 'type') {
      // Structural, not an option — always keep.
      lines.push(serializeProperty(prop, `${indent}  `))
      continue
    }
    sceneInherited.set(prop.key, prop.value)
    if (prop.isPercentage || !redundantInScope(prop.key, prop.value, effectiveType, baseInherited)) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
  }
  if (scene.data) {
    lines.push(serializeData(scene.data, `${indent}  `))
  }
  for (const colorize of scene.colorizes) {
    lines.push(serializeColorize(colorize, `${indent}  `))
  }
  for (const highlight of scene.highlights) {
    lines.push(serializeHighlight(highlight, `${indent}  `))
  }
  for (const areaFill of scene.areaFills) {
    lines.push(serializeAreaFill(areaFill, `${indent}  `))
  }
  for (const annotation of scene.annotations) {
    lines.push(serializeAnnotation(annotation, `${indent}  `))
  }
  for (const s of scene.series) {
    lines.push(compactSerializeSeries(s, `${indent}  `, effectiveType, sceneInherited))
  }
  for (const transform of scene.transforms) {
    lines.push(serializeTransform(transform, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

export function compactSerializeDeep(ast: ChartNode): string {
  const lines = [`chart ${ast.chartType} {`]
  const noInherit = new Map<string, string | number>()
  for (const prop of ast.properties) {
    if (prop.isPercentage || !redundantInScope(prop.key, prop.value, ast.chartType, noInherit)) {
      lines.push(serializeProperty(prop, '  '))
    }
  }
  if (ast.data) {
    lines.push(serializeData(ast.data, '  '))
  }
  for (const colorize of ast.colorizes) {
    lines.push(serializeColorize(colorize, '  '))
  }
  for (const highlight of ast.highlights) {
    lines.push(serializeHighlight(highlight, '  '))
  }
  for (const areaFill of ast.areaFills) {
    lines.push(serializeAreaFill(areaFill, '  '))
  }
  for (const annotation of ast.annotations) {
    lines.push(serializeAnnotation(annotation, '  '))
  }
  const baseInherited = propValueMap(ast.properties)
  for (const s of ast.series) {
    lines.push(compactSerializeSeries(s, '  ', ast.chartType, baseInherited))
  }
  for (const scene of ast.scenes) {
    lines.push(compactSerializeScene(scene, '  ', ast.chartType, baseInherited))
  }
  for (const transform of ast.transforms) {
    lines.push(serializeTransform(transform, '  '))
  }
  lines.push('}')
  return lines.join('\n')
}

export function compactSerialize(ast: ChartNode): string {
  const lines = [`chart ${ast.chartType} {`]
  for (const prop of ast.properties) {
    if (!isDefaultValue(prop.key, prop.value, ast.chartType)) {
      lines.push(serializeProperty(prop, '  '))
    }
  }
  if (ast.data) {
    lines.push(serializeData(ast.data, '  '))
  }
  for (const colorize of ast.colorizes) {
    lines.push(serializeColorize(colorize, '  '))
  }
  for (const highlight of ast.highlights) {
    lines.push(serializeHighlight(highlight, '  '))
  }
  for (const areaFill of ast.areaFills) {
    lines.push(serializeAreaFill(areaFill, '  '))
  }
  for (const annotation of ast.annotations) {
    lines.push(serializeAnnotation(annotation, '  '))
  }
  for (const s of ast.series) {
    lines.push(serializeSeries(s, '  '))
  }
  for (const scene of ast.scenes) {
    lines.push(serializeScene(scene, '  '))
  }
  for (const transform of ast.transforms) {
    lines.push(serializeTransform(transform, '  '))
  }
  lines.push('}')
  return lines.join('\n')
}
