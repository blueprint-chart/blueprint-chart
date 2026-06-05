import { describe, expect, it } from 'vitest'
import { DslNodeType, AnnotationKind, AnnotationAction, ChartType } from '../enums'
import { parse } from './parser'
import { serialize, compactSerialize } from './serializer'
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
        annotationVisibility: [],
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
      annotationVisibility: [],
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
        annotationVisibility: [],
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
      annotationVisibility: [],
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
        annotationVisibility: [],
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
      annotationVisibility: [],
      series: [],
      scenes: [],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('id = abc')
  })

  it('serializes hide-annotation in scene', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: null,
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: DslNodeType.AnnotationVisibility, action: AnnotationAction.Hide, kind: AnnotationKind.Point, id: 'abc' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('hide-annotation "abc"')
  })

  it('serializes show-annotation in scene', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: null,
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: DslNodeType.AnnotationVisibility, action: AnnotationAction.Show, kind: AnnotationKind.Point, id: 'xyz' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('show-annotation "xyz"')
  })

  it('serializes hide-range and show-range in scene', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: null,
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: DslNodeType.AnnotationVisibility, action: AnnotationAction.Hide, kind: AnnotationKind.Range, id: 'r1' },
          { type: DslNodeType.AnnotationVisibility, action: AnnotationAction.Show, kind: AnnotationKind.Range, id: 'r2' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('hide-range "r1"')
    expect(output).toContain('show-range "r2"')
  })

  it('serializes hide-note and show-note in scene', () => {
    const ast: ChartNode = {
      type: DslNodeType.Chart,
      chartType: 'bar',
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      scenes: [{
        type: DslNodeType.Scene,
        name: null,
        properties: [],
        data: null,
        colorizes: [],
        highlights: [],
        areaFills: [],
        annotations: [],
        annotationVisibility: [
          { type: DslNodeType.AnnotationVisibility, action: AnnotationAction.Hide, kind: AnnotationKind.Free, id: 'n1' },
          { type: DslNodeType.AnnotationVisibility, action: AnnotationAction.Show, kind: AnnotationKind.Free, id: 'n2' },
        ],
        series: [],
        transforms: [],
      }],
      transforms: [],
    }
    const output = serialize(ast)
    expect(output).toContain('hide-note "n1"')
    expect(output).toContain('show-note "n2"')
  })

  it('round-trips annotation visibility through parse and serialize', () => {
    const dsl = `chart bar {
  scene "Test" {
    hide-annotation "a1"
    show-range "r1"
    hide-note "n1"
  }
}`
    const ast1 = parse(dsl)
    const serialized = serialize(ast1)
    const ast2 = parse(serialized)
    expect(ast2.scenes[0].annotationVisibility).toEqual(ast1.scenes[0].annotationVisibility)
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
        annotationVisibility: [],
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
      annotationVisibility: [],
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
      annotationVisibility: [],
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
        annotationVisibility: [],
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
        annotationVisibility: [],
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
        annotationVisibility: [],
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
        annotationVisibility: [],
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
        annotationVisibility: [],
        series: [],
        scenes: [],
        transforms: [],
      }
      expect(compactSerialize(ast)).toBe('chart line {\n}')
    })
  })
})
