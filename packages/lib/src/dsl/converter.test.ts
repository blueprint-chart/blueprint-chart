import { describe, expect, it } from 'vitest'
import { DslNodeType, AnnotationKind, AnnotationAction, ChartType } from '../enums'
import {
  propertyMap,
  extractChartTypeOptions,
  dataEntriesToString,
  extractSceneOverrides,
  convertColorizes,
  convertAreaFills,
  convertAnnotations,
  convertSeriesOverrides,
} from './converter'
import type { PropertyNode, DataNode, SceneNode, ColorizeNode, AnnotationNode, AreaFillNode, SeriesNode } from './types'

function prop(key: string, value: string | number, isPercentage = false): PropertyNode {
  return { type: DslNodeType.Property, key, value, isPercentage }
}

describe('propertyMap', () => {
  it('converts empty array to empty map', () => {
    expect(propertyMap([])).toEqual(new Map())
  })

  it('converts properties to key-value map', () => {
    const map = propertyMap([
      prop('title', 'Hello'),
      prop('sort', 'descending'),
      prop('width', 100),
    ])
    expect(map.get('title')).toBe('Hello')
    expect(map.get('sort')).toBe('descending')
    expect(map.get('width')).toBe(100)
    expect(map.size).toBe(3)
  })

  it('last value wins for duplicate keys', () => {
    const map = propertyMap([
      prop('title', 'First'),
      prop('title', 'Second'),
    ])
    expect(map.get('title')).toBe('Second')
  })
})

describe('extractChartTypeOptions', () => {
  it('extracts boolean options correctly', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [
      prop('valueLabels', 'true'),
      prop('tooltips', 'false'),
    ])
    expect(opts.valueLabels).toBe(true)
    expect(opts.tooltips).toBe(false)
  })

  it('parses chart-level valueLabels = "percent" to the string "percent"', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [
      prop('valueLabels', 'percent'),
    ])
    expect(opts.valueLabels).toBe('percent')
  })

  it('parses chart-level valueLabels = "PERCENT" case-insensitively', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [
      prop('valueLabels', 'PERCENT'),
    ])
    expect(opts.valueLabels).toBe('percent')
  })

  it('keeps chart-level valueLabels = true as boolean true (regression)', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [
      prop('valueLabels', 'true'),
    ])
    expect(opts.valueLabels).toBe(true)
  })

  it('extracts string options correctly', () => {
    const opts = extractChartTypeOptions(ChartType.Line, [
      prop('interpolation', 'monotoneX'),
    ])
    expect(opts.interpolation).toBe('monotoneX')
  })

  it('extracts colors option as array', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [
      prop('colors', '#ff0000,#00ff00,#0000ff'),
    ])
    expect(opts.colors).toEqual(['#ff0000', '#00ff00', '#0000ff'])
  })

  it('ignores properties not in chart options registry', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [
      prop('nonExistentOption', 'value'),
    ])
    expect(opts).toEqual({})
  })

  it('skips undefined values', () => {
    const opts = extractChartTypeOptions(ChartType.BarVertical, [])
    expect(opts).toEqual({})
  })

  it('handles unknown chart type gracefully', () => {
    const opts = extractChartTypeOptions('unknown-chart-type', [
      prop('title', 'Hello'),
    ])
    expect(opts).toEqual({})
  })
})

describe('dataEntriesToString', () => {
  it('converts single-value entries', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        prop('Apple', 42),
        prop('Banana', 17),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"Apple" = 42\n"Banana" = 17')
  })

  it('preserves percentage syntax', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        prop('Firefox', 61.11, true),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"Firefox" = 61.11%')
  })

  it('handles series metadata key', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        prop('series', 'Revenue'),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('series = "Revenue"')
  })

  it('keeps a quoted "series" data row quoted instead of emitting the meta-row', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        { ...prop('series', 5), quotedKey: true },
        prop('movies', 9),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"series" = 5\n"movies" = 9')
  })

  it('converts multi-value entries', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        { type: DslNodeType.Property, key: 'series', value: 'Gold', isPercentage: false, values: ['Gold', 'Silver'] },
        { type: DslNodeType.Property, key: 'USA', value: 40, isPercentage: false, values: [40, 44] },
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toContain('series = "Gold","Silver"')
    expect(result).toContain('"USA" = 40,44')
  })

  it('handles string values with commas in legacy format', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        prop('Label', '10,20,30'),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"Label" = "10,20,30"')
  })

  it('quotes ISO date string values', () => {
    const data: DataNode = {
      type: DslNodeType.Data,
      entries: [
        prop('USA', '2022-09-25'),
        prop('China', '2022-10-01'),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"USA" = "2022-09-25"\n"China" = "2022-10-01"')
  })
})

describe('convertColorizes', () => {
  it('converts empty array', () => {
    expect(convertColorizes([])).toEqual([])
  })

  it('converts colorizes with default color', () => {
    const nodes: ColorizeNode[] = [{
      type: DslNodeType.Colorize,
      target: 'Apple',
      properties: [],
    }]
    const result = convertColorizes(nodes)
    expect(result).toEqual([{
      target: 'Apple',
      color: '#e15759',
      label: undefined,
    }])
  })

  it('converts colorizes with custom color and label', () => {
    const nodes: ColorizeNode[] = [{
      type: DslNodeType.Colorize,
      target: 'Revenue',
      properties: [
        prop('color', '#ff0000'),
        prop('label', 'Top performer'),
      ],
    }]
    const result = convertColorizes(nodes)
    expect(result).toEqual([{
      target: 'Revenue',
      color: '#ff0000',
      label: 'Top performer',
    }])
  })

  it('converts multiple colorizes', () => {
    const nodes: ColorizeNode[] = [
      { type: DslNodeType.Colorize, target: 'A', properties: [prop('color', '#f00')] },
      { type: DslNodeType.Colorize, target: 'B', properties: [prop('color', '#0f0')] },
    ]
    const result = convertColorizes(nodes)
    expect(result).toHaveLength(2)
    expect(result[0].target).toBe('A')
    expect(result[1].target).toBe('B')
  })
})

describe('convertAreaFills', () => {
  it('converts empty array', () => {
    expect(convertAreaFills([])).toEqual([])
  })

  it('converts area-fill with all properties', () => {
    const nodes: AreaFillNode[] = [{
      type: DslNodeType.AreaFill,
      from: 'Revenue',
      to: 'Cost',
      properties: [
        prop('color', '#0000ff'),
        prop('negativeColor', '#ff0000'),
        prop('opacity', 0.3),
        prop('interpolation', 'monotoneX'),
      ],
    }]
    const result = convertAreaFills(nodes)
    expect(result).toEqual([{
      from: 'Revenue',
      to: 'Cost',
      color: '#0000ff',
      negativeColor: '#ff0000',
      opacity: 0.3,
      interpolation: 'monotoneX',
    }])
  })

  it('omits undefined optional properties', () => {
    const nodes: AreaFillNode[] = [{
      type: DslNodeType.AreaFill,
      from: 'A',
      to: 'B',
      properties: [],
    }]
    const result = convertAreaFills(nodes)
    expect(result[0].color).toBeUndefined()
    expect(result[0].negativeColor).toBeUndefined()
    expect(result[0].opacity).toBeUndefined()
  })
})

describe('convertAnnotations', () => {
  it('converts empty array', () => {
    expect(convertAnnotations([])).toEqual([])
  })

  it('converts point annotation with minimal properties', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Point,
      target: 'Q3',
      properties: [prop('text', 'Peak quarter')],
    }]
    const result = convertAnnotations(nodes)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      kind: AnnotationKind.Point,
      target: 'Q3',
      text: 'Peak quarter',
    })
  })

  it('converts point annotation with all optional properties', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Point,
      target: 'X',
      properties: [
        prop('id', 'ann-1'),
        prop('text', 'Note'),
        prop('textColor', '#333'),
        prop('anchorDirection', 'NE'),
        prop('textOffsetX', 10),
        prop('textOffsetY', -5),
        prop('showLine', 'true'),
        prop('lineStyle', 'curve-left'),
        prop('lineWeight', 2),
        prop('showArrow', 'true'),
        prop('lineTargetDistance', 8),
        prop('showCircle', 'true'),
        prop('circleSize', 5),
        prop('circleStyle', 'dashed'),
        prop('circleColor', '#ff0000'),
        prop('textOutline', 'true'),
        { type: DslNodeType.Property, key: 'maxWidth', value: 120, isPercentage: false },
      ],
    }]
    const result = convertAnnotations(nodes)
    const ann = result[0]
    expect(ann.kind).toBe(AnnotationKind.Point)
    if (ann.kind === AnnotationKind.Point) {
      expect(ann.id).toBe('ann-1')
      expect(ann.textColor).toBe('#333')
      expect(ann.anchorDirection).toBe('NE')
      expect(ann.textOffsetX).toBe(10)
      expect(ann.textOffsetY).toBe(-5)
      expect(ann.showLine).toBe(true)
      expect(ann.lineStyle).toBe('curve-left')
      expect(ann.lineWeight).toBe(2)
      expect(ann.showArrow).toBe(true)
      expect(ann.lineTargetDistance).toBe(8)
      expect(ann.showCircle).toBe(true)
      expect(ann.circleSize).toBe(5)
      expect(ann.circleStyle).toBe('dashed')
      expect(ann.circleColor).toBe('#ff0000')
      expect(ann.textOutline).toBe(true)
      expect(ann.maxWidth).toBe(120)
    }
  })

  it('converts range annotation', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Range,
      properties: [
        prop('start', 2),
        prop('end', 5),
        prop('orientation', 'vertical'),
        prop('bgColor', '#eeeeee'),
        prop('bgOpacity', 0.5),
        prop('direction', 'horizontal'),
        prop('text', 'Region'),
        prop('textColor', '#333'),
        prop('id', 'r1'),
      ],
    }]
    const result = convertAnnotations(nodes)
    expect(result[0]).toMatchObject({
      kind: AnnotationKind.Range,
      start: 2,
      end: 5,
      orientation: 'vertical',
      bgColor: '#eeeeee',
      bgOpacity: 0.5,
      direction: 'horizontal',
      text: 'Region',
      textColor: '#333',
      id: 'r1',
    })
  })

  it('converts range annotation with string start/end', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Range,
      properties: [
        prop('start', 'Jan'),
        prop('end', 'Mar'),
      ],
    }]
    const result = convertAnnotations(nodes)
    expect(result[0]).toMatchObject({
      kind: AnnotationKind.Range,
      start: 'Jan',
      end: 'Mar',
    })
  })

  it('converts range annotation with anchor properties', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Range,
      properties: [
        prop('start', 0),
        prop('end', 10),
        prop('startAnchor', 'center'),
        prop('endAnchor', 'end'),
      ],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === AnnotationKind.Range) {
      expect(result[0].startAnchor).toBe('center')
      expect(result[0].endAnchor).toBe('end')
    }
  })

  it('defaults range start/end to 0 when missing', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Range,
      properties: [],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === AnnotationKind.Range) {
      expect(result[0].start).toBe(0)
      expect(result[0].end).toBe(0)
    }
  })

  it('converts free annotation', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Free,
      properties: [
        prop('text', 'Important note'),
        { type: DslNodeType.Property, key: 'x', value: 50, isPercentage: true },
        { type: DslNodeType.Property, key: 'y', value: 25, isPercentage: true },
        prop('id', 'n1'),
        prop('textColor', '#666'),
        prop('textOutline', 'true'),
      ],
    }]
    const result = convertAnnotations(nodes)
    expect(result[0]).toMatchObject({
      kind: AnnotationKind.Free,
      text: 'Important note',
      x: 50,
      y: 25,
      id: 'n1',
      textColor: '#666',
      textOutline: true,
    })
  })

  it('converts free annotation maxWidth with percentage', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Free,
      properties: [
        prop('text', 'Note'),
        prop('x', 0),
        prop('y', 0),
        { type: DslNodeType.Property, key: 'maxWidth', value: 50, isPercentage: true },
      ],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === AnnotationKind.Free) {
      expect(result[0].maxWidth).toBe('50%')
    }
  })

  it('converts free annotation maxWidth without percentage', () => {
    const nodes: AnnotationNode[] = [{
      type: DslNodeType.Annotation,
      kind: AnnotationKind.Free,
      properties: [
        prop('text', 'Note'),
        prop('x', 0),
        prop('y', 0),
        { type: DslNodeType.Property, key: 'maxWidth', value: 200, isPercentage: false },
      ],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === AnnotationKind.Free) {
      expect(result[0].maxWidth).toBe(200)
    }
  })

  it('converts mixed annotation types', () => {
    const nodes: AnnotationNode[] = [
      { type: DslNodeType.Annotation, kind: AnnotationKind.Point, target: 'X', properties: [prop('text', 'pt')] },
      { type: DslNodeType.Annotation, kind: AnnotationKind.Range, properties: [prop('start', 1), prop('end', 2)] },
      { type: DslNodeType.Annotation, kind: AnnotationKind.Free, properties: [prop('text', 'free'), prop('x', 10), prop('y', 20)] },
    ]
    const result = convertAnnotations(nodes)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe(AnnotationKind.Point)
    expect(result[1].kind).toBe(AnnotationKind.Range)
    expect(result[2].kind).toBe(AnnotationKind.Free)
  })
})

describe('convertSeriesOverrides', () => {
  it('converts empty array', () => {
    expect(convertSeriesOverrides([])).toEqual([])
  })

  it('converts series with name only', () => {
    const nodes: SeriesNode[] = [{
      type: DslNodeType.Series,
      name: 'Revenue',
      properties: [],
    }]
    const result = convertSeriesOverrides(nodes)
    expect(result).toEqual([{ name: 'Revenue' }])
  })

  it('converts series with all properties', () => {
    const nodes: SeriesNode[] = [{
      type: DslNodeType.Series,
      name: 'Revenue',
      properties: [
        prop('color', '#e15759'),
        prop('lineWidth', 3),
        prop('dash', 'dashed'),
        prop('interpolation', 'monotoneX'),
        prop('labelMode', 'auto'),
        prop('labelText', 'Rev'),
        prop('valueLabels', 'true'),
        prop('lineSymbols', 'true'),
        prop('hidden', 'false'),
        prop('symbolShape', 'circle'),
        prop('symbolShowOn', 'all'),
        prop('symbolStyle', 'filled'),
        prop('symbolSize', 5),
        prop('symbolOpacity', 0.8),
      ],
    }]
    const result = convertSeriesOverrides(nodes)
    expect(result[0]).toMatchObject({
      name: 'Revenue',
      color: '#e15759',
      lineWidth: 3,
      dash: 'dashed',
      interpolation: 'monotoneX',
      labelMode: 'auto',
      labelText: 'Rev',
      valueLabels: true,
      lineSymbols: true,
      hidden: false,
      symbolShape: 'circle',
      symbolShowOn: 'all',
      symbolStyle: 'filled',
      symbolSize: 5,
      symbolOpacity: 0.8,
    })
  })

  it('parses per-series valueLabels = "percent" to the string "percent"', () => {
    const nodes: SeriesNode[] = [{
      type: DslNodeType.Series,
      name: 'Revenue',
      properties: [prop('valueLabels', 'percent')],
    }]
    const result = convertSeriesOverrides(nodes)
    expect(result[0].valueLabels).toBe('percent')
  })

  it('converts multiple series', () => {
    const nodes: SeriesNode[] = [
      { type: DslNodeType.Series, name: 'A', properties: [prop('color', '#f00')] },
      { type: DslNodeType.Series, name: 'B', properties: [prop('color', '#0f0')] },
    ]
    const result = convertSeriesOverrides(nodes)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('A')
    expect(result[1].name).toBe('B')
  })
})

describe('extractSceneOverrides', () => {
  it('extracts basic scene overrides', () => {
    const scene: SceneNode = {
      type: DslNodeType.Scene,
      name: 'Overview',
      properties: [prop('title', 'Overview Chart')],
      data: null,
      colorizes: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      transforms: [],
    }
    const result = extractSceneOverrides(scene, ChartType.BarVertical)
    expect(result.name).toBe('Overview')
    expect(result.properties.get('title')).toBe('Overview Chart')
    expect(result.data).toBeNull()
    expect(result.chartType).toBeUndefined()
  })

  it('extracts chart type override from scene', () => {
    const scene: SceneNode = {
      type: DslNodeType.Scene,
      name: 'As Line',
      properties: [prop('type', ChartType.Line)],
      data: null,
      colorizes: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      transforms: [],
    }
    const result = extractSceneOverrides(scene, ChartType.BarVertical)
    expect(result.chartType).toBe(ChartType.Line)
  })

  it('passes through nested blocks', () => {
    const scene: SceneNode = {
      type: DslNodeType.Scene,
      name: 'Full',
      properties: [],
      data: {
        type: DslNodeType.Data,
        entries: [prop('A', 10)],
      },
      colorizes: [{
        type: DslNodeType.Colorize,
        target: 'A',
        properties: [prop('color', '#f00')],
      }],
      areaFills: [{
        type: DslNodeType.AreaFill,
        from: 'A',
        to: 'B',
        properties: [],
      }],
      annotations: [{
        type: DslNodeType.Annotation,
        kind: AnnotationKind.Point,
        target: 'A',
        properties: [prop('text', 'note')],
      }],
      annotationVisibility: [{
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Point,
        id: 'ann1',
      }],
      series: [{
        type: DslNodeType.Series,
        name: 'A',
        properties: [prop('color', '#0f0')],
      }],
      transforms: [{
        type: DslNodeType.Transform,
        transformType: 'cumulative',
        properties: [],
      }],
    }
    const result = extractSceneOverrides(scene, ChartType.BarVertical)
    expect(result.data).not.toBeNull()
    expect(result.colorizes).toHaveLength(1)
    expect(result.areaFills).toHaveLength(1)
    expect(result.annotations).toHaveLength(1)
    expect(result.annotationVisibility).toHaveLength(1)
    expect(result.series).toHaveLength(1)
    expect(result.transforms).toHaveLength(1)
  })

  it('returns null name for unnamed scene', () => {
    const scene: SceneNode = {
      type: DslNodeType.Scene,
      name: null,
      properties: [],
      data: null,
      colorizes: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      transforms: [],
    }
    const result = extractSceneOverrides(scene, ChartType.BarVertical)
    expect(result.name).toBeNull()
  })
})

function pointNode(props: Record<string, string | number>) {
  return {
    type: DslNodeType.Annotation,
    kind: AnnotationKind.Point,
    target: '2020',
    properties: Object.entries(props).map(([key, value]) => ({
      type: DslNodeType.Property, key, value, isPercentage: false,
    })),
  } as const
}

describe('convertAnnotations repeat', () => {
  it('defaults repeat to 1 when omitted', () => {
    const [a] = convertAnnotations([pointNode({ text: 'hi' })])
    expect(a.repeat).toBe(1)
  })

  it('maps repeat = true to "always"', () => {
    const [a] = convertAnnotations([pointNode({ text: 'hi', repeat: 'true' })])
    expect(a.repeat).toBe('always')
  })

  it('maps repeat = false to 1', () => {
    const [a] = convertAnnotations([pointNode({ text: 'hi', repeat: 'false' })])
    expect(a.repeat).toBe(1)
  })

  it('keeps a positive integer repeat', () => {
    const [a] = convertAnnotations([pointNode({ text: 'hi', repeat: 3 })])
    expect(a.repeat).toBe(3)
  })
})
