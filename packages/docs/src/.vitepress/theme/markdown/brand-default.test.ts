import { describe, it, expect } from 'vitest'
import { declaresPaletteOrTheme, injectBrandDefault } from './brand-default'

describe('declaresPaletteOrTheme', () => {
  it('detects an existing colorPalette property', () => {
    expect(declaresPaletteOrTheme('chart donut {\n  colorPalette = "Imperator"\n}')).toBe(true)
  })
  it('detects an existing theme property', () => {
    expect(declaresPaletteOrTheme('chart line {\n  theme = "blueprint-framed"\n}')).toBe(true)
  })
  it('returns false when neither is set', () => {
    expect(declaresPaletteOrTheme('chart bar-vertical {\n  title = "Hi"\n}')).toBe(false)
  })
  it('does not false-match a data key named theme', () => {
    expect(declaresPaletteOrTheme('chart bar-vertical {\n  data {\n    "theme park" = 5\n  }\n}')).toBe(false)
  })
})

describe('injectBrandDefault', () => {
  it('inserts theme and palette as the first properties of the chart block', () => {
    const out = injectBrandDefault('chart bar-vertical {\n  title = "Hi"\n  data {\n    "a" = 1\n  }\n}')
    expect(out).toContain('chart bar-vertical {\n  theme = "blueprint-bold"\n  colorPalette = "BlueprintBold"')
    expect(out).toContain('title = "Hi"')
  })
  it('produces source that now declares a palette/theme (idempotent guard)', () => {
    const once = injectBrandDefault('chart pie {\n  data {\n    "a" = 1\n  }\n}')
    expect(declaresPaletteOrTheme(once)).toBe(true)
  })
})
