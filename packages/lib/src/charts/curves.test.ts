import { describe, it, expect } from 'vitest'
import * as d3 from 'd3'
import { resolveCurve } from './curves'

describe('resolveCurve', () => {
  it('resolves "linear" to d3.curveLinear', () => {
    expect(resolveCurve('linear')).toBe(d3.curveLinear)
  })

  it('resolves "monotoneX" to d3.curveMonotoneX', () => {
    expect(resolveCurve('monotoneX')).toBe(d3.curveMonotoneX)
  })

  it('resolves "step" to d3.curveStep', () => {
    expect(resolveCurve('step')).toBe(d3.curveStep)
  })

  it('resolves "stepBefore" to d3.curveStepBefore', () => {
    expect(resolveCurve('stepBefore')).toBe(d3.curveStepBefore)
  })

  it('resolves "stepAfter" to d3.curveStepAfter', () => {
    expect(resolveCurve('stepAfter')).toBe(d3.curveStepAfter)
  })

  it('resolves "basis" to d3.curveBasis', () => {
    expect(resolveCurve('basis')).toBe(d3.curveBasis)
  })

  it('resolves "cardinal" to d3.curveCardinal', () => {
    expect(resolveCurve('cardinal')).toBe(d3.curveCardinal)
  })

  it('resolves "catmullRom" to d3.curveCatmullRom', () => {
    expect(resolveCurve('catmullRom')).toBe(d3.curveCatmullRom)
  })

  it('falls back to curveLinear for an unknown name', () => {
    expect(resolveCurve('nonexistent')).toBe(d3.curveLinear)
  })

  it('falls back to curveLinear for undefined', () => {
    expect(resolveCurve(undefined)).toBe(d3.curveLinear)
  })

  it('falls back to curveLinear for empty string', () => {
    expect(resolveCurve('')).toBe(d3.curveLinear)
  })
})
