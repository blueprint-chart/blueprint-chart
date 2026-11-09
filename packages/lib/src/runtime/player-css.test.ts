import { describe, it, expect } from 'vitest'
import { PLAYER_CSS } from './player-css'

const TOKENS = ['text', 'muted', 'border', 'border-hover', 'background-hover', 'track', 'accent', 'accent-hover']

describe('PLAYER_CSS', () => {
  it.each(['[data-bs-theme="dark"] .bc-frame', '.bc-frame.bc-theme-dark'])('defines every dark token under %s', (selector) => {
    const escaped = selector.replace(/[.[\]"]/g, m => `\\${m}`)
    const block = PLAYER_CSS.match(new RegExp(`${escaped}[^{]*\\{([^}]*)\\}`))?.[1] ?? ''
    for (const token of TOKENS) {
      expect(block).toMatch(new RegExp(`--bc-scene-player-${token}:`))
    }
  })

  it('stops the page-level dark tokens at a light section nested in a dark page', () => {
    expect(PLAYER_CSS).toContain('[data-bs-theme="dark"] .bc-frame:not([data-bs-theme="dark"] [data-bs-theme="light"] *) {')
  })

  it('declares tokens only in the two dark rules, so light mode keeps the fallbacks', () => {
    expect(PLAYER_CSS.match(/--bc-scene-player-text:/g)).toHaveLength(2)
  })

  it('gives every Bootstrap and duration variable a fallback', () => {
    expect(PLAYER_CSS).not.toMatch(/var\(--bs-[\w-]+\)/)
    expect(PLAYER_CSS).not.toMatch(/var\(--bc-duration-[\w-]+\)/)
    expect(PLAYER_CSS).toContain('var(--bs-font-size-sm, 0.875rem)')
    expect(PLAYER_CSS).toContain('var(--bs-font-size-xs, 0.75rem)')
    expect(PLAYER_CSS).toContain('var(--bc-duration-base, 150ms)')
    expect(PLAYER_CSS).toContain('var(--bc-duration-slow, 250ms)')
  })

  it('scopes the play button size per player', () => {
    expect(PLAYER_CSS).toMatch(/\.bc-scene-player--dot-stepper \.bc-scene-player__play-btn\s*\{[^}]*width: 30px/)
    expect(PLAYER_CSS).toMatch(/\.bc-scene-player--minimal-arrows \.bc-scene-player__play-btn\s*\{[^}]*width: 26px/)
    expect(PLAYER_CSS).toMatch(/\.bc-scene-player--progress-bar \.bc-scene-player__play-btn\s*\{[^}]*width: 28px/)
  })

  it('turns transitions off for reduced motion', () => {
    expect(PLAYER_CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.bc-scene-player[^{]*\{[^}]*transition: none/)
  })
})
