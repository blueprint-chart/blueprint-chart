import type { ChartData } from '../../types'
import { ScaleType } from '../../../enums'
import type { ScatterMapping } from './mapping'

export interface ScatterPoint { name: string, x: number, y: number, size?: number, group?: string }

export type DropReason = 'missing-x' | 'missing-y' | 'invalid-size' | 'non-positive-log-x' | 'non-positive-log-y'

export interface DroppedRow { name: string, reason: DropReason }

type ScaleTypes = { x?: ScaleType, y?: ScaleType }

function numericColumn(data: ChartData, name?: string): number[] | undefined {
  if (!name) {
    return undefined
  }
  return data.series ? data.series.find(s => s.name === name)?.values : data.values
}

function isNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function axisFailure(value: number | undefined, scale: ScaleType | undefined, missing: DropReason, nonPositive: DropReason): DropReason | undefined {
  if (!isNumber(value)) {
    return missing
  }
  if (scale === ScaleType.Log && value <= 0) {
    return nonPositive
  }
}

export function buildScatterPoints(data: ChartData, mapping: ScatterMapping, scaleTypes: ScaleTypes) {
  const xs = numericColumn(data, mapping.x)
  const ys = numericColumn(data, mapping.y)
  const sizes = numericColumn(data, mapping.size)
  const groups = data.textColumns?.find(c => c.name === mapping.group)?.values
  const points: ScatterPoint[] = []
  const dropped: DroppedRow[] = []

  data.labels.forEach((name, i) => {
    const reason = axisFailure(xs?.[i], scaleTypes.x, 'missing-x', 'non-positive-log-x')
      ?? axisFailure(ys?.[i], scaleTypes.y, 'missing-y', 'non-positive-log-y')
      ?? (sizes && !(isNumber(sizes[i]) && sizes[i] > 0) ? 'invalid-size' : undefined)
    if (reason) {
      dropped.push({ name, reason })
      return
    }
    const group = groups?.[i]
    points.push({
      name,
      x: xs![i],
      y: ys![i],
      ...(sizes && { size: sizes[i] }),
      ...(group && { group }),
    })
  })
  return { points, dropped }
}
