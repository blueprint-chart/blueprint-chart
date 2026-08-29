import { describe, it, expect, beforeEach } from 'vitest'
import { renderBpc } from './render-bpc'

// #22: a label is every consumer's row identity — band-scale domains, data-join
// keys, `labels.indexOf(...)` lookups — so a repeated label used to cost the
// row: four data rows in, two bars out, with no error, warning or visual cue.
// The realistic trigger is pasting a table with a repeated key.
const FOUR_ROWS_THREE_ALPHAS = `
  data {
    "Alpha" = 42
    "Alpha" = 17
    "Beta" = 63
    "Alpha" = 8
  }
}`

function positions(container: HTMLElement, attr: string): number[] {
  return [...container.querySelectorAll('.bc-bar')].map(bar => Number(bar.getAttribute(attr)))
}

describe('a data row is never dropped for sharing its label', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('bar-vertical: gives each of the four rows its own column', () => {
    renderBpc(container, `chart bar-vertical {\n  valueLabels = true\n${FOUR_ROWS_THREE_ALPHAS}`)
    expect(positions(container, 'x')).toHaveLength(4)
    expect(new Set(positions(container, 'x')).size).toBe(4)
    expect([...container.querySelectorAll('.bc-value-label')].map(l => l.textContent))
      .toEqual(['42', '17', '63', '8'])
  })

  it('bar-horizontal: gives each of the four rows its own bar', () => {
    renderBpc(container, `chart bar-horizontal {\n  valueLabels = true\n${FOUR_ROWS_THREE_ALPHAS}`)
    expect(new Set(positions(container, 'y')).size).toBe(4)
    expect([...container.querySelectorAll('.bc-value-label')].map(l => l.textContent))
      .toEqual(['42', '17', '63', '8'])
  })

  it('numbers the repeats on the category axis so the author sees the duplication', () => {
    renderBpc(container, `chart bar-vertical {\n${FOUR_ROWS_THREE_ALPHAS}`)
    expect([...container.querySelectorAll('.bc-axis-horizontal .tick text')].map(t => t.textContent))
      .toEqual(['Alpha', 'Alpha (2)', 'Beta', 'Alpha (3)'])
  })

  it('keeps every cell of a multi-series row that repeats a label', () => {
    renderBpc(container, `chart bar-grouped {
  data {
    series = "A","B"
    "Alpha" = 1,2
    "Alpha" = 3,4
  }
}`)
    expect(container.querySelectorAll('.bc-bar')).toHaveLength(4)
    // Order is the renderer's business (sortMode may reorder); what #22 is about
    // is that neither row is dropped for sharing a label.
    expect([...container.querySelectorAll('.bc-axis-vertical .tick text')].map(t => t.textContent).sort())
      .toEqual(['Alpha', 'Alpha (2)'])
  })
})
