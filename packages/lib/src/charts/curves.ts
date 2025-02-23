import * as d3 from 'd3'

const CURVE_MAP: Record<string, d3.CurveFactory> = {
  linear: d3.curveLinear,
  monotoneX: d3.curveMonotoneX,
  step: d3.curveStep,
  stepBefore: d3.curveStepBefore,
  stepAfter: d3.curveStepAfter,
  basis: d3.curveBasis,
  cardinal: d3.curveCardinal,
  catmullRom: d3.curveCatmullRom,
}

export function resolveCurve(name: string | undefined): d3.CurveFactory {
  return (name && CURVE_MAP[name]) || d3.curveLinear
}
