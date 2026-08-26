import { describe, it, expect } from 'vitest'
import { CHART_CSS } from './chart-css'

describe('CHART_CSS blueprint-bold theme', () => {
  it('is light/dark responsive: adds no canvas override in light mode', () => {
    // The only blueprint-bold rule is dark-scoped; light mode inherits the
    // default white canvas. So there is no unscoped (light) rule.
    expect(CHART_CSS).not.toMatch(/\n\.bc-frame\.bc-theme-blueprint-bold\s*\{/)
  })

  it('renders on a black brand canvas in dark mode (overriding the base dark frame default)', () => {
    expect(CHART_CSS).toMatch(/\[data-bs-theme="dark"\]\s*\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-frame-bg:\s*#000000/)
  })

  it('uses white-family grid, axis and text colours on the dark canvas', () => {
    expect(CHART_CSS).toMatch(/\[data-bs-theme="dark"\]\s*\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-grid-color:\s*rgba\(255, ?255, ?255/)
    expect(CHART_CSS).toMatch(/\[data-bs-theme="dark"\]\s*\.bc-frame\.bc-theme-blueprint-bold\s*\{[^}]*--bc-text-color:\s*rgba\(255, ?255, ?255/)
  })

  it('qualifies the dark selector with .bc-frame so it outranks the base dark frame default', () => {
    expect(CHART_CSS).toContain('.bc-frame.bc-theme-blueprint-bold')
  })
})

describe('CHART_CSS frame text colour', () => {
  it('ties .bc-frame color to --bc-text-color so currentColor value labels follow the theme', () => {
    expect(CHART_CSS).toMatch(/\.bc-frame\s*\{[^}]*\bcolor:\s*var\(--bc-text-color/)
  })
})

describe('CHART_CSS bc-theme-dark (#65)', () => {
  it('gives the bc-theme-dark class toHtml() emits a matching rule', () => {
    expect(CHART_CSS).toMatch(/\.bc-frame\.bc-theme-dark\s*\{[^}]*--bc-frame-bg:\s*#1c1c1c/)
    expect(CHART_CSS).toMatch(/\.bc-frame\.bc-theme-dark\s*\{[^}]*--bc-text-color:\s*rgba\(255, ?255, ?255/)
  })
})

describe('CHART_CSS constrained-height layout (#66)', () => {
  it('carries the frame rule that makes heightMode work', () => {
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s*\{[^}]*position:\s*relative/)
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s*\{[^}]*overflow:\s*hidden/)
  })

  it('pins the body over the full frame', () => {
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s+\.bc-frame-body\s*\{[^}]*position:\s*absolute/)
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s+\.bc-frame-body\s*\{[^}]*inset:\s*0/)
  })

  it('floats the header, note and footer above the body', () => {
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s+\.bc-frame-header\s*\{[^}]*z-index:\s*1/)
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s+\.bc-frame-footer\s*\{[^}]*z-index:\s*1/)
    expect(CHART_CSS).toMatch(/\.bc-frame--constrained\s+\.bc-frame-note\s*\{[^}]*z-index:\s*1/)
  })
})
