import type { AnnotationNode, AreaFillNode, ChartNode, DataNode, HighlightNode, PropertyNode, SeriesNode, StepNode } from './types'

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
  const lines = [`${indent}annotation "${annotation.target}" {`]
  for (const prop of annotation.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeSeries(series: SeriesNode, indent: string): string {
  const lines = [`${indent}series "${series.name}" {`]
  for (const prop of series.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeStep(step: StepNode, indent: string): string {
  const lines = [`${indent}step "${step.name}" {`]
  for (const prop of step.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  if (step.data) {
    lines.push(serializeData(step.data, `${indent}  `))
  }
  for (const highlight of step.highlights) {
    lines.push(serializeHighlight(highlight, `${indent}  `))
  }
  for (const areaFill of step.areaFills ?? []) {
    lines.push(serializeAreaFill(areaFill, `${indent}  `))
  }
  for (const annotation of step.annotations ?? []) {
    lines.push(serializeAnnotation(annotation, `${indent}  `))
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
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
  for (const step of ast.steps) {
    lines.push(serializeStep(step, '  '))
  }
  lines.push('}')
  return lines.join('\n')
}
