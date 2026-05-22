import { describe, expect, it } from 'vitest'
import { DslNodeType, AnnotationKind, AnnotationAction } from '../enums'
import { parse } from './parser'
import { serialize } from './serializer'

const SIMPLE_CHART = `chart horizontal-bar {
  title = "Couverture médiatique"
  sort = descending

  data {
    "20 Minutes" = 61.11%
    "BFMTV"      = 53.85%
    "Guardian"   = 44.44%
    "LeMonde"    = 75.00%
  }

  colorize "Guardian" {
    color = "#e53e3e"
    label = "Leader"
  }
}`

const CHART_WITH_SCENES = `chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending

  data {
    "20 Minutes" = 61%
    "BFMTV"      = 53%
    "Guardian"   = 44%
    "LeMonde"    = 75%
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
      "BFMTV"      = 73%
      "Guardian"   = 84%
      "LeMonde"    = 25%
    }
  }
}`

describe('parser', () => {
  describe('simple chart', () => {
    it('parses the chart type', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.type).toBe(DslNodeType.Chart)
      expect(ast.chartType).toBe('horizontal-bar')
    })

    it('parses chart properties', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.properties).toHaveLength(2)
      expect(ast.properties[0]).toEqual({
        type: DslNodeType.Property,
        key: 'title',
        value: 'Couverture médiatique',
        isPercentage: false,
      })
      expect(ast.properties[1]).toEqual({
        type: DslNodeType.Property,
        key: 'sort',
        value: 'descending',
        isPercentage: false,
      })
    })

    it('parses data block', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.data).not.toBeNull()
      expect(ast.data!.entries).toHaveLength(4)
      expect(ast.data!.entries[0]).toEqual({
        type: DslNodeType.Property,
        key: '20 Minutes',
        value: 61.11,
        isPercentage: true,
      })
      expect(ast.data!.entries[3]).toEqual({
        type: DslNodeType.Property,
        key: 'LeMonde',
        value: 75,
        isPercentage: true,
      })
    })

    it('parses colorize block', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.colorizes).toHaveLength(1)
      expect(ast.colorizes[0].target).toBe('Guardian')
      expect(ast.colorizes[0].properties).toHaveLength(2)
      expect(ast.colorizes[0].properties[0]).toEqual({
        type: DslNodeType.Property,
        key: 'color',
        value: '#e53e3e',
        isPercentage: false,
      })
    })

    it('has no scenes', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.scenes).toHaveLength(0)
    })
  })

  describe('chart with scenes', () => {
    it('parses three scenes', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes).toHaveLength(3)
    })

    it('parses scene names', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].name).toBe('Le leader')
      expect(ast.scenes[1].name).toBe('Le moins bon')
      expect(ast.scenes[2].name).toBe('Année suivante')
    })

    it('parses scene properties', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].properties).toEqual([
        { type: DslNodeType.Property, key: 'sort', value: 'descending', isPercentage: false },
      ])
    })

    it('parses colorizes inside scenes', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].colorizes).toHaveLength(1)
      expect(ast.scenes[0].colorizes[0].target).toBe('LeMonde')
      expect(ast.scenes[1].colorizes).toHaveLength(1)
      expect(ast.scenes[1].colorizes[0].target).toBe('Guardian')
    })

    it('parses highlight block', () => {
      const ast = parse('chart line {\n  highlight "China"\n}')
      expect(ast.highlights).toHaveLength(1)
      expect(ast.highlights[0].type).toBe(DslNodeType.Highlight)
      expect(ast.highlights[0].target).toBe('China')
    })

    it('parses highlight inside scenes', () => {
      const ast = parse('chart line {\n  scene "focus" {\n    highlight "China"\n  }\n}')
      expect(ast.scenes[0].highlights).toHaveLength(1)
      expect(ast.scenes[0].highlights[0].target).toBe('China')
    })

    it('parses data inside scenes', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[2].data).not.toBeNull()
      expect(ast.scenes[2].data!.entries).toHaveLength(4)
      expect(ast.scenes[2].data!.entries[0]).toEqual({
        type: DslNodeType.Property,
        key: '20 Minutes',
        value: 51,
        isPercentage: true,
      })
    })

    it('has no data in scenes without data block', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].data).toBeNull()
    })

    it('parses scene with no name', () => {
      const ast = parse('chart bar {\n  scene {\n    title = "unnamed"\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].name).toBeNull()
      expect(ast.scenes[0].properties).toHaveLength(1)
    })

    it('parses scene with series', () => {
      const ast = parse('chart line {\n  scene "S1" {\n    series "Revenue" {\n      color = "#f00"\n    }\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].series).toHaveLength(1)
      expect(ast.scenes[0].series[0].name).toBe('Revenue')
    })

    it('parses scene with transforms', () => {
      const ast = parse('chart line {\n  scene "S1" {\n    transform cumulative {\n      enabled = true\n    }\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].transforms).toHaveLength(1)
      expect(ast.scenes[0].transforms[0].transformType).toBe('cumulative')
    })

    it('accepts backward-compatible "step" keyword', () => {
      const ast = parse('chart bar {\n  step "Old" {\n    title = "compat"\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].type).toBe(DslNodeType.Scene)
      expect(ast.scenes[0].name).toBe('Old')
    })
  })

  describe('error handling', () => {
    it('throws on missing chart keyword', () => {
      expect(() => parse('foo {}')).toThrow(/Expected "chart"/)
    })

    it('throws on missing opening brace', () => {
      expect(() => parse('chart bar }')).toThrow(/Expected "\{"/)
    })

    it('throws on missing closing brace', () => {
      expect(() => parse('chart bar { title = "x"')).toThrow(/Expected/)
    })

    it('throws on missing equals in property', () => {
      expect(() => parse('chart bar { title "x" }')).toThrow(/Expected "="/)
    })

    it('throws on invalid property value', () => {
      expect(() => parse('chart bar { title = { } }')).toThrow(/Expected/)
    })

    it('throws on missing colorize target', () => {
      expect(() => parse('chart bar { colorize { } }')).toThrow(/Expected/)
    })

    it('includes line and column in error', () => {
      try {
        parse('chart bar {\n  title "x"\n}')
        expect.fail('Should have thrown')
      }
      catch (e) {
        expect((e as Error).message).toMatch(/2:\d+/)
      }
    })
  })

  describe('tabular/TSV data syntax', () => {
    it('parses tab-separated data entries', () => {
      const ast = parse('chart bar {\n  data {\n    Apple\t42\n    Banana\t58\n  }\n}')
      expect(ast.data).not.toBeNull()
      expect(ast.data!.entries).toHaveLength(2)
      expect(ast.data!.entries[0]).toEqual({
        type: DslNodeType.Property,
        key: 'Apple',
        value: 42,
        isPercentage: false,
      })
      expect(ast.data!.entries[1]).toEqual({
        type: DslNodeType.Property,
        key: 'Banana',
        value: 58,
        isPercentage: false,
      })
    })

    it('parses tab-separated percentage values', () => {
      const ast = parse('chart bar {\n  data {\n    Sales\t75%\n  }\n}')
      expect(ast.data!.entries[0]).toEqual({
        type: DslNodeType.Property,
        key: 'Sales',
        value: 75,
        isPercentage: true,
      })
    })

    it('parses tab-separated labels with spaces', () => {
      const ast = parse('chart bar {\n  data {\n    New York\t100\n    Los Angeles\t80\n  }\n}')
      expect(ast.data!.entries[0].key).toBe('New York')
      expect(ast.data!.entries[1].key).toBe('Los Angeles')
    })

    it('parses tab-separated string values', () => {
      const ast = parse('chart bar {\n  data {\n    Item\t"hello world"\n  }\n}')
      expect(ast.data!.entries[0]).toEqual({
        type: DslNodeType.Property,
        key: 'Item',
        value: 'hello world',
        isPercentage: false,
      })
    })

    it('mixes tabular and standard data entries', () => {
      const ast = parse('chart bar {\n  data {\n    "Quoted" = 10\n    Unquoted\t20\n  }\n}')
      expect(ast.data!.entries).toHaveLength(2)
      expect(ast.data!.entries[0].key).toBe('Quoted')
      expect(ast.data!.entries[0].value).toBe(10)
      expect(ast.data!.entries[1].key).toBe('Unquoted')
      expect(ast.data!.entries[1].value).toBe(20)
    })
  })

  describe('multi-value data entries', () => {
    it('parses comma-separated numeric values', () => {
      const ast = parse('chart bar {\n  data {\n    "USA" = 40,44,42\n  }\n}')
      expect(ast.data!.entries).toHaveLength(1)
      expect(ast.data!.entries[0].key).toBe('USA')
      expect(ast.data!.entries[0].values).toEqual([40, 44, 42])
    })

    it('parses comma-separated string values', () => {
      const ast = parse('chart bar {\n  data {\n    _series = "Gold","Silver","Bronze"\n  }\n}')
      expect(ast.data!.entries).toHaveLength(1)
      expect(ast.data!.entries[0].key).toBe('_series')
      expect(ast.data!.entries[0].values).toEqual(['Gold', 'Silver', 'Bronze'])
    })

    it('parses negative numbers in multi-value entries', () => {
      const ast = parse('chart bar {\n  data {\n    "2020" = -2.8,2.2,-3.7\n  }\n}')
      expect(ast.data!.entries[0].values).toEqual([-2.8, 2.2, -3.7])
    })

    it('still parses legacy quoted multi-value strings', () => {
      const ast = parse('chart bar {\n  data {\n    "USA" = "40,44,42"\n  }\n}')
      expect(ast.data!.entries[0].value).toBe('40,44,42')
      expect(ast.data!.entries[0].values).toBeUndefined()
    })
  })

  describe('annotation visibility directives', () => {
    it('parses hide_annotation in scene', () => {
      const ast = parse('chart bar {\n  scene {\n    hide_annotation "abc"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(1)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Point,
        id: 'abc',
      })
    })

    it('parses show_annotation in scene', () => {
      const ast = parse('chart bar {\n  scene {\n    show_annotation "abc"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(1)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Show,
        kind: AnnotationKind.Point,
        id: 'abc',
      })
    })

    it('parses hide_range in scene', () => {
      const ast = parse('chart bar {\n  scene {\n    hide_range "r1"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(1)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Range,
        id: 'r1',
      })
    })

    it('parses show_range in scene', () => {
      const ast = parse('chart bar {\n  scene {\n    show_range "r1"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(1)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Show,
        kind: AnnotationKind.Range,
        id: 'r1',
      })
    })

    it('parses hide_note in scene', () => {
      const ast = parse('chart bar {\n  scene {\n    hide_note "n1"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(1)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Free,
        id: 'n1',
      })
    })

    it('parses show_note in scene', () => {
      const ast = parse('chart bar {\n  scene {\n    show_note "n1"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(1)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Show,
        kind: AnnotationKind.Free,
        id: 'n1',
      })
    })

    it('parses multiple visibility directives in one scene', () => {
      const ast = parse('chart bar {\n  scene {\n    hide_annotation "a1"\n    show_range "r1"\n    hide_note "n1"\n  }\n}')
      expect(ast.scenes[0].annotationVisibility).toHaveLength(3)
      expect(ast.scenes[0].annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Point,
        id: 'a1',
      })
      expect(ast.scenes[0].annotationVisibility[1]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Show,
        kind: AnnotationKind.Range,
        id: 'r1',
      })
      expect(ast.scenes[0].annotationVisibility[2]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Free,
        id: 'n1',
      })
    })

    it('parses annotation id property', () => {
      const ast = parse('chart bar {\n  annotation "X" {\n    id = "abc"\n  }\n}')
      expect(ast.annotations).toHaveLength(1)
      expect(ast.annotations[0].properties).toContainEqual({
        type: DslNodeType.Property,
        key: 'id',
        value: 'abc',
        isPercentage: false,
      })
    })
  })

  describe('areafill block', () => {
    it('parses areafill with two targets and properties', () => {
      const ast = parse(`chart line-multi {
  areafill "Revenue" "Cost" {
    color = "#0000ff"
    opacity = 0.3
  }
}`)
      expect(ast.areaFills).toHaveLength(1)
      expect(ast.areaFills[0]).toMatchObject({
        type: DslNodeType.AreaFill,
        from: 'Revenue',
        to: 'Cost',
      })
      expect(ast.areaFills[0].properties).toHaveLength(2)
      expect(ast.areaFills[0].properties[0]).toMatchObject({ key: 'color', value: '#0000ff' })
      expect(ast.areaFills[0].properties[1]).toMatchObject({ key: 'opacity', value: 0.3 })
    })

    it('parses multiple areafills', () => {
      const ast = parse(`chart line-multi {
  areafill "A" "B" { color = "#f00" }
  areafill "C" "D" { color = "#0f0" }
}`)
      expect(ast.areaFills).toHaveLength(2)
    })
  })

  describe('annotation types', () => {
    it('parses point annotation with all properties', () => {
      const ast = parse(`chart line {
  annotation "Q3" {
    id = "ann-1"
    text = "Peak"
    anchorDirection = NE
    textOffsetX = 10
    textOffsetY = -5
    showLine = true
  }
}`)
      expect(ast.annotations).toHaveLength(1)
      expect(ast.annotations[0]).toMatchObject({ type: DslNodeType.Annotation, kind: AnnotationKind.Point, target: 'Q3' })
      expect(ast.annotations[0].properties).toHaveLength(6)
    })

    it('parses range annotation', () => {
      const ast = parse(`chart line {
  range {
    start = 2
    end = 5
    orientation = vertical
    bgColor = "#eee"
  }
}`)
      expect(ast.annotations).toHaveLength(1)
      expect(ast.annotations[0]).toMatchObject({ type: DslNodeType.Annotation, kind: AnnotationKind.Range })
      expect(ast.annotations[0].properties).toHaveLength(4)
    })

    it('parses note (free) annotation', () => {
      const ast = parse(`chart line {
  note {
    text = "Important"
    x = 50%
    y = 25%
    textColor = "#333"
  }
}`)
      expect(ast.annotations).toHaveLength(1)
      expect(ast.annotations[0]).toMatchObject({ type: DslNodeType.Annotation, kind: AnnotationKind.Free })
      expect(ast.annotations[0].properties).toHaveLength(4)
      expect(ast.annotations[0].properties[1]).toMatchObject({ key: 'x', value: 50, isPercentage: true })
    })

    it('parses mixed annotation types', () => {
      const ast = parse(`chart line {
  annotation "X" { text = "point" }
  range { start = 1 end = 3 }
  note { text = "free" x = 0 y = 0 }
}`)
      expect(ast.annotations).toHaveLength(3)
      expect(ast.annotations[0].kind).toBe(AnnotationKind.Point)
      expect(ast.annotations[1].kind).toBe(AnnotationKind.Range)
      expect(ast.annotations[2].kind).toBe(AnnotationKind.Free)
    })
  })

  describe('series block', () => {
    it('parses series with multiple properties', () => {
      const ast = parse(`chart line-multi {
  series "Revenue" {
    color = "#e15759"
    lineWidth = 3
    dash = dashed
    interpolation = monotoneX
  }
}`)
      expect(ast.series).toHaveLength(1)
      expect(ast.series[0]).toMatchObject({ type: DslNodeType.Series, name: 'Revenue' })
      expect(ast.series[0].properties).toHaveLength(4)
    })

    it('parses multiple series blocks', () => {
      const ast = parse(`chart line-multi {
  series "A" { color = "#f00" }
  series "B" { color = "#0f0" }
}`)
      expect(ast.series).toHaveLength(2)
      expect(ast.series[0].name).toBe('A')
      expect(ast.series[1].name).toBe('B')
    })
  })

  describe('transform block', () => {
    it('parses transform at chart level', () => {
      const ast = parse(`chart line {
  transform rolling-average {
    window = 7
  }
}`)
      expect(ast.transforms).toHaveLength(1)
      expect(ast.transforms[0]).toMatchObject({ type: DslNodeType.Transform, transformType: 'rolling-average' })
      expect(ast.transforms[0].properties[0]).toMatchObject({ key: 'window', value: 7 })
    })

    it('parses multiple transforms', () => {
      const ast = parse(`chart line {
  transform rolling-average { window = 5 }
  transform cumulative { enabled = true }
}`)
      expect(ast.transforms).toHaveLength(2)
    })
  })

  describe('string edge cases', () => {
    it('handles escaped quotes', () => {
      const ast = parse('chart line { title = "say \\"hello\\"" }')
      expect(ast.properties[0].value).toBe('say "hello"')
    })

    it('handles escaped backslash', () => {
      const ast = parse('chart line { path = "C:\\\\Users" }')
      expect(ast.properties[0].value).toBe('C:\\Users')
    })

    it('handles unicode', () => {
      const ast = parse('chart line { title = "Année suivante" }')
      expect(ast.properties[0].value).toBe('Année suivante')
    })

    it('handles newline escape', () => {
      const ast = parse('chart line { text = "line1\\nline2" }')
      expect(ast.properties[0].value).toBe('line1\nline2')
    })

    it('handles tab escape', () => {
      const ast = parse('chart line { text = "col1\\tcol2" }')
      expect(ast.properties[0].value).toBe('col1\tcol2')
    })

    it('handles empty string', () => {
      const ast = parse('chart line { title = "" }')
      expect(ast.properties[0].value).toBe('')
    })
  })

  describe('negative numbers', () => {
    it('parses negative integer', () => {
      const ast = parse('chart line { min = -10 }')
      expect(ast.properties[0].value).toBe(-10)
    })

    it('parses negative decimal', () => {
      const ast = parse('chart line { min = -3.14 }')
      expect(ast.properties[0].value).toBe(-3.14)
    })

    it('parses negative percentage', () => {
      const ast = parse('chart bar { data { "Loss" = -25% } }')
      expect(ast.data!.entries[0]).toMatchObject({ value: -25, isPercentage: true })
    })
  })

  describe('edge cases', () => {
    it('parses chart with no properties or blocks', () => {
      const ast = parse('chart bar {}')
      expect(ast.chartType).toBe('bar')
      expect(ast.properties).toHaveLength(0)
      expect(ast.data).toBeNull()
      expect(ast.colorizes).toHaveLength(0)
      expect(ast.scenes).toHaveLength(0)
    })

    it('parses integer percentage values', () => {
      const ast = parse('chart bar { data { "A" = 50% } }')
      expect(ast.data!.entries[0].value).toBe(50)
      expect(ast.data!.entries[0].isPercentage).toBe(true)
    })

    it('parses non-percentage numbers', () => {
      const ast = parse('chart bar { width = 100 }')
      expect(ast.properties[0].value).toBe(100)
      expect(ast.properties[0].isPercentage).toBe(false)
    })

    it('parses string property values', () => {
      const ast = parse('chart bar { title = "Hello World" }')
      expect(ast.properties[0].value).toBe('Hello World')
    })

    it('parses multiple colorizes', () => {
      const input = `chart bar {
        colorize "A" { color = "#f00" }
        colorize "B" { color = "#0f0" }
      }`
      const ast = parse(input)
      expect(ast.colorizes).toHaveLength(2)
    })

    it('handles identifier property values', () => {
      const ast = parse('chart bar { sort = descending }')
      expect(ast.properties[0].value).toBe('descending')
    })

    it('handles hash color as identifier', () => {
      const ast = parse('chart bar { colorize "X" { color = #e53e3e } }')
      expect(ast.colorizes[0].properties[0].value).toBe('#e53e3e')
    })

    it('handles excessive whitespace', () => {
      const ast = parse('  \n  chart   bar   {  \n  title   =   "test"  \n  }  \n  ')
      expect(ast.chartType).toBe('bar')
      expect(ast.properties[0].value).toBe('test')
    })

    it('throws on empty input', () => {
      expect(() => parse('')).toThrow()
    })

    it('throws on missing chart keyword', () => {
      expect(() => parse('foo {}')).toThrow()
    })

    it('throws on unterminated string', () => {
      expect(() => parse('chart bar { title = "unclosed }')).toThrow()
    })
  })

  describe('highlight with body', () => {
    it('parses body-form "highlight" as a ColorizeNode tagged fromHighlight', () => {
      const ast = parse('chart bar {\n  highlight "X" {\n    color = "#ff0"\n  }\n}')
      expect(ast.highlights).toHaveLength(0)
      expect(ast.colorizes).toHaveLength(1)
      expect(ast.colorizes[0].type).toBe(DslNodeType.Colorize)
      expect(ast.colorizes[0].target).toBe('X')
      expect(ast.colorizes[0].fromHighlight).toBe(true)
      expect(ast.colorizes[0].properties).toHaveLength(1)
      expect(ast.colorizes[0].properties[0].value).toBe('#ff0')
    })

    it('round-trips body-form highlight back to the highlight keyword via fromHighlight', () => {
      const dsl = 'chart bar {\n  highlight "X" {\n    color = "#f00"\n  }\n}'
      const ast1 = parse(dsl)
      const serialized = serialize(ast1)
      expect(serialized).toContain('highlight "X"')
      expect(serialized).not.toContain('colorize "X"')
      const ast2 = parse(serialized)
      expect(ast2.colorizes).toHaveLength(1)
      expect(ast2.colorizes[0].fromHighlight).toBe(true)
      expect(ast2.colorizes[0].properties[0].key).toBe('color')
      expect(ast2.colorizes[0].properties[0].value).toBe('#f00')
    })
  })

  describe('numeric edge cases', () => {
    it('parses scientific notation', () => {
      const ast = parse('chart bar { x = 1e10 }')
      expect(ast.properties[0].value).toBe(1e10)
    })

    it('parses decimal scientific notation', () => {
      const ast = parse('chart bar { x = 1.5e6 }')
      expect(ast.properties[0].value).toBe(1.5e6)
    })

    it('parses leading-decimal numbers', () => {
      const ast = parse('chart bar { x = .5 }')
      expect(ast.properties[0].value).toBe(0.5)
    })

    it('parses trailing-decimal numbers', () => {
      const ast = parse('chart bar { x = 5. }')
      expect(ast.properties[0].value).toBe(5)
    })

    it('rejects double negative sign', () => {
      expect(() => parse('chart bar { x = --5 }')).toThrow()
    })

    it('rejects truncated exponent', () => {
      expect(() => parse('chart bar { x = 5e }')).toThrow()
    })
  })

  describe('string escape sequences', () => {
    it('parses \\r escape', () => {
      const ast = parse('chart bar { x = "a\\rb" }')
      expect(ast.properties[0].value).toBe('a\rb')
    })

    it('parses \\u unicode escape', () => {
      const ast = parse('chart bar { x = "\\u0041" }')
      expect(ast.properties[0].value).toBe('A')
    })

    it('rejects unknown escape sequences', () => {
      expect(() => parse('chart bar { x = "\\z" }')).toThrow(/Unknown escape/)
    })
  })

  describe('duplicate data blocks', () => {
    it('throws on duplicate chart-level data block', () => {
      expect(() => parse('chart bar { data { "A" = 1 } data { "B" = 2 } }')).toThrow(/duplicate data block/)
    })

    it('throws on duplicate scene-level data block', () => {
      expect(() => parse('chart bar { scene "S" { data { "A" = 1 } data { "B" = 2 } } }')).toThrow(/duplicate data block/)
    })
  })

  describe('comments', () => {
    it('parses line comment between members', () => {
      const ast = parse('chart bar {\n  // foo\n  x = 1\n}')
      expect(ast.properties).toHaveLength(1)
      expect(ast.properties[0].key).toBe('x')
    })

    it('parses block comment inside data block', () => {
      const ast = parse('chart bar {\n  data {\n    /* block comment */\n    "A" = 1\n  }\n}')
      expect(ast.data!.entries).toHaveLength(1)
    })

    it('parses line comment at end of file', () => {
      const ast = parse('chart bar {\n  x = 1\n} // trailing comment')
      expect(ast.properties[0].value).toBe(1)
    })

    it('parses block comment spanning multiple lines', () => {
      const ast = parse('chart bar {\n  /* multi\n     line\n     comment */\n  x = 1\n}')
      expect(ast.properties[0].key).toBe('x')
    })
  })

  describe('chart-level annotation visibility', () => {
    it('parses hide_annotation at chart level', () => {
      const ast = parse('chart bar {\n  hide_annotation "x"\n}')
      expect(ast.annotationVisibility).toHaveLength(1)
      expect(ast.annotationVisibility[0]).toEqual({
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Point,
        id: 'x',
      })
    })

    it('parses show_range at chart level', () => {
      const ast = parse('chart bar {\n  show_range "r1"\n}')
      expect(ast.annotationVisibility).toHaveLength(1)
      expect(ast.annotationVisibility[0].kind).toBe(AnnotationKind.Range)
    })
  })
})
