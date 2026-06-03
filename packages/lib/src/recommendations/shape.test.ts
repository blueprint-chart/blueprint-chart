import { describe, expect, it } from 'vitest'
import { shapeOf } from './shape'

describe('shapeOf', () => {
  it('1 string + 1 number → 1cat+1num', () => {
    expect(shapeOf(['string', 'number'], 6)).toBe('1cat+1num')
  })
  it('1 string + N numbers → 1cat+Nnum', () => {
    expect(shapeOf(['string', 'number', 'number'], 10)).toBe('1cat+Nnum')
  })
  it('1 date + 1 number → 1date+1num', () => {
    expect(shapeOf(['date', 'number'], 12)).toBe('1date+1num')
  })
  it('1 date + N numbers → 1date+Nnum', () => {
    expect(shapeOf(['date', 'number', 'number'], 24)).toBe('1date+Nnum')
  })
  it('unsupported shapes → other', () => {
    expect(shapeOf(['string', 'string', 'number'], 5)).toBe('other')
    expect(shapeOf(['date', 'date', 'number'], 5)).toBe('other')
    expect(shapeOf(['string'], 5)).toBe('other')
  })
})
