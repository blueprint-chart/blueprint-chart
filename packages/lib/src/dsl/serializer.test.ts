import { describe, expect, it } from 'vitest'
import { parse } from './parser'
import { serialize } from './serializer'
import type { ChartNode } from './types'

function minimalAst(overrides: Partial<ChartNode> = {}): ChartNode {
  return {
    type: 'chart',
    chartType: 'bar',
    properties: [],
    data: null,
    highlights: [],
    areaFills: [],
    annotations: [],
    series: [],
    steps: [],
    ...overrides,
  }
}

describe('serializer basic', () => {
  it('serializes a minimal chart', () => {
    expect(serialize(minimalAst())).toBe('chart bar {\n}')
  })

  it('serializes properties', () => {
    const ast = minimalAst({
      properties: [
        { type: 'property', key: 'title', value: 'Hello', isPercentage: false },
        { type: 'property', key: 'sort', value: 'descending', isPercentage: false },
      ],
    })
    const output = serialize(ast)
    expect(output).toContain('  title = Hello')
    expect(output).toContain('  sort = descending')
  })
})

describe('serializer data', () => {
  it('serializes data with percentages', () => {
    const ast = minimalAst({
      data: {
        type: 'data',
        entries: [
          { type: 'property', key: 'Item A', value: 50, isPercentage: true },
          { type: 'property', key: 'count', value: 42, isPercentage: false },
        ],
      },
    })
    const output = serialize(ast)
    expect(output).toContain('    "Item A" = 50%')
    expect(output).toContain('    count = 42')
  })
})

describe('serializer highlights', () => {
  it('serializes highlights', () => {
    const ast = minimalAst({
      highlights: [{
        type: 'highlight',
        target: 'Guardian',
        properties: [
          { type: 'property', key: 'color', value: '#e53e3e', isPercentage: false },
          { type: 'property', key: 'label', value: 'Leader', isPercentage: false },
        ],
      }],
    })
    const output = serialize(ast)
    expect(output).toContain('  highlight "Guardian" {')
    expect(output).toContain('    color = "#e53e3e"')
    expect(output).toContain('    label = Leader')
  })
})

const STEP_AST = minimalAst({
  steps: [{
    type: 'step',
    name: 'Step 1',
    properties: [
      { type: 'property', key: 'sort', value: 'ascending', isPercentage: false },
    ],
    data: null,
    highlights: [{
      type: 'highlight',
      target: 'X',
      properties: [
        { type: 'property', key: 'color', value: '#f00', isPercentage: false },
      ],
    }],
    areaFills: [],
    annotations: [],
  }],
})

describe('serializer steps', () => {
  it('serializes steps', () => {
    const output = serialize(STEP_AST)
    expect(output).toContain('  step "Step 1" {')
    expect(output).toContain('    sort = ascending')
    expect(output).toContain('    highlight "X" {')
    expect(output).toContain('      color = "#f00"')
  })
})

const SIMPLE_CHART_RT = `chart horizontal-bar {
  title = "Couverture médiatique"
  sort = descending
  data {
    "20 Minutes" = 61.11%
    "BFMTV" = 53.85%
    "Guardian" = 44.44%
    "LeMonde" = 75%
  }
  highlight "Guardian" {
    color = "#e53e3e"
    label = "Leader"
  }
}`

const CHART_WITH_STEPS_RT = `chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending
  data {
    "20 Minutes" = 61%
    "BFMTV" = 53%
    "Guardian" = 44%
    "LeMonde" = 75%
  }
  step "Le leader" {
    sort = descending
    highlight "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }
  step "Le moins bon" {
    sort = ascending
    highlight "Guardian" {
      color = "#45a"
      label = "Le pire"
    }
  }
  step "Année suivante" {
    title = "Couverture médiatique en 2026"
    data {
      "20 Minutes" = 51%
      "BFMTV" = 73%
      "Guardian" = 84%
      "LeMonde" = 25%
    }
  }
}`

describe('serializer simple chart round-trip', () => {
  it('produces equivalent AST after round-trip', () => {
    const ast1 = parse(SIMPLE_CHART_RT)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2).toEqual(ast1)
  })
})

describe('serializer complex chart round-trip', () => {
  it('produces equivalent AST after round-trip for chart with steps', () => {
    const ast1 = parse(CHART_WITH_STEPS_RT)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2).toEqual(ast1)
  })

  it('produces stable output after double round-trip', () => {
    const ast1 = parse(CHART_WITH_STEPS_RT)
    const s1 = serialize(ast1)
    const ast2 = parse(s1)
    const s2 = serialize(ast2)
    expect(s2).toBe(s1)
  })
})
