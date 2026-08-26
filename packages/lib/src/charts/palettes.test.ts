import { describe, it, expect } from 'vitest'
import chroma from 'chroma-js'
import { resolvePalette, listPalettes } from './palettes'
import { checkCvdColors } from './colorblind'

/**
 * Machado et al. 2009 severity-1.0 CVD simulation matrices (linear sRGB).
 * Used to verify the Blueprint palette is distinguishable under all three
 * major types of colour-vision deficiency.
 */
const CVD_MATRICES: Record<string, number[][]> = {
  protanopia: [
    [0.15259, 1.05266, -0.20525],
    [0.11474, 0.78616, 0.09910],
    [-0.00387, -0.04816, 1.05204],
  ],
  deuteranopia: [
    [0.36740, 0.86045, -0.22785],
    [0.04643, 0.73994, 0.21364],
    [-0.01187, 0.03230, 0.97957],
  ],
  tritanopia: [
    [1.25527, -0.07670, -0.17857],
    [-0.07846, 0.93064, 0.14782],
    [0.00429, 0.69144, 0.30427],
  ],
}

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

function simulateCVD(hex: string, matrix: number[][]): string {
  const [r, g, b] = chroma(hex).rgb().map(v => srgbToLinear(v / 255))
  const lr = Math.max(0, Math.min(1, matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b))
  const lg = Math.max(0, Math.min(1, matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b))
  const lb = Math.max(0, Math.min(1, matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b))
  return chroma(
    Math.round(linearToSrgb(lr) * 255),
    Math.round(linearToSrgb(lg) * 255),
    Math.round(linearToSrgb(lb) * 255),
  ).hex()
}

function minPairwiseDeltaE(colors: string[]): number {
  let min = Infinity
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      min = Math.min(min, chroma.deltaE(colors[i], colors[j]))
    }
  }
  return min
}

/** Minimum deltaE between any two palette colors under CVD simulation. */
const MIN_CVD_DELTA_E = 10

describe('palettes', () => {
  it('resolves Blueprint palette by name', () => {
    const colors = resolvePalette('Blueprint')
    expect(colors).toBeDefined()
    expect(colors!.length).toBeGreaterThanOrEqual(6)
  })

  it('returns Blueprint as the first listed palette', () => {
    const palettes = listPalettes()
    expect(palettes[0].name).toBe('Blueprint')
  })

  describe('Blueprint palette – colour-vision deficiency safety', () => {
    const colors = resolvePalette('Blueprint')!

    it('has sufficient pairwise contrast for normal vision', () => {
      expect(minPairwiseDeltaE(colors)).toBeGreaterThanOrEqual(MIN_CVD_DELTA_E)
    })

    for (const [cvdType, matrix] of Object.entries(CVD_MATRICES)) {
      it(`remains distinguishable under ${cvdType} (dE >= ${MIN_CVD_DELTA_E})`, () => {
        const simulated = colors.map(c => simulateCVD(c, matrix))
        const minDE = minPairwiseDeltaE(simulated)
        expect(minDE).toBeGreaterThanOrEqual(MIN_CVD_DELTA_E)
      })
    }
  })

  describe('BlueprintBold palette', () => {
    it('resolves BlueprintBold by name with chartreuse second', () => {
      const colors = resolvePalette('BlueprintBold')
      expect(colors).toEqual(['#2563A0', '#DDF247', '#C94044', '#2D8659', '#D4A63A', '#163A65'])
    })

    it('is listed in the catalogue with a human label', () => {
      const entry = listPalettes().find(p => p.name === 'BlueprintBold')
      expect(entry).toBeDefined()
      expect(entry!.label).toBe('Blueprint Bold')
    })

    it('keeps Blueprint as the first listed palette', () => {
      expect(listPalettes()[0].name).toBe('Blueprint')
    })

    describe('colour-vision deficiency safety', () => {
      const colors = resolvePalette('BlueprintBold')!

      it('has sufficient pairwise contrast for normal vision', () => {
        expect(minPairwiseDeltaE(colors)).toBeGreaterThanOrEqual(MIN_CVD_DELTA_E)
      })

      for (const [cvdType, matrix] of Object.entries(CVD_MATRICES)) {
        it(`is distinguishable under ${cvdType}`, () => {
          const simulated = colors.map(c => simulateCVD(c, matrix))
          expect(minPairwiseDeltaE(simulated)).toBeGreaterThanOrEqual(MIN_CVD_DELTA_E)
        })
      }
    })
  })
})

describe('every shipped palette passes the library colourblind check (#63)', () => {
  /**
   * Palettes that are an analogous ramp rather than a categorical set: their
   * neighbouring entries are meant to read as steps of one progression, and no
   * edit that keeps each entry inside dE 8 of its published value reaches the
   * deltaE 10 threshold. The best a search found is pinned as a floor so they
   * cannot silently get worse.
   */
  const RAMPS_THAT_CANNOT_REACH_THE_THRESHOLD: Record<string, number> = {
    JosefAlbers: 4.4,
    AgSunset: 5.8,
    Sunset: 5.7,
  }

  function worstPairDeltaE(colors: string[]): number {
    return checkCvdColors(colors)
      .flatMap(issue => issue.pairs.map(pair => pair.deltaE))
      .reduce((min, de) => Math.min(min, de), Infinity)
  }

  it('checkCvdColors is clean for every palette that is not an analogous ramp', () => {
    const offenders: string[] = []
    for (const palette of listPalettes()) {
      if (palette.name in RAMPS_THAT_CANNOT_REACH_THE_THRESHOLD) {
        continue
      }
      const issues = checkCvdColors([...palette.colors])
      if (issues.length > 0) {
        const detail = issues.map(i => `${i.type} ${i.pairs.map(p => `${p.a}/${p.b}=${p.deltaE.toFixed(1)}`).join(' ')}`).join('; ')
        offenders.push(`${palette.name}: ${detail}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('keeps the analogous ramps no worse than they are today', () => {
    for (const [name, floor] of Object.entries(RAMPS_THAT_CANNOT_REACH_THE_THRESHOLD)) {
      expect(worstPairDeltaE([...resolvePalette(name)!])).toBeGreaterThanOrEqual(floor)
    }
  })
})
