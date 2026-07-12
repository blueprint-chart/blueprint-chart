import { describe, it, expect } from 'vitest'
import { applyBrandLook } from './brand-look'

describe('applyBrandLook', () => {
  it('injects the brand theme, palette and transparent background as the first chart properties', () => {
    const out = applyBrandLook('chart bar-vertical {\n  title = "Hi"\n  data {\n    "a" = 1\n  }\n}')
    expect(out).toContain('chart bar-vertical {\n  theme = "blueprint-bold"\n  colorPalette = "BlueprintBold"\n  transparentBackground = true')
    expect(out).toContain('title = "Hi"')
  })

  it('removes the sample\'s own colorPalette so the brand palette is the only one', () => {
    const out = applyBrandLook('chart bar-vertical {\n  colorPalette = "Harvey"\n  data {\n    "a" = 1\n  }\n}')
    expect(out).not.toContain('Harvey')
    expect(out).toContain('colorPalette = "BlueprintBold"')
    // exactly one colorPalette line remains
    expect(out.match(/colorPalette\s*=/g)).toHaveLength(1)
  })

  it('removes an author colors line too', () => {
    const out = applyBrandLook('chart line {\n  colors = "#f00","#0f0"\n  data {\n    "a" = 1\n  }\n}')
    expect(out).not.toContain('#f00')
    expect(out).toContain('colorPalette = "BlueprintBold"')
  })

  it('leaves scene series selectors intact', () => {
    const out = applyBrandLook('chart area-stacked {\n  colorPalette = "Enara"\n  scene "x" {\n    series = "A","B"\n  }\n}')
    expect(out).toContain('series = "A","B"')
    expect(out).not.toContain('Enara')
  })
})
