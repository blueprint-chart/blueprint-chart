import { describe, it, expect, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { installTextShim } from '../render/backends/text-shim'
import { measureTextWidth, measureMaxTextWidth } from './text-measure'

describe('measureTextWidth', () => {
  it('scales with the font size', () => {
    expect(measureTextWidth('Hello', 20)).toBeGreaterThan(measureTextWidth('Hello', 10))
  })

  it('returns 0 for an empty string', () => {
    expect(measureTextWidth('', 12)).toBe(0)
  })

  it('grows with the character count', () => {
    expect(measureTextWidth('aaaaaaaaaa', 12)).toBeGreaterThan(measureTextWidth('aaaaa', 12))
  })

  it('gives a CJK label about twice the width of the same count of Latin characters', () => {
    const cjk = measureTextWidth('日本語のラベル', 12)
    const latin = measureTextWidth('abcdefg', 12)
    expect(cjk).toBeGreaterThan(latin * 1.5)
  })
})

describe('measureMaxTextWidth', () => {
  it('returns 0 for no labels', () => {
    expect(measureMaxTextWidth([], 12)).toBe(0)
  })

  it('returns the widest label, not the last', () => {
    const labels = ['a very long label indeed', 'x']
    expect(measureMaxTextWidth(labels, 12)).toBe(measureTextWidth(labels[0], 12))
  })
})

describe('measureTextWidth on the node backend', () => {
  const realDocument = globalThis.document

  afterEach(() => {
    Object.defineProperty(globalThis, 'document', { value: realDocument, configurable: true, writable: true })
  })

  /** The node backend has no 2D canvas; its measurement comes from the jsdom text shim. */
  function withShimmedJsdom(fn: () => void): void {
    const dom = new JSDOM('<!DOCTYPE html><body></body>')
    installTextShim(dom.window as unknown as Parameters<typeof installTextShim>[0])
    Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true, writable: true })
    try {
      fn()
    }
    finally {
      dom.window.close()
    }
  }

  it('measures per glyph, not per character', () => {
    withShimmedJsdom(() => {
      expect(globalThis.document.createElement('canvas').getContext('2d')).toBeNull()
      expect(measureTextWidth('WWWWWWWWWW', 12)).toBeGreaterThan(measureTextWidth('iiiiiiiiii', 12) * 1.5)
    })
  })

  it('still reserves the full width for CJK, whose glyphs the bundled font lacks', () => {
    withShimmedJsdom(() => {
      expect(measureTextWidth('日本語のラベル', 12)).toBeGreaterThan(measureTextWidth('abcdefg', 12) * 1.5)
    })
  })
})
