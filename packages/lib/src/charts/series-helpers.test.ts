import { describe, it, expect } from 'vitest'
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
