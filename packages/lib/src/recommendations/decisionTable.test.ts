import { describe, expect, it } from 'vitest'
import { resolveCell } from './decisionTable'

const topType = (shape: Parameters<typeof resolveCell>[0], intent: Parameters<typeof resolveCell>[1], rowCount = 10) =>
  resolveCell(shape, intent, rowCount)[0]?.type

describe('resolveCell', () => {
  it('1cat+1num ranking → bar-horizontal (label-length signal lives in the goal)', () => {
    expect(topType('1cat+1num', 'ranking')).toBe('bar-horizontal')
  })
  it('1cat+1num comparison → bar-vertical', () => {
    expect(topType('1cat+1num', 'comparison')).toBe('bar-vertical')
  })
  it('1cat+1num part-to-whole prefers pie at N<=5, donut at N<=8, bars beyond', () => {
    expect(topType('1cat+1num', 'part-to-whole', 4)).toBe('pie')
    expect(topType('1cat+1num', 'part-to-whole', 7)).toBe('donut')
    expect(topType('1cat+1num', 'part-to-whole', 20)).toBe('bar-vertical')
  })
  it('1cat+Nnum trend prefers line-multi (crossover stories read as lines)', () => {
    expect(topType('1cat+Nnum', 'trend')).toBe('line-multi')
  })
  it('1cat+Nnum part-to-whole → bar-stacked', () => {
    expect(topType('1cat+Nnum', 'part-to-whole')).toBe('bar-stacked')
  })
  it('1cat+Nnum composition-over-time → column-stacked', () => {
    expect(topType('1cat+Nnum', 'composition-over-time')).toBe('column-stacked')
  })
  it('range → bar-split only once a second numeric column can be the margin', () => {
    expect(topType('1cat+1num', 'range')).toBe('bar-vertical')
    expect(topType('1cat+Nnum', 'range')).toBe('bar-split')
  })
  it('1date+Nnum composition-over-time → area-stacked', () => {
    expect(topType('1date+Nnum', 'composition-over-time')).toBe('area-stacked')
  })
  it('1date+1num trend → line, with area available', () => {
    const cell = resolveCell('1date+1num', 'trend', 12)
    expect(cell[0]?.type).toBe('line')
    expect(cell.some(c => c.type === 'area')).toBe(true)
  })
  it('falls back to none cell for an unmapped intent', () => {
    expect(topType('1date+Nnum', 'part-to-whole')).toBe('area-stacked')
    expect(topType('other', 'comparison')).toBe('bar-vertical')
  })
})
