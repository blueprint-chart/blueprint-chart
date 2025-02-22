import type { ChartNode, DataNode, HighlightNode, PropertyNode, StepNode } from './types'

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
  for (const step of ast.steps) {
    lines.push(serializeStep(step, '  '))
  }
  lines.push('}')
  return lines.join('\n')
}
