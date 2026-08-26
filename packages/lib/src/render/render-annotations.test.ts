import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { renderBpc } from './render-bpc'

// #108: bar-grouped and bar-split never called the annotation plugin, so all
// three annotation kinds vanished with no console warning and no `.bc-annotations`
// group. No oracle covers a missing annotation, so presence is checked directly.
const ANNOTATED_TYPES = ['bar-vertical', 'bar-multi', 'bar-stacked', 'column-stacked', 'bar-grouped', 'bar-split']

function annotated(type: string): string {
  return `chart ${type} {
  data {
    series = "A","B"
    "Alpha" = 10,5
    "Beta" = 20,7
  }
  annotation "Alpha" {
    text = "point"
    showLine = true
  }
  range {
    start = "Alpha"
    end = "Beta"
    text = "band"
  }
  note {
    text = "free"
    x = 10
    y = 10
  }
}`
}

describe('every bar type renders the annotations it is given', () => {
  let container: HTMLElement

  beforeAll(() => {
    // jsdom does not implement SVGElement.getBBox; the annotation plugin calls it.
    ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  for (const type of ANNOTATED_TYPES) {
    it(`${type}: point, range and free annotations all reach the DOM`, () => {
      renderBpc(container, annotated(type))
      expect(container.querySelector('.bc-annotations'), 'point/free group').not.toBeNull()
      expect(container.querySelector('.bc-annotation-range'), 'range band').not.toBeNull()
      const texts = [...container.querySelectorAll('.bc-annotation-text')].map(t => t.textContent)
      expect(texts).toContain('point')
      expect(texts).toContain('free')
    })
  }
})
