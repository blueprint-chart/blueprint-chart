import type { AnnotationNode, AreaFillNode, ChartNode, DataNode, HighlightNode, PropertyNode, SeriesNode, StepNode } from './types'
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

function serializeChildBlocks(lines: string[], indent: string, data: DataNode | null, highlights: HighlightNode[], areaFills?: AreaFillNode[], annotations?: AnnotationNode[]): void {
  if (data) {
    lines.push(serializeData(data, `${indent}  `))
  }
  for (const highlight of highlights) {
    lines.push(serializeHighlight(highlight, `${indent}  `))
  }
  for (const areaFill of areaFills ?? []) {
    lines.push(serializeAreaFill(areaFill, `${indent}  `))
  }
  for (const annotation of annotations ?? []) {
    lines.push(serializeAnnotation(annotation, `${indent}  `))
  }
}

function serializeStep(step: StepNode, indent: string): string {
  const lines = [`${indent}step "${step.name}" {`]
  for (const prop of step.properties) {
    lines.push(serializeProperty(prop, `${indent}  `))
  }
  serializeChildBlocks(lines, indent, step.data, step.highlights, step.areaFills, step.annotations)
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

function serializeChartBody(lines: string[], ast: ChartNode, props: PropertyNode[]): void {
  for (const prop of props) {
    lines.push(serializeProperty(prop, '  '))
  }
  serializeChildBlocks(lines, '', ast.data, ast.highlights, ast.areaFills, ast.annotations)
  for (const s of ast.series ?? []) {
    lines.push(serializeSeries(s, '  '))
  }
  for (const step of ast.steps) {
    lines.push(serializeStep(step, '  '))
  }
}

export function serialize(ast: ChartNode): string {
  const lines = [`chart ${ast.chartType} {`]
  serializeChartBody(lines, ast, ast.properties)
  lines.push('}')
  return lines.join('\n')
}

export function compactSerialize(ast: ChartNode): string {
  const lines = [`chart ${ast.chartType} {`]
  const nonDefaultProps = ast.properties.filter(p => !isDefaultValue(p.key, p.value, ast.chartType))
  serializeChartBody(lines, ast, nonDefaultProps)
  lines.push('}')
  return lines.join('\n')
}
