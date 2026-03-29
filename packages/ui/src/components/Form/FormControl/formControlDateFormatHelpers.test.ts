import { describe, expect, it } from 'vitest'
import {
  PRESETS,
  formatWithD3,
  tickPreview,
  presetToD3,
  buildCustomPreview,
  buildDisplayValue,
  resolvePresetState,
} from './formControlDateFormatHelpers'

describe('formatWithD3', () => {
  it('formats a date with a standard d3 format string', () => {
    const date = new Date(2015, 0, 1)
    expect(formatWithD3('%Y', date)).toBe('2015')
  })

  it('handles %q quarter placeholder', () => {
    const date = new Date(2015, 0, 1) // January = Q1
    const result = formatWithD3('%Y Q%q', date)
    expect(result).toContain('Q1')
    expect(result).toContain('2015')
  })

  it('resolves correct quarter for Q4', () => {
    const date = new Date(2015, 10, 1) // November = Q4
    const result = formatWithD3('%Y Q%q', date)
    expect(result).toContain('Q4')
  })
})

describe('tickPreview', () => {
  it('returns auto text for (automatic)', () => {
    expect(tickPreview('(automatic)')).toBe('auto — adapts to data')
  })

  it('returns null for (custom)', () => {
    expect(tickPreview('(custom)')).toBeNull()
  })

  it('returns sample dates for a known preset', () => {
    const result = tickPreview('YYYY')
    expect(result).toBeTruthy()
    expect(result).toContain('2015')
    expect(result).toContain('2016')
    expect(result).toContain('2017')
  })

  it('returns null for an unknown fmt key', () => {
    expect(tickPreview('unknown-fmt')).toBeNull()
  })

  it('returns previews for all presets with d3 strings', () => {
    const presetsWithD3 = PRESETS.filter(p => p.d3)
    for (const preset of presetsWithD3) {
      const result = tickPreview(preset.fmt)
      expect(result).toBeTruthy()
    }
  })
})

describe('presetToD3', () => {
  it('returns empty string for (automatic)', () => {
    expect(presetToD3('(automatic)')).toBe('')
  })

  it('returns correct d3 string for Year only', () => {
    expect(presetToD3('YYYY')).toBe('%Y')
  })

  it('returns correct d3 string for ISO 8601', () => {
    expect(presetToD3('YYYY-MM-DD')).toBe('%Y-%m-%d')
  })

  it('returns empty string for unknown fmt', () => {
    expect(presetToD3('unknown')).toBe('')
  })
})

describe('buildCustomPreview', () => {
  it('returns empty string for empty input', () => {
    expect(buildCustomPreview('')).toBe('')
  })

  it('returns formatted dates for valid d3 string', () => {
    const result = buildCustomPreview('%Y')
    expect(result).toContain('2015')
    expect(result).toContain('2017')
  })

  it('returns a string (not throwing) for any non-empty input', () => {
    // buildCustomPreview should never throw; fallback covers errors
    expect(() => buildCustomPreview('%Y')).not.toThrow()
    expect(() => buildCustomPreview('%B %-d')).not.toThrow()
  })
})

describe('buildDisplayValue', () => {
  it('returns (automatic) when model is empty', () => {
    expect(buildDisplayValue('', '(automatic)', '')).toBe('(automatic)')
  })

  it('returns preset label for known d3 value', () => {
    expect(buildDisplayValue('%Y', 'YYYY', '')).toBe('Year only')
  })

  it('returns customStr for (custom) preset', () => {
    expect(buildDisplayValue('%H:%M', '(custom)', '%H:%M')).toBe('%H:%M')
  })

  it('returns (custom) label when customStr is empty', () => {
    expect(buildDisplayValue('%H:%M', '(custom)', '')).toBe('(custom)')
  })

  it('returns model value when no matching preset', () => {
    expect(buildDisplayValue('%H:%M', '(automatic)', '')).toBe('%H:%M')
  })
})

describe('resolvePresetState', () => {
  it('returns (automatic) for empty string', () => {
    const state = resolvePresetState('')
    expect(state.selectedPreset).toBe('(automatic)')
    expect(state.customStr).toBe('')
  })

  it('returns matching preset for known d3 value', () => {
    const state = resolvePresetState('%Y')
    expect(state.selectedPreset).toBe('YYYY')
    expect(state.customStr).toBe('')
  })

  it('returns (custom) preset for unknown d3 value', () => {
    const state = resolvePresetState('%H:%M')
    expect(state.selectedPreset).toBe('(custom)')
    expect(state.customStr).toBe('%H:%M')
  })

  it('round-trips all PRESETS with d3 strings', () => {
    const presetsWithD3 = PRESETS.filter(p => p.d3)
    for (const preset of presetsWithD3) {
      const state = resolvePresetState(preset.d3!)
      expect(state.selectedPreset).toBe(preset.fmt)
      expect(state.customStr).toBe('')
    }
  })
})
