import { describe, it, expect } from 'vitest'
import { CHART_CSS } from './chart-css'

describe('CHART_CSS blueprint-bold theme', () => {
  it('renders on a black brand canvas in light mode', () => {
    expect(CHART_CSS).toContain('.bc-theme-blueprint-bold')
    expect(CHART_CSS).toMatch(/\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-frame-bg:\s*#000000/)
  })

  it('keeps the black canvas in dark mode (overriding the base dark frame default)', () => {
    expect(CHART_CSS).toMatch(/\[data-bs-theme="dark"\]\s*\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-frame-bg:\s*#000000/)
  })

  it('uses white-family grid and text colours so marks read on the dark canvas', () => {
    expect(CHART_CSS).toMatch(/\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-grid-color:\s*rgba\(255, ?255, ?255/)
    expect(CHART_CSS).toMatch(/\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-text-color:\s*rgba\(255, ?255, ?255/)
  })

  it('qualifies the light-mode selector with .bc-frame so it outranks the base frame default', () => {
    expect(CHART_CSS).toContain('.bc-frame.bc-theme-blueprint-bold')
  })
})
