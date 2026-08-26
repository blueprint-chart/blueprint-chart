import { describe, expect, it } from 'vitest'
import { DslNodeType, AnnotationKind, ChartType } from '../enums'
import { parse } from './parser'
import { serialize, compactSerialize, compactSerializeDeep } from './serializer'
import type { ChartNode } from './types'

describe('serializer', () => {
  it('serializes a minimal chart', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
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
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [
        { type: DslNodeType.Property, key: 'title', value: 'Hello', isPercentage: false },
        { type: DslNodeType.Property, key: 'sort', value: 'descending', isPercentage: false },
      ],
      data: null,
      colorizes: [],
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
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: {
        type: DslNodeType.Data,
        entries: [
          { type: DslNodeType.Property, key: 'Item A', value: 50, isPercentage: true },
          { type: DslNodeType.Property, key: 'count', value: 42, isPercentage: false },
        ],
      },
      colorizes: [],
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

  it('serializes colorizes', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [{
        type: DslNodeType.Colorize,
        target: 'Guardian',
        properties: [
          { type: DslNodeType.Property, key: 'color', value: '#e53e3e', isPercentage: false },
          { type: DslNodeType.Property, key: 'label', value: 'Leader', isPercentage: false },
        ],
      }],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  colorize "Guardian" {')
    expect(output).toContain('    color = "#e53e3e"')
    expect(output).toContain('    label = Leader')
  })

  it('serializes scenes', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: 'Scene 1',
        properties: [
          { type: DslNodeType.Property, key: 'sort', value: 'ascending', isPercentage: false },
        ],
        data: null,
        colorizes: [{
          type: DslNodeType.Colorize,
          target: 'X',
          properties: [
            { type: DslNodeType.Property, key: 'color', value: '#f00', isPercentage: false },
          ],
        }],
        highlights: [],
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
    expect(output).toContain('    colorize "X" {')
    expect(output).toContain('      color = "#f00"')
  })

  it('serializes scene with null name', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: null,
        properties: [
          { type: DslNodeType.Property, key: 'title', value: 'unnamed', isPercentage: false },
        ],
        data: null,
        colorizes: [],
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
      type: DslNodeType.Chart,
      chartType: ChartType.Line,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: 'Overlay',
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],

        series: [{
          type: DslNodeType.Series,
          name: 'Revenue',
          properties: [
            { type: DslNodeType.Property, key: 'color', value: '#00f', isPercentage: false },
          ],
        }],
        transforms: [{
          type: DslNodeType.Transform,
          transformType: 'cumulative',
          properties: [
            { type: DslNodeType.Property, key: 'enabled', value: 'true', isPercentage: false },
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
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [{
        type: DslNodeType.Annotation,
        kind: AnnotationKind.Point,
        target: 'X',
        properties: [
          { type: DslNodeType.Property, key: 'id', value: 'abc', isPercentage: false },
          { type: DslNodeType.Property, key: 'label', value: 'My point', isPercentage: false },
        ],
      }],

      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('id = abc')
  })

  it('serializes multi-value data entries', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: ChartType.BarMulti,
      properties: [],
      data: {
        type: DslNodeType.Data,
        entries: [
          { type: DslNodeType.Property, key: 'series', value: 'Gold', isPercentage: false, values: ['Gold', 'Silver', 'Bronze'] },
          { type: DslNodeType.Property, key: 'USA', value: 40, isPercentage: false, values: [40, 44, 42] },
        ],
      },
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('series = "Gold","Silver","Bronze"')
    expect(output).toContain('"USA" = 40,44,42')
  })

  it('round-trips multi-value data entries', () => {
    const dsl = `chart bar-multi {
  data {
    series = "Gold","Silver","Bronze"
    "USA" = 40,44,42
    "China" = -2.8,3.2,18
  }
}`
    const ast1 = parse(dsl)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2).toEqual(ast1)
  })

  it('serializes area-fill blocks', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: ChartType.LineMulti,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [{
        type: DslNodeType.AreaFill,
        from: 'Revenue',
        to: 'Cost',
        properties: [
          { type: DslNodeType.Property, key: 'color', value: '#0000ff', isPercentage: false },
          { type: DslNodeType.Property, key: 'opacity', value: 0.3, isPercentage: false },
        ],
      }],
      annotations: [],

      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  area-fill "Revenue" "Cost" {')
    expect(output).toContain('    color = "#0000ff"')
    expect(output).toContain('    opacity = 0.3')
  })

  it('serializes range annotation', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: ChartType.Line,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [{
        type: DslNodeType.Annotation,
        kind: AnnotationKind.Range,
        properties: [
          { type: DslNodeType.Property, key: 'start', value: 2, isPercentage: false },
          { type: DslNodeType.Property, key: 'end', value: 5, isPercentage: false },
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
      type: DslNodeType.Chart,
      chartType: ChartType.Line,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [{
        type: DslNodeType.Annotation,
        kind: AnnotationKind.Free,
        properties: [
          { type: DslNodeType.Property, key: 'text', value: 'Important note', isPercentage: false },
          { type: DslNodeType.Property, key: 'x', value: 50, isPercentage: true },
          { type: DslNodeType.Property, key: 'y', value: 25, isPercentage: true },
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
      type: DslNodeType.Chart,
      chartType: ChartType.LineMulti,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [
        {
          type: DslNodeType.Series,
          name: 'Revenue',
          properties: [
            { type: DslNodeType.Property, key: 'color', value: '#e15759', isPercentage: false },
            { type: DslNodeType.Property, key: 'lineWidth', value: 3, isPercentage: false },
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
      type: DslNodeType.Chart,
      chartType: ChartType.Line,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [],
      transforms: [{
        type: DslNodeType.Transform,
        transformType: 'rolling-average',
        properties: [
          { type: DslNodeType.Property, key: 'window', value: 7, isPercentage: false },
        ],
      }],
    }
    const output = serialize(ast)
    expect(output).toContain('  transform rolling-average {')
    expect(output).toContain('    window = 7')
  })

  it('quotes string values containing special characters', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [
        { type: DslNodeType.Property, key: 'title', value: 'Hello World', isPercentage: false },
      ],
      data: null,
      colorizes: [],
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
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [
        { type: DslNodeType.Property, key: 'sort', value: 'descending', isPercentage: false },
      ],
      data: null,
      colorizes: [],
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
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [{
        type: DslNodeType.Colorize,
        target: 'X',
        properties: [
          { type: DslNodeType.Property, key: 'color', value: '#ff0000', isPercentage: false },
        ],
      }],
      highlights: [],
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
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [
        { type: DslNodeType.Property, key: 'title', value: 'say "hello"', isPercentage: false },
        { type: DslNodeType.Property, key: 'path', value: 'C:\\Users', isPercentage: false },
      ],
      data: null,
      colorizes: [],
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

  it('serializes scene with area-fill and annotations', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: ChartType.Line,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: 'Full',
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [{
          type: DslNodeType.AreaFill,
          from: 'A',
          to: 'B',
          properties: [{ type: DslNodeType.Property, key: 'color', value: '#abc', isPercentage: false }],
        }],
        annotations: [
          { type: DslNodeType.Annotation, kind: AnnotationKind.Range, properties: [{ type: DslNodeType.Property, key: 'start', value: 1, isPercentage: false }] },
          { type: DslNodeType.Annotation, kind: AnnotationKind.Free, properties: [{ type: DslNodeType.Property, key: 'text', value: 'Note', isPercentage: false }] },
        ],

        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('    area-fill "A" "B" {')
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
  colorize "Guardian" {
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
    colorize "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }
  scene "Le moins bon" {
    sort = ascending
    colorize "Guardian" {
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

    it('round-trips area-fill blocks', () => {
      const dsl = `chart line-multi {
  area-fill "Revenue" "Cost" {
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

    it('round-trips data with ISO date labels', () => {
      const dsl = `chart line {
  data {
    "2022-09-25" = 42
    "2022-10-01" = 55
  }
}`
      const ast1 = parse(dsl)
      const serialized = serialize(ast1)
      const ast2 = parse(serialized)
      expect(ast2).toEqual(ast1)
    })

    it('round-trips a complex chart with all block types', () => {
      const dsl = `chart line-multi {
  title = "Full chart"
  data {
    series = "A","B"
    "2020" = 10,20
  }
  colorize "2020" {
    color = "#e53e3e"
  }
  area-fill "A" "B" {
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
    colorize "2020" {
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

  // ── Highlight serialization ──────────────────────────────────────

  it('serializes highlight blocks', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [{ type: DslNodeType.Highlight, target: 'Apple' }],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('  highlight "Apple"')
  })

  it('serializes highlight in scene', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],

      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: 'Focus',
        properties: [],
        data: null,
        colorizes: [],
        highlights: [{ type: DslNodeType.Highlight, target: 'Banana' }],
        areaFills: [],
        annotations: [],

        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('    highlight "Banana"')
  })

  it('round-trips highlights through parse and serialize', () => {
    const dsl = `chart bar {
  highlight "Apple"
  scene "Focus" {
    highlight "Banana"
  }
}`
    const ast1 = parse(dsl)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2).toEqual(ast1)
  })

  // ── compactSerialize ─────────────────────────────────────────────

  describe('compactSerialize', () => {
    it('omits properties matching their registry default', () => {
      const withDefault: ChartNode = {
        type: DslNodeType.Chart,
        chartType: ChartType.BarVertical,
        properties: [
          { type: DslNodeType.Property, key: 'sort', value: 'descending', isPercentage: false },
          { type: DslNodeType.Property, key: 'title', value: 'Custom Title', isPercentage: false },
        ],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],

        series: [],
        scenes: [],
        transforms: [],
      }
      const full = serialize(withDefault)
      const compact = compactSerialize(withDefault)
      // compact should be shorter or equal (never longer) than full
      expect(compact.length).toBeLessThanOrEqual(full.length)
      // title has no default, must always be present
      expect(compact).toContain('title = "Custom Title"')
    })

    it('includes non-default property values', () => {
      const ast: ChartNode = {
        type: DslNodeType.Chart,
        chartType: ChartType.BarVertical,
        properties: [
          { type: DslNodeType.Property, key: 'sort', value: 'descending', isPercentage: false },
        ],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],

        series: [],
        scenes: [],
        transforms: [],
      }
      const output = compactSerialize(ast)
      expect(output).toContain('sort = descending')
    })

    it('still serializes data, colorizes, and other blocks', () => {
      const ast: ChartNode = {
        type: DslNodeType.Chart,
        chartType: ChartType.BarVertical,
        properties: [],
        data: {
          type: DslNodeType.Data,
          entries: [{ type: DslNodeType.Property, key: 'A', value: 10, isPercentage: false }],
        },
        colorizes: [{
          type: DslNodeType.Colorize,
          target: 'A',
          properties: [{ type: DslNodeType.Property, key: 'color', value: '#f00', isPercentage: false }],
        }],
        highlights: [],
        areaFills: [],
        annotations: [],

        series: [],
        scenes: [],
        transforms: [],
      }
      const output = compactSerialize(ast)
      expect(output).toContain('data {')
      expect(output).toContain('colorize "A" {')
    })

    it('produces valid output for minimal chart', () => {
      const ast: ChartNode = {
        type: DslNodeType.Chart,
        chartType: ChartType.Line,
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],

        series: [],
        scenes: [],
        transforms: [],
      }
      expect(compactSerialize(ast)).toBe('chart line {\n}')
    })
  })
})

describe('leadingComments serialization', () => {
  it('emits a comment above a property', () => {
    const out = serialize(parse(`chart bar {
  // about the title
  title = "Hi"
  data { "A" = 1 }
}`))
    expect(out).toContain('  // about the title\n  title = Hi')
  })

  it('emits a comment above the data block', () => {
    const out = serialize(parse(`chart bar {
  // each row is a bar
  data { "A" = 1 }
}`))
    expect(out).toContain('  // each row is a bar\n  data {')
  })

  it('emits a comment above a data row', () => {
    const out = serialize(parse(`chart bar {
  data {
    // outlier
    "A" = 99
  }
}`))
    expect(out).toContain('    // outlier\n    A = 99')
  })

  it('emits a comment above a highlight', () => {
    const out = serialize(parse(`chart bar {
  data { "A" = 1 }
  // pop the winner
  highlight "A"
}`))
    expect(out).toContain('  // pop the winner\n  highlight "A"')
  })

  it('round-trips comments through parse → serialize → parse', () => {
    const src = `chart bar {
  // about the title
  title = "Hi"
  // each row is a bar
  data {
    // outlier
    "A" = 99
    "B" = 1
  }
  // pop the winner
  highlight "A"
}`
    const ast1 = parse(src)
    const ast2 = parse(serialize(ast1))
    expect(ast2.properties.find(p => p.key === 'title')?.leadingComments).toEqual(['about the title'])
    expect(ast2.data?.leadingComments).toEqual(['each row is a bar'])
    expect(ast2.data?.entries.find(e => e.key === 'A')?.leadingComments).toEqual(['outlier'])
    expect(ast2.highlights[0]?.leadingComments).toEqual(['pop the winner'])
    expect(serialize(ast2)).toBe(serialize(ast1))
  })
})

describe('compactSerializeDeep', () => {
  test('drops a top-level option equal to the registered default', () => {
    const ast = parse('chart bar-vertical {\n  valueLabels = true\n  data {\n    "A" = 1\n  }\n}')
    const out = compactSerializeDeep(ast)
    expect(out).not.toContain('valueLabels')
    expect(out).toContain('A = 1')
  })

  test('keeps a top-level option that differs from the default', () => {
    const ast = parse('chart bar-vertical {\n  valueLabels = false\n  data {\n    "A" = 1\n  }\n}')
    const out = compactSerializeDeep(ast)
    expect(out).toContain('valueLabels = false')
  })

  test('is a no-op (equal to serialize) when nothing is redundant', () => {
    const ast = parse('chart bar-vertical {\n  valueLabels = false\n  data {\n    "A" = 1\n  }\n}')
    expect(compactSerializeDeep(ast)).toBe(serialize(ast))
  })

  test('preserves a comment on a retained option', () => {
    const ast = parse('chart bar-vertical {\n  // keep me\n  valueLabels = false\n  data {\n    "A" = 1\n  }\n}')
    const out = compactSerializeDeep(ast)
    expect(out).toContain('// keep me')
    expect(out).toContain('valueLabels = false')
  })

  test('drops a series override equal to the inherited global value', () => {
    // chart leaves valueLabels at its bar-vertical default (true); a series
    // that restates true is redundant.
    const ast = parse('chart bar-vertical {\n  data {\n    series = "X","Y"\n    "A" = 1,2\n  }\n  series "X" {\n    valueLabels = true\n  }\n}')
    const out = compactSerializeDeep(ast)
    expect(out).not.toContain('valueLabels')
  })

  test('keeps a scene override that equals the global default but overrides a non-default base', () => {
    // base sets valueLabels = false; scene sets valueLabels = true. true equals
    // the registered default, but it is NOT redundant — it overrides the base.
    const src = 'chart bar-horizontal {\n  valueLabels = false\n  data {\n    "A" = 1\n  }\n  scene "s" {\n    valueLabels = true\n  }\n}'
    const ast = parse(src)
    const out = compactSerializeDeep(ast)
    expect(out).toContain('valueLabels = false') // base kept (non-default)
    // scene line retained because base effective value is false, not true
    const sceneBlock = out.slice(out.indexOf('scene'))
    expect(sceneBlock).toContain('valueLabels = true')
  })

  test('drops a scene override equal to the base effective value', () => {
    // base sets valueLabels = false; scene restates false → redundant.
    const src = 'chart bar-horizontal {\n  valueLabels = false\n  data {\n    "A" = 1\n  }\n  scene "s" {\n    valueLabels = false\n  }\n}'
    const ast = parse(src)
    const out = compactSerializeDeep(ast)
    const sceneBlock = out.slice(out.indexOf('scene'))
    expect(sceneBlock).not.toContain('valueLabels')
  })

  test('keeps a scene `type` property untouched', () => {
    const src = 'chart bar-vertical {\n  data {\n    "A" = 1\n  }\n  scene "s" {\n    type = bar-horizontal\n  }\n}'
    const ast = parse(src)
    expect(compactSerializeDeep(ast)).toContain('type = bar-horizontal')
  })
})

describe('comment edge cases', () => {
  it('round-trips a multi-line block comment without crashing', () => {
    const src = `chart bar {
  /* line one
     line two */
  title = "Hi"
  data { "A" = 1 }
}`
    const ast1 = parse(src)
    const out1 = serialize(ast1)
    // every emitted comment physical line must start with //
    for (const line of out1.split('\n').filter(l => l.trim() && /two|one/.test(l))) {
      expect(line.trim().startsWith('//')).toBe(true)
    }
    // re-parsing the serialized output must not throw, and serialize is stable
    const ast2 = parse(out1)
    expect(serialize(ast2)).toBe(out1)
  })
})

describe('quoted-identifier escaping', () => {
  const roundTrip = (src: string) => {
    const ast1 = parse(src)
    const ast2 = parse(serialize(ast1))
    expect(ast2).toEqual(ast1)
  }

  it('round-trips a data key containing a double quote', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "A \\"B\\"" = 1\n    "C" = 2\n  }\n}')
  })

  it('round-trips a data key containing a backslash', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "C:\\\\x" = 1\n  }\n}')
  })

  it('round-trips a multi-value data key containing a double quote', () => {
    roundTrip('chart line-multi {\n  data {\n    series = "S1","S2"\n    "A \\"B\\"" = 1,2\n  }\n}')
  })

  it('round-trips a series name containing a double quote', () => {
    roundTrip('chart line-multi {\n  data {\n    "A" = 1\n  }\n  series "X \\"Q\\"" {\n    color = "#111111"\n  }\n}')
  })

  it('round-trips an annotation target containing a double quote', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "A \\"B\\"" = 1\n  }\n  annotation "A \\"B\\"" {\n    text = "hi"\n  }\n}')
  })

  it('round-trips a highlight target containing a double quote', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "A \\"B\\"" = 1\n  }\n  highlight "A \\"B\\""\n}')
  })

  it('round-trips a colorize target containing a double quote', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "A \\"B\\"" = 1\n  }\n  colorize "A \\"B\\"" {\n    color = "#111111"\n  }\n}')
  })

  it('round-trips an area-fill pair containing a double quote', () => {
    roundTrip('chart line-multi {\n  data {\n    series = "A \\"B\\"","C"\n    "x" = 1,2\n  }\n  area-fill "A \\"B\\"" "C" {\n    color = "#111111"\n  }\n}')
  })

  it('round-trips a scene name containing a double quote', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "A" = 1\n  }\n  scene "S \\"1\\"" {\n    sort = descending\n  }\n}')
  })

  it('round-trips a quoted property key containing a double quote', () => {
    roundTrip('chart bar-vertical {\n  "we\\"ird" = 1\n  data {\n    "A" = 1\n  }\n}')
  })

  it('round-trips a data key containing a newline', () => {
    roundTrip('chart bar-vertical {\n  data {\n    "two\\nlines" = 1\n  }\n}')
  })
})

describe('trailingComments serialization', () => {
  it('keeps a comment trailing a property', () => {
    const src = 'chart bar {\n  title = "Sales" // note\n  data {\n    "A" = 1\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.properties[0].trailingComment).toBe('note')
    expect(serialize(ast1)).toContain('// note')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps a comment trailing a data row', () => {
    const src = 'chart bar {\n  data {\n    "A" = 1 // provisional\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.data!.entries[0].trailingComment).toBe('provisional')
    expect(serialize(ast1)).toContain('// provisional')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps a comment after the last member of a data block', () => {
    const src = 'chart bar {\n  data {\n    "A" = 1\n    // more to come\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.data!.trailingComments).toEqual(['more to come'])
    expect(serialize(ast1)).toContain('// more to come')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps a comment after the last member of the chart block', () => {
    const src = 'chart bar {\n  data {\n    "A" = 1\n  }\n  // end of chart\n}'
    const ast1 = parse(src)
    expect(ast1.trailingComments).toEqual(['end of chart'])
    expect(serialize(ast1)).toContain('// end of chart')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps a comment trailing a block property', () => {
    const src = 'chart bar {\n  data {\n    "A" = 1\n  }\n  colorize "A" {\n    color = "#111111" // brand red\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.colorizes[0].properties[0].trailingComment).toBe('brand red')
    expect(serialize(ast1)).toContain('// brand red')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps a multi-line block comment trailing a member parseable', () => {
    const src = 'chart bar {\n  title = "S" /* one\n  two */\n  data {\n    "A" = 1\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.properties[0].trailingComment).toBe('one\n  two')
    const out1 = serialize(ast1)
    expect(parse(out1)).toEqual(ast1)
    expect(serialize(parse(out1))).toBe(out1)
  })

  it('keeps a comment after the last property of a colorize block', () => {
    const src = 'chart bar {\n  colorize "A" {\n    color = red\n    // note\n  }\n  data {\n    "A" = 1\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.colorizes[0].trailingComments).toEqual(['note'])
    expect(serialize(ast1)).toContain('// note')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps a comment after the last property of a series block', () => {
    const src = 'chart line-multi {\n  data {\n    "A" = 1\n  }\n  series "S" {\n    color = red\n    // note\n  }\n}'
    const ast1 = parse(src)
    expect(ast1.series[0].trailingComments).toEqual(['note'])
    expect(serialize(ast1)).toContain('// note')
    expect(parse(serialize(ast1))).toEqual(ast1)
  })

  it('keeps every comment of a six-comment document', () => {
    const src = `chart bar {
  // leading on title
  title = "Sales" // trailing on title
  data {
    // leading on row
    "A" = 1 // trailing on row
    // end of data block
  }
  // end of chart
}`
    const out = serialize(parse(src))
    for (const text of [
      'leading on title',
      'trailing on title',
      'leading on row',
      'trailing on row',
      'end of data block',
      'end of chart',
    ]) {
      expect(out, text).toContain(`// ${text}`)
    }
  })
})
