import { describe, it, expect } from 'vitest'
import { resolvePosition, resolveMaxWidth } from './position-helpers'

describe('resolvePosition', () => {
  it('treats a plain number as a percentage of the plot box', () => {
    expect(resolvePosition(0, 200)).toBe(0)
    expect(resolvePosition(50, 200)).toBe(100)
    expect(resolvePosition(100, 200)).toBe(200)
  })

  it('parses a percentage string the same as the numeric equivalent', () => {
    expect(resolvePosition('0%', 200)).toBe(resolvePosition(0, 200))
    expect(resolvePosition('25%', 400)).toBe(resolvePosition(25, 400))
    expect(resolvePosition('100%', 200)).toBe(resolvePosition(100, 200))
  })

  it('keeps the documented 10%/90% note inside the plot box', () => {
    expect(resolvePosition('10%', 628)).toBeCloseTo(62.8, 5)
    expect(resolvePosition('90%', 400)).toBeCloseTo(360, 5)
  })

  it('parses a plain pixel string as an absolute value', () => {
    expect(resolvePosition('42', 200)).toBe(42)
    expect(resolvePosition('0', 200)).toBe(0)
  })

  it('returns 0 for an unparseable string', () => {
    expect(resolvePosition('abc', 200)).toBe(0)
  })
})

describe('resolveMaxWidth', () => {
  it('returns undefined when maxWidth is null or undefined', () => {
    expect(resolveMaxWidth(undefined, 400)).toBeUndefined()
    expect(resolveMaxWidth(null as unknown as undefined, 400)).toBeUndefined()
  })

  it('returns the number directly when given a positive number', () => {
    expect(resolveMaxWidth(120, 400)).toBe(120)
  })

  it('returns undefined when given 0', () => {
    expect(resolveMaxWidth(0, 400)).toBeUndefined()
  })

  it('computes a fraction of chartWidth for a percentage string', () => {
    expect(resolveMaxWidth('50%', 400)).toBe(200)
    expect(resolveMaxWidth('25%', 400)).toBe(100)
  })

  it('parses a plain pixel string', () => {
    expect(resolveMaxWidth('80', 400)).toBe(80)
  })

  it('returns undefined for a zero or unparseable string', () => {
    expect(resolveMaxWidth('0', 400)).toBeUndefined()
    expect(resolveMaxWidth('abc', 400)).toBeUndefined()
  })
})
