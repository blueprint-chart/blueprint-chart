import * as d3 from 'd3'
import { describe, it, expect } from 'vitest'
import { dotPlotAnnotationContext } from './annotations'

describe('dotPlotAnnotationContext', () => {
  it('has no mark centre for a row without values', () => {
    const ctx = dotPlotAnnotationContext([{ name: 'a', values: [] }], d3.scaleLinear(), d3.scaleBand(), () => 10)
    expect(ctx.markCenter!('a')).toBeUndefined()
  })
})
