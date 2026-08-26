import { describe, expect, it } from 'vitest'
import { DslNodeType, AnnotationKind, ChartType } from '../enums'
import {
  validateChart,
  POINT_ANNOTATION_KEYS,
  RANGE_ANNOTATION_KEYS,
  FREE_ANNOTATION_KEYS,
} from './validate'
import { convertAnnotations } from './converter'
import { listThemes } from '../charts/themes'
import { parse } from './parser'
import { TRANSFORM_TYPES } from '../transforms'
import type { ChartNode, SceneNode, PropertyNode, DataNode, AnnotationNode, TransformNode } from './types'

function prop(key: string, value: string | number | boolean, isPercentage = false): PropertyNode {
  return { type: DslNodeType.Property, key, value: value as string | number, isPercentage }
}

function data(...labels: string[]): DataNode {
  return {
    type: DslNodeType.Data,
    entries: labels.length
      ? labels.map((l, i) => prop(l, i + 1))
      : [prop('A', 1), prop('B', 2)],
  }
}

function transform(transformType: string): TransformNode {
  return { type: DslNodeType.Transform, transformType, properties: [] }
}

function chart(overrides: Partial<ChartNode> = {}): ChartNode {
  return {
    type: DslNodeType.Chart,
    chartType: ChartType.BarVertical,
    properties: [],
    data: data(),
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],

    series: [],
    scenes: [],
    transforms: [],
    ...overrides,
  }
}

function scene(overrides: Partial<SceneNode> = {}): SceneNode {
  return {
    type: DslNodeType.Scene,
    name: null,
    properties: [],
    data: null,
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],

    series: [],
    transforms: [],
    ...overrides,
  }
}

function pointAnnotation(props: PropertyNode[]): AnnotationNode {
  return { type: DslNodeType.Annotation, kind: AnnotationKind.Point, target: 'A', properties: props }
}
function rangeAnnotation(props: PropertyNode[]): AnnotationNode {
  return { type: DslNodeType.Annotation, kind: AnnotationKind.Range, properties: props }
}
function freeAnnotation(props: PropertyNode[]): AnnotationNode {
  return { type: DslNodeType.Annotation, kind: AnnotationKind.Free, properties: props }
}

function codes(issues: { code: string }[]): string[] {
  return issues.map(i => i.code)
}

describe('validateChart', () => {
  it('passes a minimal valid chart', () => {
    const result = validateChart(chart())
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
  })

  describe('chart type', () => {
    it('flags an unknown chart type with a suggestion', () => {
      const result = validateChart(chart({ chartType: 'bar-verticl' }))
      const issue = result.errors.find(e => e.code === 'unknown-chart-type')
      expect(issue).toBeDefined()
      expect(issue?.suggestion).toBe('bar-vertical')
      expect(result.valid).toBe(false)
    })

    it('does not cascade unknown-property errors when the type is unknown', () => {
      const result = validateChart(chart({
        chartType: 'nonsense',
        properties: [prop('tooltips', 'true')],
      }))
      expect(codes(result.errors)).toContain('unknown-chart-type')
      expect(codes(result.errors)).not.toContain('unknown-property')
    })

    it('accepts a registered alias chart type', () => {
      const result = validateChart(chart({ chartType: ChartType.VerticalBar }))
      expect(result.valid).toBe(true)
    })
  })

  describe('unknown property keys', () => {
    it('flags an unknown property with a nearest-neighbour suggestion', () => {
      const result = validateChart(chart({ properties: [prop('tooltps', 'true')] }))
      const issue = result.errors.find(e => e.code === 'unknown-property')
      expect(issue).toBeDefined()
      expect(issue?.suggestion).toBe('tooltips')
    })

    it('allows FRAME_KEYS even though they are not option defs', () => {
      const result = validateChart(chart({
        properties: [
          prop('title', 'Hello'),
          prop('description', 'Sub'),
          prop('byline', 'Me'),
          prop('source', 'Src'),
          prop('sourceUrl', 'https://x'),
          prop('note', 'n'),
          prop('theme', 'blueprint-bold'),
          prop('heightMode', 'aspect-ratio'),
          prop('aspectRatio', '16:9'),
          prop('fixedHeight', 400),
          prop('transparentBackground', 'true'),
        ],
      }))
      expect(result.valid).toBe(true)
    })

    it('allows a known option key for the chart type', () => {
      const result = validateChart(chart({ properties: [prop('barGap', '0.2')] }))
      expect(result.valid).toBe(true)
    })
  })

  describe('series meta-row warnings', () => {
    it('warns when an unquoted series row has only numeric values', () => {
      const result = validateChart(chart({ data: { type: DslNodeType.Data, entries: [prop('series', 5), prop('movies', 9)] } }))
      const warning = result.warnings.find(w => w.code === 'numeric-series-meta-row')
      expect(warning).toBeDefined()
      expect(warning?.suggestion).toBe('"series" = 5')
      expect(result.valid).toBe(true)
    })

    it('warns when the series meta-row is not the first data entry', () => {
      const entries = [
        { ...prop('2023', 1), values: [1, 2] },
        { ...prop('series', 'A'), values: ['A', 'B'] },
      ]
      const result = validateChart(chart({ data: { type: DslNodeType.Data, entries } }))
      expect(result.warnings.find(w => w.code === 'misplaced-series-meta-row')).toBeDefined()
    })

    it('does not warn for a well-formed leading meta-row or a quoted series row', () => {
      const good = [
        { ...prop('series', 'A'), values: ['A', 'B'] },
        { ...prop('2023', 1), values: [1, 2] },
      ]
      expect(validateChart(chart({ data: { type: DslNodeType.Data, entries: good } })).warnings).toHaveLength(0)
      const quoted = [{ ...prop('series', 5), quotedKey: true }, prop('movies', 9)]
      expect(validateChart(chart({ data: { type: DslNodeType.Data, entries: quoted } })).warnings).toHaveLength(0)
    })
  })

  describe('duplicate data keys', () => {
    it('warns which rows share a label and how they are numbered', () => {
      const entries = [prop('Alpha', 42), prop('Alpha', 17), prop('Beta', 63), prop('Alpha', 8)]
      const result = validateChart(chart({ data: { type: DslNodeType.Data, entries } }))
      const warning = result.warnings.find(w => w.code === 'duplicate-data-key')
      expect(warning).toBeDefined()
      expect(warning?.path).toBe('data.Alpha')
      expect(warning?.message).toContain('3 rows')
      expect(warning?.suggestion).toBe('"Alpha (2)"')
      expect(result.valid).toBe(true)
    })

    it('does not warn when every row has its own label', () => {
      expect(validateChart(chart({ data: data('Alpha', 'Beta') })).warnings).toHaveLength(0)
    })
  })

  describe('unresolved highlight / colorize targets', () => {
    it('warns when a highlight target matches no category', () => {
      const result = validateChart(chart({
        data: data('Alpha', 'Beta'),
        highlights: [{ type: DslNodeType.Highlight, target: 'Betaa', properties: [] }],
      }))
      const warning = result.warnings.find(w => w.code === 'unresolved-target')
      expect(warning).toBeDefined()
      expect(warning?.path).toBe('chart.highlight[0]')
      expect(warning?.suggestion).toBe('Beta')
      expect(result.valid).toBe(true)
    })

    it('warns when a colorize target matches no category', () => {
      const result = validateChart(chart({
        colorizes: [{ type: DslNodeType.Colorize, target: 'Nope', properties: [] }],
      }))
      expect(result.warnings.find(w => w.code === 'unresolved-target')?.path).toBe('chart.colorize[0]')
    })

    it('does not warn for a target that names a category', () => {
      const result = validateChart(chart({
        highlights: [{ type: DslNodeType.Highlight, target: 'B', properties: [] }],
      }))
      expect(result.warnings).toHaveLength(0)
    })

    it('does not warn for a target that names a series', () => {
      const entries = [
        { ...prop('series', 'Alpha'), values: ['Alpha', 'Beta'] },
        { ...prop('Q1', 1), values: [1, 2] },
      ]
      const result = validateChart(chart({
        data: { type: DslNodeType.Data, entries },
        highlights: [{ type: DslNodeType.Highlight, target: 'Beta', properties: [] }],
      }))
      expect(result.warnings).toHaveLength(0)
    })

    it('does not warn when the target only exists in a scene data block', () => {
      const result = validateChart(chart({
        highlights: [{ type: DslNodeType.Highlight, target: 'Z', properties: [] }],
        scenes: [scene({ data: data('Y', 'Z') })],
      }))
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('boolean-typed options', () => {
    it('flags tooltips = yes', () => {
      const result = validateChart(chart({ properties: [prop('tooltips', 'yes')] }))
      const issue = result.errors.find(e => e.code === 'invalid-boolean')
      expect(issue).toBeDefined()
      expect(issue?.suggestion).toBe('true')
    })

    it('flags tooltips = no with a false suggestion', () => {
      const result = validateChart(chart({ properties: [prop('tooltips', 'no')] }))
      const issue = result.errors.find(e => e.code === 'invalid-boolean')
      expect(issue?.suggestion).toBe('false')
    })

    it('flags numeric and uppercase boolean spellings', () => {
      expect(validateChart(chart({ properties: [prop('tooltips', '1')] })).valid).toBe(false)
      expect(validateChart(chart({ properties: [prop('tooltips', 'TRUE')] })).valid).toBe(true)
    })

    it('suggests false for 0 and off spellings', () => {
      const zero = validateChart(chart({ properties: [prop('tooltips', '0')] }))
      expect(zero.errors.find(e => e.code === 'invalid-boolean')?.suggestion).toBe('false')
      const off = validateChart(chart({ properties: [prop('tooltips', 'off')] }))
      expect(off.errors.find(e => e.code === 'invalid-boolean')?.suggestion).toBe('false')
    })

    it('accepts true / false strings and real booleans', () => {
      expect(validateChart(chart({ properties: [prop('tooltips', 'true')] })).valid).toBe(true)
      expect(validateChart(chart({ properties: [prop('tooltips', 'false')] })).valid).toBe(true)
      expect(validateChart(chart({ properties: [prop('tooltips', true)] })).valid).toBe(true)
      // The real-boolean `false` branch (distinct from the string spelling).
      expect(validateChart(chart({ properties: [prop('tooltips', false)] })).valid).toBe(true)
    })

    it('preserves the valueLabels = percent special case', () => {
      const result = validateChart(chart({ properties: [prop('valueLabels', 'percent')] }))
      expect(result.valid).toBe(true)
    })

    it('still rejects a bogus valueLabels value', () => {
      const result = validateChart(chart({ properties: [prop('valueLabels', 'pct')] }))
      expect(result.errors.find(e => e.code === 'invalid-boolean')).toBeDefined()
    })
  })

  describe('choice-typed options', () => {
    it('flags lineSymbolShape = "diamondd" with nearest suggestion', () => {
      const result = validateChart(chart({
        chartType: ChartType.Line,
        properties: [prop('lineSymbolShape', 'diamondd')],
      }))
      const issue = result.errors.find(e => e.code === 'invalid-choice')
      expect(issue).toBeDefined()
      expect(issue?.suggestion).toBe('diamond')
    })

    it('accepts a valid choice value', () => {
      const result = validateChart(chart({
        chartType: ChartType.Line,
        properties: [prop('lineSymbolShape', 'square')],
      }))
      expect(result.valid).toBe(true)
    })

    it('accepts the empty-string choice (unset) for colorPalette', () => {
      // colorPalette lists '' among its choices (means "unset"); an explicitly
      // empty value must be accepted via the empty-string allowlist branch.
      const result = validateChart(chart({
        chartType: ChartType.Line,
        properties: [prop('colorPalette', '')],
      }))
      expect(result.valid).toBe(true)
    })

    it('omits the suggestion when nothing is close enough', () => {
      // A value far from every interpolation choice exceeds the edit-distance
      // threshold, so nearest() returns undefined and no suggestion is offered.
      const result = validateChart(chart({
        chartType: ChartType.Line,
        properties: [prop('interpolation', 'zzzzzzzzzz')],
      }))
      const issue = result.errors.find(e => e.code === 'invalid-choice')
      expect(issue).toBeDefined()
      expect(issue?.suggestion).toBeUndefined()
    })
  })

  describe('transforms', () => {
    it('accepts the sort transform', () => {
      const result = validateChart(chart({ transforms: [transform('sort')] }))
      expect(result.valid).toBe(true)
    })

    it('accepts every transform type the pipeline executes', () => {
      for (const type of TRANSFORM_TYPES) {
        const result = validateChart(chart({ transforms: [transform(type)] }))
        expect(result.errors.find(e => e.code === 'unknown-transform'), type).toBeUndefined()
      }
    })

    it('flags a bogus transform type and lists known types', () => {
      const result = validateChart(chart({ transforms: [transform('bogus')] }))
      const issue = result.errors.find(e => e.code === 'unknown-transform')
      expect(issue).toBeDefined()
      expect(issue?.message).toContain('"sort"')
    })

    it('suggests sort for a near miss', () => {
      const result = validateChart(chart({ transforms: [transform('srot')] }))
      const issue = result.errors.find(e => e.code === 'unknown-transform')
      expect(issue?.suggestion).toBe('sort')
    })
  })

  describe('annotation body keys', () => {
    it('flags fromX/toX silently-ignored on a range annotation', () => {
      const result = validateChart(chart({
        annotations: [rangeAnnotation([prop('fromX', '1'), prop('toX', '5')])],
      }))
      const issues = result.errors.filter(e => e.code === 'unknown-annotation-property')
      expect(issues).toHaveLength(2)
      expect(issues[0].path).toContain('range')
    })

    it('accepts valid range keys', () => {
      const result = validateChart(chart({
        annotations: [rangeAnnotation([prop('start', '1'), prop('end', '5'), prop('bgColor', '#eee')])],
      }))
      expect(result.valid).toBe(true)
    })

    it('flags an unknown key on a point annotation with a suggestion', () => {
      const result = validateChart(chart({
        annotations: [pointAnnotation([prop('text', 'hi'), prop('textColr', '#000')])],
      }))
      const issue = result.errors.find(e => e.code === 'unknown-annotation-property')
      expect(issue).toBeDefined()
      expect(issue?.suggestion).toBe('textColor')
    })

    it('accepts valid point keys', () => {
      const result = validateChart(chart({
        annotations: [pointAnnotation([prop('text', 'hi'), prop('showLine', 'true'), prop('lineWeight', 2)])],
      }))
      expect(result.valid).toBe(true)
    })

    it('flags a range-only key used on a note (free) annotation', () => {
      const result = validateChart(chart({
        annotations: [freeAnnotation([prop('text', 'hi'), prop('x', 1), prop('y', 2), prop('start', 0)])],
      }))
      const issue = result.errors.find(e => e.code === 'unknown-annotation-property')
      expect(issue).toBeDefined()
      expect(issue?.path).toContain('note')
    })

    it('accepts valid free/note keys', () => {
      const result = validateChart(chart({
        annotations: [freeAnnotation([prop('text', 'hi'), prop('x', 1), prop('y', 2), prop('maxWidth', 120)])],
      }))
      expect(result.valid).toBe(true)
    })
  })

  describe('data presence', () => {
    it('flags a missing data block', () => {
      const result = validateChart(chart({ data: null }))
      expect(result.errors.find(e => e.code === 'missing-data')).toBeDefined()
    })

    it('flags an empty data block', () => {
      const result = validateChart(chart({ data: { type: DslNodeType.Data, entries: [] } }))
      const issue = result.errors.find(e => e.code === 'missing-data')
      expect(issue?.message).toContain('empty')
    })

    it('does not flag missing chart data when a scene supplies data', () => {
      const result = validateChart(chart({
        data: null,
        scenes: [scene({ data: data() })],
      }))
      expect(result.errors.find(e => e.code === 'missing-data')).toBeUndefined()
    })
  })

  describe('scenes', () => {
    it('validates scene properties against the chart type', () => {
      const result = validateChart(chart({
        scenes: [scene({ properties: [prop('tooltips', 'yes')] })],
      }))
      const issue = result.errors.find(e => e.code === 'invalid-boolean')
      expect(issue).toBeDefined()
      expect(issue?.path).toContain('scene[0]')
    })

    it('uses the scene type override to pick the effective chart type', () => {
      // lineSymbolShape is a Line option, not a BarVertical one. With a scene
      // type override to line, the property becomes valid.
      const result = validateChart(chart({
        scenes: [scene({ properties: [prop('type', ChartType.Line), prop('lineSymbolShape', 'square')] })],
      }))
      expect(result.valid).toBe(true)
    })

    it('flags an unknown scene type override', () => {
      const result = validateChart(chart({
        scenes: [scene({ properties: [prop('type', 'bogus-type')] })],
      }))
      const issue = result.errors.find(e => e.code === 'unknown-chart-type')
      expect(issue?.path).toBe('scene[0].type')
    })

    it('validates annotations and transforms inside scenes', () => {
      const result = validateChart(chart({
        scenes: [scene({
          annotations: [rangeAnnotation([prop('fromX', '1')])],
          transforms: [transform('bogus')],
        })],
      }))
      expect(codes(result.errors)).toContain('unknown-annotation-property')
      expect(codes(result.errors)).toContain('unknown-transform')
    })
  })

  it('reports multiple independent issues at once', () => {
    const result = validateChart(chart({
      properties: [prop('tooltips', 'yes'), prop('madeUpKey', '1')],
      transforms: [transform('bogus')],
      annotations: [rangeAnnotation([prop('fromX', '1')])],
    }))
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
    expect(result.valid).toBe(false)
  })
})

/**
 * Parity guard: every key in the validator's annotation allowlists must be a
 * key the converter actually consumes. If convertAnnotations stops reading a
 * key (or the allowlist gains a key the converter never reads), the validator
 * would wrongly approve a property that is silently dropped at render time.
 * This catches that drift without hand-maintaining a second mirror list.
 */
describe('annotation allowlist / converter parity', () => {
  /** Build a type-appropriate sample value for a given annotation key. */
  function sampleProp(key: string): PropertyNode {
    if (/offset|weight|size|distance|opacity|width/i.test(key)) {
      return prop(key, 1)
    }
    if (/^show/.test(key) || key === 'textOutline') {
      return prop(key, 'true')
    }
    return prop(key, 'sample')
  }

  const cases: Array<{
    name: string
    keys: Set<string>
    build: (props: PropertyNode[]) => AnnotationNode
  }> = [
    { name: 'point', keys: POINT_ANNOTATION_KEYS, build: pointAnnotation },
    { name: 'range', keys: RANGE_ANNOTATION_KEYS, build: rangeAnnotation },
    { name: 'free', keys: FREE_ANNOTATION_KEYS, build: freeAnnotation },
  ]

  for (const { name, keys, build } of cases) {
    for (const key of keys) {
      it(`converter consumes ${name} annotation key "${key}"`, () => {
        const node = build([sampleProp(key)])
        const [config] = convertAnnotations([node])
        // The converter maps every allowlisted key onto an identically-named
        // output field (maxWidth via readMaxWidth, start/end via coercion).
        expect(config).toHaveProperty(key)
      })
    }
  }
})

describe('comments do not affect validation', () => {
  it('a chart with // comments has no errors or warnings', () => {
    const ast = parse(`chart bar-vertical {
  // headline
  title = "Hi"
  // each row is a bar
  data {
    // the leader
    "A" = 10
    "B" = 5
  }
  // pop the leader
  highlight "A"
}`)
    const result = validateChart(ast)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
  })
})

describe('annotation id removal and repeat validation', () => {
  it('rejects the removed id property on an annotation', () => {
    const ast = parse(`chart line {\n  annotation "2020" { id = "x" text = "t" }\n  data { "2020" = 1 }\n}`)
    const { errors } = validateChart(ast)
    expect(errors.some(e => e.code === 'unknown-annotation-property')).toBe(true)
  })

  it('accepts repeat = true / false / positive int', () => {
    for (const r of ['true', 'false', '3']) {
      const ast = parse(`chart line {\n  annotation "2020" { text = "t" repeat = ${r} }\n  data { "2020" = 1 }\n}`)
      const { errors } = validateChart(ast)
      expect(errors.filter(e => e.code === 'invalid-annotation-repeat')).toHaveLength(0)
    }
  })

  it('accepts repeat in any case, matching what the converter reads', () => {
    for (const r of ['TRUE', 'True', 'FALSE', 'False']) {
      const ast = parse(`chart line {\n  annotation "2020" { text = "t" repeat = ${r} }\n  data { "2020" = 1 }\n}`)
      const { errors } = validateChart(ast)
      expect(errors.filter(e => e.code === 'invalid-annotation-repeat')).toHaveLength(0)
    }
  })

  it('rejects repeat = 0, negative, or non-integer', () => {
    for (const r of ['0', '-2', '1.5']) {
      const ast = parse(`chart line {\n  annotation "2020" { text = "t" repeat = ${r} }\n  data { "2020" = 1 }\n}`)
      const { errors } = validateChart(ast)
      expect(errors.some(e => e.code === 'invalid-annotation-repeat')).toBe(true)
    }
  })
})

describe('theme names', () => {
  it('accepts every registered theme', () => {
    for (const theme of listThemes()) {
      const result = validateChart(chart({ properties: [prop('theme', theme.name)] }))
      expect(result.errors, `theme "${theme.name}"`).toEqual([])
    }
  })

  it('rejects a theme with no stylesheet', () => {
    const result = validateChart(chart({ properties: [prop('theme', 'dark')] }))
    const issue = result.errors.find(e => e.code === 'invalid-choice')
    expect(issue).toBeDefined()
    expect(issue?.path).toBe('chart.theme')
  })

  it('suggests the nearest theme on a casing typo', () => {
    const result = validateChart(chart({ properties: [prop('theme', 'blueprint-Bold')] }))
    expect(result.errors.find(e => e.code === 'invalid-choice')?.suggestion).toBe('blueprint-bold')
  })
})

describe('layout properties written by the editor', () => {
  it('accepts the five layout keys useDslOutput emits', () => {
    const result = validateChart(chart({
      properties: [
        prop('sizing', 'fixed'),
        prop('fixedWidth', 700),
        prop('maxWidth', 900),
        prop('player', 'dot-stepper'),
        prop('playerPosition', 'center'),
      ],
    }))
    expect(result.errors).toEqual([])
  })

  it('rejects an unknown player with a nearest suggestion', () => {
    const result = validateChart(chart({ properties: [prop('player', 'dot-steper')] }))
    const issue = result.errors.find(e => e.code === 'invalid-choice')
    expect(issue?.path).toBe('chart.player')
    expect(issue?.suggestion).toBe('dot-stepper')
  })

  it('rejects an unknown playerPosition', () => {
    const result = validateChart(chart({ properties: [prop('playerPosition', 'bottom')] }))
    expect(result.errors.find(e => e.code === 'invalid-choice')?.path).toBe('chart.playerPosition')
  })
})

describe('sizes with a natural floor', () => {
  it('rejects a negative lineSymbolSize', () => {
    const result = validateChart(chart({
      chartType: ChartType.Line,
      properties: [prop('lineSymbolSize', '-5')],
    }))
    const issue = result.errors.find(e => e.code === 'invalid-number')
    expect(issue).toBeDefined()
    expect(issue?.path).toBe('chart.lineSymbolSize')
  })

  it('accepts a zero lineSymbolSize', () => {
    const result = validateChart(chart({
      chartType: ChartType.Line,
      properties: [prop('lineSymbolSize', '0')],
    }))
    expect(result.errors).toEqual([])
  })

  it('rejects a negative fixedHeight', () => {
    const result = validateChart(chart({ properties: [prop('fixedHeight', -400)] }))
    expect(result.errors.some(e => e.code === 'invalid-number')).toBe(true)
  })

  it('rejects a negative annotation circleSize', () => {
    const result = validateChart(chart({
      annotations: [pointAnnotation([prop('text', 'neg'), prop('showCircle', 'true'), prop('circleSize', -8)])],
    }))
    const issue = result.errors.find(e => e.code === 'invalid-number')
    expect(issue).toBeDefined()
    expect(issue?.message).toContain('circleSize')
  })

  it('accepts a positive annotation circleSize', () => {
    const result = validateChart(chart({
      annotations: [pointAnnotation([prop('text', 'ok'), prop('showCircle', 'true'), prop('circleSize', 8)])],
    }))
    expect(result.errors).toEqual([])
  })

  it('accepts a percentage maxWidth', () => {
    const result = validateChart(chart({ properties: [prop('maxWidth', '50%')] }))
    expect(result.errors).toEqual([])
  })
})

describe('an empty frame-choice value means unset', () => {
  it('accepts theme, player and playerPosition set to an empty string', () => {
    for (const key of ['theme', 'player', 'playerPosition']) {
      const result = validateChart(chart({ properties: [prop(key, '')] }))
      expect(result.errors, key).toEqual([])
    }
  })
})

describe('series override blocks', () => {
  function seriesNode(props: PropertyNode[]) {
    return { type: DslNodeType.Series, name: 'A', properties: props } as const
  }

  it('flags an unknown series property key', () => {
    const result = validateChart(chart({
      chartType: ChartType.Line,
      series: [seriesNode([prop('colour', 'red')])],
    }))
    const issue = result.errors.find(e => e.code === 'unknown-series-property')
    expect(issue).toBeDefined()
    expect(issue?.path).toBe('chart.series[0].colour')
    expect(issue?.suggestion).toBe('color')
  })

  it('flags an interpolation value the renderer does not know', () => {
    const result = validateChart(chart({
      chartType: ChartType.Line,
      series: [seriesNode([prop('interpolation', 'monotone')])],
    }))
    const issue = result.errors.find(e => e.code === 'invalid-choice')
    expect(issue).toBeDefined()
    expect(issue?.path).toBe('chart.series[0].interpolation')
    expect(issue?.suggestion).toBe('monotoneX')
  })

  it('accepts the series keys the converter reads', () => {
    const result = validateChart(chart({
      chartType: ChartType.Line,
      series: [seriesNode([
        prop('color', '#f00'),
        prop('lineWidth', 2),
        prop('dash', '4 2'),
        prop('interpolation', 'monotoneX'),
        prop('labelMode', 'auto'),
        prop('labelText', 'A'),
        prop('valueLabels', 'percent'),
        prop('lineSymbols', 'true'),
        prop('hidden', 'false'),
        prop('symbolShape', 'circle'),
        prop('symbolShowOn', 'firstLast'),
        prop('symbolStyle', 'filled'),
        prop('symbolSize', 4),
        prop('symbolOpacity', 0.5),
      ])],
    }))
    expect(result.errors).toEqual([])
  })

  it('validates series blocks inside a scene', () => {
    const result = validateChart(chart({
      chartType: ChartType.Line,
      scenes: [scene({ series: [seriesNode([prop('interpolation', 'monotone')])] })],
    }))
    expect(result.errors.some(e => e.path === 'scene[0].series[0].interpolation')).toBe(true)
  })
})
