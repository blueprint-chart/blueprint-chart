import { describe, it, expect } from 'vitest'
import chroma from 'chroma-js'
import { getCvdFilterId, createCvdSvgFilter, simulateCvdColor, checkCvdColors, type CvdType } from './colorblind'

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

describe('simulateCvdColor', () => {
  it('returns a valid hex color', () => {
    const result = simulateCvdColor('#e15759', 'protanopia')
    expect(result).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('treats an unparseable color as black instead of throwing', () => {
    expect(simulateCvdColor('notacolor', 'protanopia')).toBe(simulateCvdColor('#000000', 'protanopia'))
  })

  it('leaves achromatic colors mostly unchanged', () => {
    const gray = '#808080'
    for (const type of ['protanopia', 'deuteranopia', 'tritanopia'] as CvdType[]) {
      const result = simulateCvdColor(gray, type)
      expect(chroma.deltaE(gray, result)).toBeLessThan(5)
    }
  })

  it('shifts red toward brown/yellow under protanopia', () => {
    const red = '#ff0000'
    const simulated = simulateCvdColor(red, 'protanopia')
    const simHue = chroma(simulated).get('hsl.h')
    // Red (0) should shift away from pure red
    expect(chroma.deltaE(red, simulated)).toBeGreaterThan(10)
    expect(simHue).toBeDefined()
  })
})

describe('checkCvdColors', () => {
  it('returns empty for a single color', () => {
    expect(checkCvdColors(['#ff0000'])).toEqual([])
  })

  it('returns empty for well-separated colors', () => {
    // Blue and orange are distinguishable under all CVD types
    const issues = checkCvdColors(['#0000ff', '#ff8800'])
    expect(issues).toEqual([])
  })

  it('detects red-green confusion under at least one CVD type', () => {
    const issues = checkCvdColors(['#d62728', '#2ca02c'])
    const types = issues.map(i => i.type)
    expect(types.some(t => t === 'protanopia' || t === 'deuteranopia')).toBe(true)
  })

  it('does not throw when one entry is unparseable', () => {
    expect(() => checkCvdColors(['notacolor', '#2a9d8f'])).not.toThrow()
  })

  it('includes pair details with deltaE', () => {
    const issues = checkCvdColors(['#d62728', '#2ca02c'])
    for (const issue of issues) {
      expect(issue.label).toBeTruthy()
      for (const pair of issue.pairs) {
        expect(pair.a).toBeTruthy()
        expect(pair.b).toBeTruthy()
        expect(pair.deltaE).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
