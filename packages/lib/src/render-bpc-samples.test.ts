import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { samples } from './samples'
import { renderBpc } from './render'

describe('renderBpc samples parity', () => {
  beforeAll(() => {
    // jsdom does not implement SVGElement.getBBox. The annotation plugin calls
    // it directly; stub at prototype level so all sample charts can render.
    ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
  })

  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  for (const sample of samples) {
    it(`renders sample "${sample.id}" without throwing`, () => {
      expect(() => renderBpc(container, sample.dsl)).not.toThrow()
      expect(container.querySelector('svg')).not.toBeNull()
    })
  }
})
