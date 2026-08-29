import { describe, it, expect, afterEach } from 'vitest'
import { parse } from '../dsl/parser'
import { astToDefinition } from '../render/ast-to-definition'
import { renderChart } from '../render/render-chart'

afterEach(() => {
  document.body.innerHTML = ''
})

function categories(source: string): string[] {
  const host = document.createElement('div')
  document.body.appendChild(host)
  renderChart(host, astToDefinition(parse(source)))
  return [...host.querySelectorAll('.bc-axis-horizontal .tick text')].map(t => t.textContent ?? '')
}

const SORTED = (type: string) => `chart ${type} {
  transform sort {
    column = "value"
    direction = descending
  }
  data {
    "Alpha" = 12
    "Beta" = 41
    "Gamma" = 7
  }
}`

describe('a sort transform reaches every chart type (#54)', () => {
  it.each(['line', 'bar-vertical', 'column-stacked'])('sorts %s', (type) => {
    expect(categories(SORTED(type))).toEqual(['Beta', 'Alpha', 'Gamma'])
  })
})

describe('the registered sortMode default is honoured (#133)', () => {
  const MEDALS = (type: string) => `chart ${type} {
  data {
    series = "Gold","Silver"
    "France" = 4,3
    "USA" = 40,44
    "China" = 38,32
  }
}`

  it.each(['bar-multi', 'bar-grouped'])('%s sorts by total descending by default', (type) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    renderChart(host, astToDefinition(parse(MEDALS(type))))
    const labels = [...host.querySelectorAll('.bc-axis-vertical .tick text, .bc-axis-horizontal .tick text')]
      .map(t => t.textContent ?? '')
      .filter(t => ['France', 'USA', 'China'].includes(t))
    expect(labels).toEqual(['USA', 'China', 'France'])
  })
})
