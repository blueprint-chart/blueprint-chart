import type { AnnotationNode, AnnotationVisibilityNode, AreaFillNode, ChartNode, DataNode, ColorizeNode, HighlightNode, PropertyNode, SceneNode, SeriesNode, TransformNode } from './types'
import { getChartOptions } from '../charts/registry'
import { AnnotationKind } from '../enums'

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

function serializeDataEntry(prop: PropertyNode, indent: string): string {
  if (prop.values && prop.values.length > 1) {
    const key = prop.key.startsWith('_') ? prop.key : `"${prop.key}"`
    const vals = prop.values.map((v) => {
      if (typeof v === 'number') {
        return `${v}`
      }
      return `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    })
    return `${indent}${key} = ${vals.join(',')}`
  }
  return serializeProperty(prop, indent)
}

function serializeData(data: DataNode, indent: string): string {
  const lines = [`${indent}data {`]
  for (const entry of data.entries) {
    lines.push(serializeDataEntry(entry, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeColorize(colorize: ColorizeNode, indent: string): string {
  const keyword = colorize.fromHighlight ? 'highlight' : 'colorize'
  const lines = [`${indent}${keyword} "${colorize.target}" {`]
  for (const prop of colorize.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeHighlight(highlight: HighlightNode, indent: string): string {
  return `${indent}highlight "${highlight.target}"`
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
  const kind = annotation.kind ?? AnnotationKind.Point
  if (kind === AnnotationKind.Range) {
    const lines = [`${indent}range {`]
    for (const prop of annotation.properties) {
      lines.push(serializeProperty(prop, `${indent}  `))
    }
    lines.push(`${indent}}`)
    return lines.join('\n')
  }
  if (kind === AnnotationKind.Free) {
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
  const kindMap = { [AnnotationKind.Point]: 'annotation', [AnnotationKind.Range]: 'range', [AnnotationKind.Free]: 'note' }
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
  for (const vis of scene.annotationVisibility) {
    lines.push(serializeAnnotationVisibility(vis, `${indent}  `))
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
  for (const vis of ast.annotationVisibility) {
    lines.push(serializeAnnotationVisibility(vis, '  '))
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
  for (const vis of ast.annotationVisibility) {
    lines.push(serializeAnnotationVisibility(vis, '  '))
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
