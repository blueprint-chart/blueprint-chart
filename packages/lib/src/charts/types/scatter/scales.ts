import * as d3 from 'd3'
import { ScaleType } from '../../../enums'
import { computeLinearDomain } from '../../scale-helpers'
import type { AxisRange } from '../../types'

export type ScatterScale = d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleSymLog<number, number>

function positiveBound(bound?: number | string): number | string | undefined {
  return typeof bound === 'number' && bound <= 0 ? undefined : bound
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
