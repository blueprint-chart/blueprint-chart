import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
// Importing the runtime entry has a side effect: it calls initBlueprint() on
// load. Under jsdom document.readyState is 'complete', so it runs immediately,
// finds no blueprint script tags, and does nothing. That is fine for this test.
import { renderBpc } from './index'

describe('runtime entry', () => {
  beforeAll(() => {
    // jsdom does not implement SVGElement.getBBox. The annotation plugin calls
    // it directly; stub at prototype level so all sample charts can render.
    ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
  })

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('re-exports renderBpc so the IIFE global can render inside an iframe', () => {
    expect(typeof renderBpc).toBe('function')
  })

  it('renderBpc renders an SVG into a container', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    renderBpc(el, 'chart bar-vertical { data { "A" = 10 } }')
    expect(el.querySelector('svg')).not.toBeNull()
  })
})
