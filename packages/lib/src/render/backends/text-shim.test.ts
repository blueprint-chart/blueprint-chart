import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { installTextShim } from './text-shim'

describe('installTextShim', () => {
  it('makes SVG text elements report a realistic, non-zero width', () => {
    const dom = new JSDOM('<!DOCTYPE html><svg><text>Hello</text></svg>')
    installTextShim(dom.window as unknown as Parameters<typeof installTextShim>[0])
    const text = dom.window.document.querySelector('text') as unknown as { textContent: string | null, getComputedTextLength: () => number }
    text.textContent = 'Hello'
    expect(text.getComputedTextLength()).toBeGreaterThan(0)
    dom.window.close()
  })
})
