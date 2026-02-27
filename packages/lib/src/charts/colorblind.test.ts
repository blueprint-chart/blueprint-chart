import { describe, it, expect } from 'vitest'
import { getCvdFilterId, createCvdSvgFilter, type CvdType } from './colorblind'

describe('getCvdFilterId', () => {
  it('returns prefixed id for each type', () => {
    expect(getCvdFilterId('protanopia')).toBe('bc-cvd-protanopia')
    expect(getCvdFilterId('deuteranopia')).toBe('bc-cvd-deuteranopia')
    expect(getCvdFilterId('tritanopia')).toBe('bc-cvd-tritanopia')
  })
})

describe('createCvdSvgFilter', () => {
  const types: CvdType[] = ['protanopia', 'deuteranopia', 'tritanopia']

  for (const type of types) {
    it(`creates a filter element for ${type}`, () => {
      const filter = createCvdSvgFilter(type)
      expect(filter.tagName).toBe('filter')
      expect(filter.getAttribute('id')).toBe(`bc-cvd-${type}`)
    })

    it(`contains an feColorMatrix child for ${type}`, () => {
      const filter = createCvdSvgFilter(type)
      const matrix = filter.querySelector('feColorMatrix')
      expect(matrix).not.toBeNull()
      expect(matrix!.getAttribute('type')).toBe('matrix')
      expect(matrix!.getAttribute('values')).toBeTruthy()
    })
  }

  it('sets color-interpolation-filters to linearRGB', () => {
    const filter = createCvdSvgFilter('protanopia')
    expect(filter.getAttribute('color-interpolation-filters')).toBe('linearRGB')
  })
})
