import { buildNumberFormatter } from '../../format-helpers'
import type { ScatterMapping } from './mapping'
import type { ScatterPoint } from './points'

type Formats = { x?: string, y?: string }

function formatter(format?: string): (value: number) => string {
  return (format ? buildNumberFormatter(format) : null) ?? String
}

export function formatScatterTooltip(point: ScatterPoint, mapping: ScatterMapping, formats: Formats): string {
  const lines = [
    point.name,
    `${mapping.x}: ${formatter(formats.x)(point.x)}`,
    `${mapping.y}: ${formatter(formats.y)(point.y)}`,
  ]
  if (point.size !== undefined && mapping.size) {
    lines.push(`${mapping.size}: ${point.size}`)
  }
  if (point.group !== undefined && mapping.group) {
    lines.push(`${mapping.group}: ${point.group}`)
  }
  return lines.join('\n')
}
