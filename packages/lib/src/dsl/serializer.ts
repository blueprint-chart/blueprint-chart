import type { AnnotationNode, AnnotationVisibilityNode, AreaFillNode, ChartNode, DataNode, HighlightNode, PropertyNode, SceneNode, SeriesNode, TransformNode } from './types'
import { getChartOptions } from '../charts/registry'

function serializeValue(prop: PropertyNode): string {
  if (typeof prop.value === 'number') {
    return prop.isPercentage ? `${prop.value}%` : `${prop.value}`
  }
  if (typeof prop.value === 'string' && prop.value.startsWith('#')) {
    return `"${prop.value}"`
  }
  if (typeof prop.value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(prop.value)) {
    return prop.value
  }
  return `"${String(prop.value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function serializeProperty(prop: PropertyNode, indent: string): string {
  const key = /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(prop.key) ? prop.key : `"${prop.key}"`
  return `${indent}${key} = ${serializeValue(prop)}`
}

function serializeData(data: DataNode, indent: string): string {
  const lines = [`${indent}data {`]
  for (const entry of data.entries) {
    lines.push(serializeProperty(entry, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeHighlight(highlight: HighlightNode, indent: string): string {
  const lines = [`${indent}highlight "${highlight.target}" {`]
  for (const prop of highlight.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeAreaFill(areaFill: AreaFillNode, indent: string): string {
  const lines = [`${indent}areafill "${areaFill.from}" "${areaFill.to}" {`]
  for (const prop of areaFill.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeAnnotation(annotation: AnnotationNode, indent: string): string {
  const kind = annotation.kind ?? 'point'
  if (kind === 'range') {
    const lines = [`${indent}range {`]
    for (const prop of annotation.properties) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
    lines.push(`${indent}}`)
    return lines.join('\n')
  }
  if (kind === 'free') {
    const lines = [`${indent}note {`]
    for (const prop of annotation.properties) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
    lines.push(`${indent}}`)
    return lines.join('\n')
  }
  // point (default)
  const target = 'target' in annotation ? annotation.target : ''
  const lines = [`${indent}annotation "${target}" {`]
  for (const prop of annotation.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeAnnotationVisibility(node: AnnotationVisibilityNode, indent: string): string {
  const kindMap = { point: 'annotation', range: 'range', free: 'note' }
  const keyword = `${node.action}_${kindMap[node.kind]}`
  return `${indent}${keyword} "${node.id}"`
}

function serializeSeries(series: SeriesNode, indent: string): string {
  const lines = [`${indent}series "${series.name}" {`]
  for (const prop of series.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeScene(scene: SceneNode, indent: string): string {
  const header = scene.name != null ? `${indent}scene "${scene.name}" {` : `${indent}scene {`
  const lines = [header]
  for (const prop of scene.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  if (scene.data) {
    lines.push(serializeData(scene.data, `${indent}  `))
  }
  for (const highlight of scene.highlights) {
    lines.push(serializeHighlight(highlight, `${indent}  `))
  }
  for (const areaFill of scene.areaFills ?? []) {
    lines.push(serializeAreaFill(areaFill, `${indent}  `))
  }
  for (const annotation of scene.annotations ?? []) {
    lines.push(serializeAnnotation(annotation, `${indent}  `))
  }
  for (const vis of scene.annotationVisibility ?? []) {
    lines.push(serializeAnnotationVisibility(vis, `${indent}  `))
  }
  for (const s of scene.series ?? []) {
    lines.push(serializeSeries(s, `${indent}  `))
  }
  for (const transform of scene.transforms ?? []) {
    lines.push(serializeTransform(transform, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeTransform(transform: TransformNode, indent: string): string {
  const lines = [`${indent}transform ${transform.transformType} {`]
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
  for (const highlight of ast.highlights) {
    lines.push(serializeHighlight(highlight, '  '))
  }
  for (const areaFill of ast.areaFills ?? []) {
    lines.push(serializeAreaFill(areaFill, '  '))
  }
  for (const annotation of ast.annotations ?? []) {
    lines.push(serializeAnnotation(annotation, '  '))
  }
  for (const s of ast.series ?? []) {
    lines.push(serializeSeries(s, '  '))
  }
  for (const scene of ast.scenes) {
    lines.push(serializeScene(scene, '  '))
  }
  for (const transform of ast.transforms ?? []) {
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
  for (const highlight of ast.highlights) {
    lines.push(serializeHighlight(highlight, '  '))
  }
  for (const areaFill of ast.areaFills ?? []) {
    lines.push(serializeAreaFill(areaFill, '  '))
  }
  for (const annotation of ast.annotations ?? []) {
    lines.push(serializeAnnotation(annotation, '  '))
  }
  for (const s of ast.series ?? []) {
    lines.push(serializeSeries(s, '  '))
  }
  for (const scene of ast.scenes) {
    lines.push(serializeScene(scene, '  '))
  }
  for (const transform of ast.transforms ?? []) {
    lines.push(serializeTransform(transform, '  '))
  }
  lines.push('}')
  return lines.join('\n')
}
