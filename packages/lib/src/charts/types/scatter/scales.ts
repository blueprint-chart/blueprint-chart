import * as d3 from 'd3'
import { ScaleType } from '../../../enums'
import { computeLinearDomain } from '../../scale-helpers'
import type { AxisRange } from '../../types'

export type ScatterScale = d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleSymLog<number, number>

function positiveBound(bound?: number | string): number | string | undefined {
  const value = typeof bound === 'string' && bound.trim() ? Number(bound) : bound
  return typeof value === 'number' && value <= 0 ? undefined : bound
}

function buildLogScale(values: number[], range?: AxisRange): ScatterScale {
  const positiveRange = range && { min: positiveBound(range.min), max: positiveBound(range.max) }
  const domain = computeLinearDomain(values.filter(v => v > 0), positiveRange, ScaleType.Log, false)
  if (!(domain[0] > 0 && Number.isFinite(domain[1]))) {
    return d3.scaleLog().domain([1, 10])
  }
  return d3.scaleLog().domain(domain).nice()
}

export function buildScatterScale(type: ScaleType | undefined, values: number[], range?: AxisRange): ScatterScale {
  if (type === ScaleType.Log) {
    return buildLogScale(values, range)
  }
  const domain = computeLinearDomain(values, range, type, false)
  return type === ScaleType.Symlog ? d3.scaleSymlog().domain(domain).nice() : d3.scaleLinear().domain(domain).nice()
}

export function axisTransform(type: ScaleType | undefined): { forward: (v: number) => number, inverse: (t: number) => number } {
  switch (type) {
    case ScaleType.Log:
      return { forward: Math.log10, inverse: t => 10 ** t }
    case ScaleType.Symlog:
      return { forward: v => Math.sign(v) * Math.log1p(Math.abs(v)), inverse: t => Math.sign(t) * Math.expm1(Math.abs(t)) }
    default:
      return { forward: v => v, inverse: t => t }
  }
}

/**
 * Widest `[start, end]` pixel range that keeps every bubble inside
 * `[0, length]`, and both ends of the domain at least `edgePad` from the edges. Only the bubbles that reach an edge cost
 * margin, so a large bubble in the middle of the cloud reserves none.
 */
export function fitRange(scale: ScatterScale, items: { value: number, r: number }[], length: number, edgePad = 0): [number, number] {
  const unit = scale.copy().range([0, 1])
  const spots = [{ t: 0, r: edgePad }, { t: 1, r: edgePad }, ...items.map(({ value, r }) => ({ t: unit(value), r }))]
  const startFor = (span: number) => Math.max(...spots.map(s => s.r - s.t * span))
  const fits = (span: number) => {
    const start = startFor(span)
    return spots.every(s => start + s.t * span + s.r <= length)
  }
  let low = 0
  let high = length
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2
    if (fits(mid)) {
      low = mid
    }
    else {
      high = mid
    }
  }
  const start = startFor(low)
  return [start, start + low]
}
