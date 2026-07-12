import { describe, it, expect } from 'vitest'
import { CHART_CSS } from './chart-css'

describe('CHART_CSS blueprint-bold theme', () => {
  it('defines the blueprint canvas as the light-mode frame background', () => {
    expect(CHART_CSS).toContain('.bc-theme-blueprint-bold')
    expect(CHART_CSS).toMatch(/\.bc-theme-blueprint-bold\s*\{[^}]*--bc-frame-bg:\s*#244a7c/)
  })

  it('switches the frame background to black in dark mode', () => {
    expect(CHART_CSS).toMatch(/\[data-bs-theme="dark"\]\s*\.bc-theme-blueprint-bold\s*\{[^}]*--bc-frame-bg:\s*#000000/)
  })

  it('uses white-family grid and text colours so marks read on the dark canvas', () => {
    expect(CHART_CSS).toMatch(/\.bc-theme-blueprint-bold\s*\{[^}]*--bc-grid-color:\s*rgba\(255, ?255, ?255/)
    expect(CHART_CSS).toMatch(/\.bc-theme-blueprint-bold\s*\{[^}]*--bc-text-color:\s*rgba\(255, ?255, ?255/)
  })
})
