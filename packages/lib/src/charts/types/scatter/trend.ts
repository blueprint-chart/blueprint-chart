import type { ScaleType } from '../../../enums'
import { axisTransform } from './scales'
import type { ScatterPoint } from './points'

export type TrendMode = 'overall' | 'per-group'

export interface TrendSegment { key: string, group?: string, x1: number, y1: number, x2: number, y2: number }

const MIN_POINTS = 3

export function fitLeastSquares(xs: number[], ys: number[]): { slope: number, intercept: number } | null {
  const n = xs.length
  if (n < MIN_POINTS) {
    return null
  }
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  const sxx = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0)
  if (sxx === 0) {
    return null
  }
  const sxy = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0)
  const slope = sxy / sxx
  return { slope, intercept: meanY - slope * meanX }
}

function fitSegment(points: ScatterPoint[], scaleTypes: { x?: ScaleType, y?: ScaleType }, key: string, group?: string): TrendSegment | null {
  const fx = axisTransform(scaleTypes.x)
  const fy = axisTransform(scaleTypes.y)
  const xs = points.map(p => fx.forward(p.x))
  const fit = fitLeastSquares(xs, points.map(p => fy.forward(p.y)))
  if (!fit) {
    return null
  }
  const [lo, hi] = [Math.min(...xs), Math.max(...xs)]
  const at = (t: number) => fy.inverse(fit.slope * t + fit.intercept)
  return { key, group, x1: fx.inverse(lo), y1: at(lo), x2: fx.inverse(hi), y2: at(hi) }
}

export function trendSegments(points: ScatterPoint[], mode: TrendMode, scaleTypes: { x?: ScaleType, y?: ScaleType }): { segments: TrendSegment[], skipped: string[] } {
  const segments: TrendSegment[] = []
  const skipped: string[] = []
  const subsets = mode === 'overall' ? new Map([['overall', points]]) : groupPoints(points)
  for (const [name, subset] of subsets) {
    const segment = fitSegment(subset, scaleTypes, `trend:${name}`, mode === 'overall' ? undefined : name)
    if (segment) {
      segments.push(segment)
    }
    else {
      skipped.push(name)
    }
  }
  return { segments, skipped }
}

function groupPoints(points: ScatterPoint[]): Map<string, ScatterPoint[]> {
  const groups = new Map<string, ScatterPoint[]>()
  for (const point of points) {
    if (point.group !== undefined) {
      groups.set(point.group, [...(groups.get(point.group) ?? []), point])
    }
  }
  return groups
}
