import { describe, it, expect } from 'vitest'
import chroma from 'chroma-js'
import { readableColor, adjustColorsForBackground, contrastTextColor, wcagContrastRatio, wcagLevel } from './contrast'

const MIN_CONTRAST = 4.5
const MIN_ADJACENT_DELTA_E = 12

describe('contrastTextColor', () => {
  it('returns white on dark backgrounds', () => {
    expect(contrastTextColor('#000')).toBe('#fff')
    expect(contrastTextColor('#333')).toBe('#fff')
  })

  it('returns dark on light backgrounds', () => {
    expect(contrastTextColor('#fff')).toBe('#333')
    expect(contrastTextColor('#eee')).toBe('#333')
  })
})

describe('readableColor', () => {
  it('returns the color unchanged when it already has enough contrast', () => {
    const result = readableColor('#000', '#fff')
    expect(chroma.contrast(result, '#fff')).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('darkens a light color on a light background', () => {
    const result = readableColor('#eee', '#fff')
    expect(chroma.contrast(result, '#fff')).toBeGreaterThanOrEqual(MIN_CONTRAST)
    expect(chroma(result).luminance()).toBeLessThan(chroma('#eee').luminance())
  })

  it('brightens a dark color on a dark background', () => {
    const result = readableColor('#222', '#111')
    expect(chroma.contrast(result, '#111')).toBeGreaterThanOrEqual(MIN_CONTRAST)
    expect(chroma(result).luminance()).toBeGreaterThan(chroma('#222').luminance())
  })
})

describe('adjustColorsForBackground', () => {
  it('returns an empty array for empty input', () => {
    expect(adjustColorsForBackground([], '#fff')).toEqual([])
  })

  it('ensures every color meets background contrast', () => {
    const colors = ['#eee', '#ddd', '#ccc']
    const result = adjustColorsForBackground(colors, '#fff')
    for (const c of result) {
      expect(chroma.contrast(c, '#fff')).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it('ensures adjacent colors are perceptually distinguishable', () => {
    // Two very similar colors that would collapse after bg-contrast adjustment
    const colors = ['#aaa', '#aab', '#aac']
    const result = adjustColorsForBackground(colors, '#fff')
    for (let i = 1; i < result.length; i++) {
      expect(chroma.deltaE(result[i], result[i - 1])).toBeGreaterThanOrEqual(MIN_ADJACENT_DELTA_E)
    }
  })

  it('handles dark background with low-contrast dark colors', () => {
    const colors = ['#222', '#232', '#242']
    const bg = '#1e1e1e'
    const result = adjustColorsForBackground(colors, bg)
    for (const c of result) {
      expect(chroma.contrast(c, bg)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
    for (let i = 1; i < result.length; i++) {
      expect(chroma.deltaE(result[i], result[i - 1])).toBeGreaterThanOrEqual(MIN_ADJACENT_DELTA_E)
    }
  })

  it('leaves well-separated colors unchanged', () => {
    const colors = ['#c73032', '#3a6891', '#3d7a33']
    const result = adjustColorsForBackground(colors, '#fff')
    // These colors already have good contrast and separation — should be untouched
    for (let i = 0; i < colors.length; i++) {
      expect(result[i]).toBe(chroma(colors[i]).hex())
    }
  })

  it('preserves hue while adjusting lightness', () => {
    const colors = ['#eee', '#eef']
    const result = adjustColorsForBackground(colors, '#fff')
    for (let i = 0; i < colors.length; i++) {
      const originalHue = chroma(colors[i]).get('hsl.h')
      const adjustedHue = chroma(result[i]).get('hsl.h')
      // Hue should stay the same (NaN for achromatic is fine)
      if (!isNaN(originalHue) && !isNaN(adjustedHue)) {
        expect(Math.abs(adjustedHue - originalHue)).toBeLessThan(5)
      }
    }
  })

  it('maintains both bg and adjacent contrast simultaneously', () => {
    const colors = ['#bbb', '#bbc', '#bbd', '#bbe']
    const bg = '#fff'
    const result = adjustColorsForBackground(colors, bg)

    // Every color readable against bg
    for (const c of result) {
      expect(chroma.contrast(c, bg)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
    // Every adjacent pair distinguishable
    for (let i = 1; i < result.length; i++) {
      expect(chroma.deltaE(result[i], result[i - 1])).toBeGreaterThanOrEqual(MIN_ADJACENT_DELTA_E)
    }
  })

  it('works with a single color', () => {
    const result = adjustColorsForBackground(['#eee'], '#fff')
    expect(result).toHaveLength(1)
    expect(chroma.contrast(result[0], '#fff')).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})

describe('wcagContrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(wcagContrastRatio('#000', '#fff')).toBeCloseTo(21, 0)
  })

  it('returns 1 for identical colors', () => {
    expect(wcagContrastRatio('#888', '#888')).toBeCloseTo(1, 1)
  })

  it('is symmetric', () => {
    const a = wcagContrastRatio('#4e79a7', '#fff')
    const b = wcagContrastRatio('#fff', '#4e79a7')
    expect(a).toBeCloseTo(b, 5)
  })
})

describe('wcagLevel', () => {
  it('returns AAA for ratio >= 7', () => {
    expect(wcagLevel(7)).toBe('AAA')
    expect(wcagLevel(21)).toBe('AAA')
  })

  it('returns AA for ratio >= 4.5 and < 7', () => {
    expect(wcagLevel(4.5)).toBe('AA')
    expect(wcagLevel(6.9)).toBe('AA')
  })

  it('returns Fail for ratio < 4.5', () => {
    expect(wcagLevel(4.4)).toBe('Fail')
    expect(wcagLevel(1)).toBe('Fail')
  })
})

describe('contrast — N9: invalid input does not throw', () => {
  it('wcagContrastRatio returns 1 when fg is not a valid color', () => {
    expect(() => wcagContrastRatio('not-a-hex', '#fff')).not.toThrow()
    expect(wcagContrastRatio('not-a-hex', '#fff')).toBe(1)
  })

  it('wcagContrastRatio returns 1 when bg is not a valid color', () => {
    expect(() => wcagContrastRatio('#fff', 'not-a-color')).not.toThrow()
    expect(wcagContrastRatio('#fff', 'not-a-color')).toBe(1)
  })

  it('contrastTextColor falls back to #333 when bg is invalid', () => {
    expect(() => contrastTextColor('not-a-hex')).not.toThrow()
    expect(contrastTextColor('not-a-hex')).toBe('#333')
  })

  it('readableColor returns a sensible fallback when color is invalid', () => {
    expect(() => readableColor('not-a-hex', '#fff')).not.toThrow()
    const result = readableColor('not-a-hex', '#fff')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('readableColor does not throw when bg is invalid', () => {
    expect(() => readableColor('#4e79a7', 'not-a-color')).not.toThrow()
  })

  it('adjustColorsForBackground does not throw on invalid bg', () => {
    expect(() => adjustColorsForBackground(['#4e79a7', '#f28e2b'], 'not-a-color')).not.toThrow()
    const result = adjustColorsForBackground(['#4e79a7', '#f28e2b'], 'not-a-color')
    expect(result).toHaveLength(2)
  })

  it('adjustColorsForBackground does not throw on invalid colors in the array', () => {
    expect(() => adjustColorsForBackground(['not-a-hex', '#4e79a7'], '#fff')).not.toThrow()
    const result = adjustColorsForBackground(['not-a-hex', '#4e79a7'], '#fff')
    expect(result).toHaveLength(2)
  })
})
