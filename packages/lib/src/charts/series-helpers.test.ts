import { describe, it, expect, vi } from 'vitest'
import { listPalettes, resolvePalette } from './palettes'
import * as lineMulti from './types/line-multi/line-multi'
import * as barMulti from './types/bar-multi/bar-multi'
import * as columnStacked from './types/column-stacked/column-stacked'
import * as barStacked from './types/bar-stacked/bar-stacked'
import * as areaStacked from './types/area-stacked/area-stacked'
import * as barGrouped from './types/bar-grouped/bar-grouped'
import * as barSplit from './types/bar-split/bar-split'
import { resolveSeriesColor, resolveSeriesDash, resolveSeriesWidth, resolveSeriesInterpolation, isSeriesHidden, resolveSeriesLabelMode, resolveSeriesValueLabels, resolveSeriesOpacity, resolveSeriesLineSymbols } from './series-helpers'

describe('series-helpers', () => {
  const colors = ['#aaa', '#bbb', '#ccc']
  const overrides = [
    { name: 'Firefox', color: '#ff0000', lineWidth: 3, dash: 'dashed', interpolation: 'step', hidden: false },
    { name: 'Chrome', hidden: true },
  ]

  it('resolves series color from override', () => {
    expect(resolveSeriesColor('Firefox', 0, colors, overrides)).toBe('#ff0000')
  })

  it('falls back to colors array when no override', () => {
    expect(resolveSeriesColor('Safari', 2, colors, overrides)).toBe('#ccc')
  })

  it('resolves dash from override', () => {
    expect(resolveSeriesDash('Firefox', overrides)).toBe('dashed')
  })

  it('defaults dash to solid', () => {
    expect(resolveSeriesDash('Safari', overrides)).toBe('solid')
  })

  it('resolves line width from override', () => {
    expect(resolveSeriesWidth('Firefox', overrides)).toBe(3)
  })

  it('defaults line width to 2', () => {
    expect(resolveSeriesWidth('Safari', overrides)).toBe(2)
  })

  it('resolves interpolation from override', () => {
    expect(resolveSeriesInterpolation('Firefox', 'linear', overrides)).toBe('step')
  })

  it('falls back to global interpolation', () => {
    expect(resolveSeriesInterpolation('Safari', 'linear', overrides)).toBe('linear')
  })

  it('detects hidden series', () => {
    expect(isSeriesHidden('Chrome', overrides)).toBe(true)
    expect(isSeriesHidden('Firefox', overrides)).toBe(false)
    expect(isSeriesHidden('Safari', overrides)).toBe(false)
  })

  describe('resolveSeriesLabelMode', () => {
    const labelOverrides = [
      { name: 'Firefox', labelMode: 'direct' },
      { name: 'Chrome', labelMode: 'none' },
      { name: 'Edge', labelMode: 'global' },
    ]

    it('returns per-series label mode', () => {
      expect(resolveSeriesLabelMode('Firefox', 'legend', labelOverrides)).toBe('direct')
      expect(resolveSeriesLabelMode('Chrome', 'legend', labelOverrides)).toBe('none')
    })

    it('falls back to global when set to global', () => {
      expect(resolveSeriesLabelMode('Edge', 'legend', labelOverrides)).toBe('legend')
    })

    it('falls back to global when no override', () => {
      expect(resolveSeriesLabelMode('Safari', 'legend', labelOverrides)).toBe('legend')
    })
  })

  describe('resolveSeriesValueLabels', () => {
    const vlOverrides = [
      { name: 'Firefox', valueLabels: true },
      { name: 'Chrome', valueLabels: false },
    ]

    it('returns per-series value labels setting', () => {
      expect(resolveSeriesValueLabels('Firefox', false, vlOverrides)).toBe(true)
      expect(resolveSeriesValueLabels('Chrome', true, vlOverrides)).toBe(false)
    })

    it('falls back to global', () => {
      expect(resolveSeriesValueLabels('Safari', true, vlOverrides)).toBe(true)
      expect(resolveSeriesValueLabels('Safari', false, vlOverrides)).toBe(false)
    })
  })

  describe('resolveSeriesOpacity', () => {
    it('returns per-series opacity from override', () => {
      expect(resolveSeriesOpacity('Firefox', [{ name: 'Firefox', opacity: 0.5 }])).toBe(0.5)
    })

    it('defaults to 1 when no override', () => {
      expect(resolveSeriesOpacity('Safari', [{ name: 'Firefox', opacity: 0.5 }])).toBe(1)
    })

    it('defaults to 1 when no overrides array', () => {
      expect(resolveSeriesOpacity('Firefox')).toBe(1)
    })
  })

  describe('resolveSeriesLineSymbols', () => {
    const globalConfig = {
      name: '',
      lineSymbols: true,
      symbolShape: 'circle',
      symbolShowOn: 'firstLast',
      symbolStyle: 'filled',
      symbolSize: 3.5,
      symbolOpacity: 1,
    }

    it('disables symbols when per-series override is false', () => {
      const result = resolveSeriesLineSymbols('Chrome', globalConfig, [{ name: 'Chrome', lineSymbols: false }])
      expect(result).toBeUndefined()
    })

    it('enables symbols with per-series overrides', () => {
      const result = resolveSeriesLineSymbols('Firefox', undefined, [{ name: 'Firefox', lineSymbols: true, symbolShape: 'star' }])
      expect(result).toBeDefined()
      expect(result!.symbolShape).toBe('star')
    })

    it('merges per-series with global config', () => {
      const result = resolveSeriesLineSymbols('Firefox', globalConfig, [{ name: 'Firefox', symbolShape: 'diamond' }])
      expect(result).toBeDefined()
      expect(result!.symbolShape).toBe('diamond')
      expect(result!.symbolShowOn).toBe('firstLast')
    })

    it('returns undefined when no global and no per-series', () => {
      const result = resolveSeriesLineSymbols('Safari', undefined, [])
      expect(result).toBeUndefined()
    })
  })
})

describe('a chart with more series than the palette has colours (#60)', () => {
  const SERIES_COUNT = 12
  const labels = ['Q1', 'Q2']
  const data = {
    labels,
    values: [0, 0],
    series: Array.from({ length: SERIES_COUNT }, (_, i) => ({
      name: `S${i + 1}`,
      values: [10 + i, 20 + i],
    })),
  }

  const renderers: Array<[string, (c: HTMLElement, o: object) => void, string, string]> = [
    ['line-multi', (c, o) => lineMulti.render(c, data, o), '.bc-line', 'stroke'],
    ['bar-multi', (c, o) => barMulti.render(c, data, o), '.bc-bar-multi', 'fill'],
    ['column-stacked', (c, o) => columnStacked.render(c, data, o), '.bc-bar-stacked', 'fill'],
    ['bar-stacked', (c, o) => barStacked.render(c, data, o), '.bc-bar-stacked', 'fill'],
    ['area-stacked', (c, o) => areaStacked.render(c, data, o), '.bc-area', 'fill'],
    ['bar-grouped', (c, o) => barGrouped.render(c, data, o), '.bc-bar', 'fill'],
    ['bar-split', (c, o) => barSplit.render(c, data, o), '.bc-bar-split', 'fill'],
  ]

  function markColors(container: HTMLElement, selector: string, attr: string): string[] {
    return Array.from(container.querySelectorAll(selector), el => el.getAttribute(attr) ?? '')
  }

  function withContainer<T>(fn: (c: HTMLElement) => T): T {
    vi.useFakeTimers()
    const container = document.createElement('div')
    document.body.appendChild(container)
    try {
      return fn(container)
    }
    finally {
      vi.useRealTimers()
      container.remove()
    }
  }

  it(`gives every one of the ${SERIES_COUNT} series a distinct colour, for all shipped palettes`, () => {
    const offenders: string[] = []
    for (const palette of listPalettes()) {
      const colors = withContainer((c) => {
        lineMulti.render(c, data, { colors: [...palette.colors] })
        return markColors(c, '.bc-line', 'stroke')
      })
      expect(colors).toHaveLength(SERIES_COUNT)
      if (new Set(colors).size !== SERIES_COUNT) {
        offenders.push(`${palette.name} (${palette.colors.length} colours): ${new Set(colors).size} distinct`)
      }
    }
    expect(offenders).toEqual([])
  })

  for (const [name, run, selector, attr] of renderers) {
    it(`${name} paints no two series the same colour`, () => {
      const colors = withContainer((c) => {
        run(c, { colors: [...resolvePalette('Klimt')!] })
        return markColors(c, selector, attr)
      })
      expect(colors.length).toBeGreaterThanOrEqual(SERIES_COUNT)
      expect(new Set(colors).size).toBe(SERIES_COUNT)
    })
  }
})
