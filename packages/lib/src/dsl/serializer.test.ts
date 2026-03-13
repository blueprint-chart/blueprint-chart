import { describe, expect, it } from 'vitest'
import { parse } from './parser'
import { serialize } from './serializer'
import type { ChartNode } from './types'

describe('serializer', () => {
  it('serializes a minimal chart', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    expect(serialize(ast)).toBe('chart bar {\n}')
  })

  it('serializes properties', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [
        { type: 'property', key: 'title', value: 'Hello', isPercentage: false },
        { type: 'property', key: 'sort', value: 'descending', isPercentage: false },
      ],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  title = Hello')
    expect(output).toContain('  sort = descending')
  })

  it('serializes data with percentages', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: {
        type: 'data',
        entries: [
          { type: 'property', key: 'Item A', value: 50, isPercentage: true },
          { type: 'property', key: 'count', value: 42, isPercentage: false },
        ],
      },
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('    "Item A" = 50%')
    expect(output).toContain('    count = 42')
  })

  it('serializes highlights', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [{
        type: 'highlight',
        target: 'Guardian',
        properties: [
          { type: 'property', key: 'color', value: '#e53e3e', isPercentage: false },
          { type: 'property', key: 'label', value: 'Leader', isPercentage: false },
        ],
      }],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  highlight "Guardian" {')
    expect(output).toContain('    color = "#e53e3e"')
    expect(output).toContain('    label = Leader')
  })

  it('serializes scenes', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: 'Scene 1',
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
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  scene "Scene 1" {')
    expect(output).toContain('    sort = ascending')
    expect(output).toContain('    highlight "X" {')
    expect(output).toContain('      color = "#f00"')
  })

  it('serializes scene with null name', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: null,
        properties: [
          { type: 'property', key: 'title', value: 'unnamed', isPercentage: false },
        ],
        data: null,
        highlights: [],
        areaFills: [],
        annotations: [],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  scene {')
    expect(output).not.toContain('scene ""')
  })

  it('serializes scene with series and transforms', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: 'Overlay',
        properties: [],
        data: null,
        highlights: [],
        areaFills: [],
        annotations: [],
        series: [{
          type: 'series',
          name: 'Revenue',
          properties: [
            { type: 'property', key: 'color', value: '#00f', isPercentage: false },
          ],
        }],
        transforms: [{
          type: 'transform',
          transformType: 'cumulative',
          properties: [
            { type: 'property', key: 'enabled', value: 'true', isPercentage: false },
          ],
        }],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  scene "Overlay" {')
    expect(output).toContain('    series "Revenue" {')
    expect(output).toContain('      color = "#00f"')
    expect(output).toContain('    transform cumulative {')
    expect(output).toContain('      enabled = true')
  })

  it('serializes annotation with id property', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [{
        type: 'annotation',
        kind: 'point',
        target: 'X',
        properties: [
          { type: 'property', key: 'id', value: 'abc', isPercentage: false },
          { type: 'property', key: 'label', value: 'My point', isPercentage: false },
        ],
      }],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('id = abc')
  })

  it('serializes hide_annotation in scene', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: null,
        properties: [],
        data: null,
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: 'annotation-visibility', action: 'hide', kind: 'point', id: 'abc' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('hide_annotation "abc"')
  })

  it('serializes show_annotation in scene', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: null,
        properties: [],
        data: null,
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: 'annotation-visibility', action: 'show', kind: 'point', id: 'xyz' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('show_annotation "xyz"')
  })

  it('serializes hide_range and show_range in scene', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: null,
        properties: [],
        data: null,
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: 'annotation-visibility', action: 'hide', kind: 'range', id: 'r1' },
          { type: 'annotation-visibility', action: 'show', kind: 'range', id: 'r2' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('hide_range "r1"')
    expect(output).toContain('show_range "r2"')
  })

  it('serializes hide_note and show_note in scene', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: null,
        properties: [],
        data: null,
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: 'annotation-visibility', action: 'hide', kind: 'free', id: 'n1' },
          { type: 'annotation-visibility', action: 'show', kind: 'free', id: 'n2' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('hide_note "n1"')
    expect(output).toContain('show_note "n2"')
  })

  it('round-trips annotation visibility through parse and serialize', () => {
    const dsl = `chart bar {
  scene "Test" {
    hide_annotation "a1"
    show_range "r1"
    hide_note "n1"
  }
}`
    const ast1 = parse(dsl)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2.scenes[0].annotationVisibility).toEqual(ast1.scenes[0].annotationVisibility)
  })

  it('serializes multi-value data entries', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar-multi',
      properties: [],
      data: {
        type: 'data',
        entries: [
          { type: 'property', key: '_series', value: 'Gold', isPercentage: false, values: ['Gold', 'Silver', 'Bronze'] },
          { type: 'property', key: 'USA', value: 40, isPercentage: false, values: [40, 44, 42] },
        ],
      },
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('_series = "Gold","Silver","Bronze"')
    expect(output).toContain('"USA" = 40,44,42')
  })

  it('round-trips multi-value data entries', () => {
    const dsl = `chart bar-multi {
  data {
    _series = "Gold","Silver","Bronze"
    "USA" = 40,44,42
    "China" = -2.8,3.2,18
  }
}`
    const ast1 = parse(dsl)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2).toEqual(ast1)
  })

  it('serializes areafill blocks', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line-multi',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [{
        type: 'areafill',
        from: 'Revenue',
        to: 'Cost',
        properties: [
          { type: 'property', key: 'color', value: '#0000ff', isPercentage: false },
          { type: 'property', key: 'opacity', value: 0.3, isPercentage: false },
        ],
      }],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  areafill "Revenue" "Cost" {')
    expect(output).toContain('    color = "#0000ff"')
    expect(output).toContain('    opacity = 0.3')
  })

  it('serializes range annotation', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [{
        type: 'annotation',
        kind: 'range',
        properties: [
          { type: 'property', key: 'start', value: 2, isPercentage: false },
          { type: 'property', key: 'end', value: 5, isPercentage: false },
        ],
      }],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  range {')
    expect(output).toContain('    start = 2')
    expect(output).toContain('    end = 5')
  })

  it('serializes note (free) annotation', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [{
        type: 'annotation',
        kind: 'free',
        properties: [
          { type: 'property', key: 'text', value: 'Important note', isPercentage: false },
          { type: 'property', key: 'x', value: 50, isPercentage: true },
          { type: 'property', key: 'y', value: 25, isPercentage: true },
        ],
      }],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  note {')
    expect(output).toContain('    x = 50%')
    expect(output).toContain('    y = 25%')
  })

  it('serializes series blocks at chart level', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line-multi',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [
        {
          type: 'series',
          name: 'Revenue',
          properties: [
            { type: 'property', key: 'color', value: '#e15759', isPercentage: false },
            { type: 'property', key: 'lineWidth', value: 3, isPercentage: false },
          ],
        },
      ],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  series "Revenue" {')
    expect(output).toContain('    color = "#e15759"')
    expect(output).toContain('    lineWidth = 3')
  })

  it('serializes transform blocks at chart level', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [{
        type: 'transform',
        transformType: 'rolling-average',
        properties: [
          { type: 'property', key: 'window', value: 7, isPercentage: false },
        ],
      }],
    }
    const output = serialize(ast)
    expect(output).toContain('  transform rolling-average {')
    expect(output).toContain('    window = 7')
  })

  it('quotes string values containing special characters', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [
        { type: 'property', key: 'title', value: 'Hello World', isPercentage: false },
      ],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  title = "Hello World"')
  })

  it('does not quote simple identifier values', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [
        { type: 'property', key: 'sort', value: 'descending', isPercentage: false },
      ],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  sort = descending')
  })

  it('quotes hash color values', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [],
      data: null,
      highlights: [{
        type: 'highlight',
        target: 'X',
        properties: [
          { type: 'property', key: 'color', value: '#ff0000', isPercentage: false },
        ],
      }],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('color = "#ff0000"')
  })

  it('escapes quotes and backslashes in values', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'bar',
      properties: [
        { type: 'property', key: 'title', value: 'say "hello"', isPercentage: false },
        { type: 'property', key: 'path', value: 'C:\\Users', isPercentage: false },
      ],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('title = "say \\"hello\\""')
    expect(output).toContain('path = "C:\\\\Users"')
  })

  it('serializes scene with areafill and annotations', () => {
    const ast: ChartNode = {
      type: 'chart',
      chartType: 'line',
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
      scenes: [{
        type: 'scene',
        name: 'Full',
        properties: [],
        data: null,
        highlights: [],
        areaFills: [{
          type: 'areafill',
          from: 'A',
          to: 'B',
          properties: [{ type: 'property', key: 'color', value: '#abc', isPercentage: false }],
        }],
        annotations: [
          { type: 'annotation', kind: 'range', properties: [{ type: 'property', key: 'start', value: 1, isPercentage: false }] },
          { type: 'annotation', kind: 'free', properties: [{ type: 'property', key: 'text', value: 'Note', isPercentage: false }] },
        ],
        annotationVisibility: [],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('    areafill "A" "B" {')
    expect(output).toContain('    range {')
    expect(output).toContain('    note {')
  })

  describe('round-trip', () => {
    const SIMPLE_CHART = `chart horizontal-bar {
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

    it('produces equivalent AST after round-trip', () => {
      const ast1 = parse(SIMPLE_CHART)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2).toEqual(ast1)
    })

    const CHART_WITH_SCENES = `chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending
  data {
    "20 Minutes" = 61%
    "BFMTV" = 53%
    "Guardian" = 44%
    "LeMonde" = 75%
  }
  scene "Le leader" {
    sort = descending
    highlight "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }
  scene "Le moins bon" {
    sort = ascending
    highlight "Guardian" {
      color = "#45a"
      label = "Le pire"
    }
  }
  scene "Année suivante" {
    title = "Couverture médiatique en 2026"
    data {
      "20 Minutes" = 51%
      "BFMTV" = 73%
      "Guardian" = 84%
      "LeMonde" = 25%
    }
  }
}`

    it('produces equivalent AST after round-trip for chart with scenes', () => {
      const ast1 = parse(CHART_WITH_SCENES)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2).toEqual(ast1)
    })

    it('produces stable output after double round-trip', () => {
      const ast1 = parse(CHART_WITH_SCENES)
      const s1 = serialize(ast1)
      const ast2 = parse(s1)
      const s2 = serialize(ast2)
      expect(s2).toBe(s1)
    })

    it('round-trips areafill blocks', () => {
      const dsl = `chart line-multi {
  areafill "Revenue" "Cost" {
    color = "#0000ff"
    opacity = 0.3
  }
}`
      const ast1 = parse(dsl)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2.areaFills).toEqual(ast1.areaFills)
    })

    it('round-trips all annotation types', () => {
      const dsl = `chart line {
  annotation "Q3" {
    text = "Peak"
    anchorDirection = NE
  }
  range {
    start = 2
    end = 5
  }
  note {
    text = "Note"
    x = 50%
    y = 25%
  }
}`
      const ast1 = parse(dsl)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2.annotations).toEqual(ast1.annotations)
    })

    it('round-trips series and transforms', () => {
      const dsl = `chart line-multi {
  series "Revenue" {
    color = "#e15759"
    lineWidth = 3
  }
  transform rolling-average {
    window = 7
  }
}`
      const ast1 = parse(dsl)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2.series).toEqual(ast1.series)
      expect(ast2.transforms).toEqual(ast1.transforms)
    })

    it('round-trips a complex chart with all block types', () => {
      const dsl = `chart line-multi {
  title = "Full chart"
  data {
    _series = "A","B"
    "2020" = 10,20
  }
  highlight "2020" {
    color = "#e53e3e"
  }
  areafill "A" "B" {
    color = "#0000ff"
  }
  annotation "2020" {
    text = "Start"
  }
  range {
    start = 0
    end = 1
  }
  note {
    text = "Note"
    x = 50
    y = 50
  }
  series "A" {
    color = "#ff0000"
  }
  scene "First" {
    title = "Scene one"
    highlight "2020" {
      color = "#00ff00"
    }
  }
  transform rolling-average {
    window = 3
  }
}`
      const ast1 = parse(dsl)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2).toEqual(ast1)
    })
  })
})
