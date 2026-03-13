import { describe, expect, it } from 'vitest'
import {
  propertyMap,
  extractChartTypeOptions,
  dataEntriesToString,
  extractSceneOverrides,
  convertHighlights,
  convertAreaFills,
  convertAnnotations,
  convertSeriesOverrides,
} from './converter'
import type { PropertyNode, DataNode, SceneNode, HighlightNode, AnnotationNode, AreaFillNode, SeriesNode } from './types'

function prop(key: string, value: string | number, isPercentage = false): PropertyNode {
  return { type: 'property', key, value, isPercentage }
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
    const opts = extractChartTypeOptions('bar-vertical', [
      prop('valueLabels', 'true'),
      prop('tooltips', 'false'),
    ])
    expect(opts.valueLabels).toBe(true)
    expect(opts.tooltips).toBe(false)
  })

  it('extracts string options correctly', () => {
    const opts = extractChartTypeOptions('line', [
      prop('interpolation', 'monotoneX'),
    ])
    expect(opts.interpolation).toBe('monotoneX')
  })

  it('extracts colors option as array', () => {
    const opts = extractChartTypeOptions('bar-vertical', [
      prop('colors', '#ff0000,#00ff00,#0000ff'),
    ])
    expect(opts.colors).toEqual(['#ff0000', '#00ff00', '#0000ff'])
  })

  it('ignores properties not in chart options registry', () => {
    const opts = extractChartTypeOptions('bar-vertical', [
      prop('nonExistentOption', 'value'),
    ])
    expect(opts).toEqual({})
  })

  it('skips undefined values', () => {
    const opts = extractChartTypeOptions('bar-vertical', [])
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
      type: 'data',
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
      type: 'data',
      entries: [
        prop('Firefox', 61.11, true),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"Firefox" = 61.11%')
  })

  it('handles _series metadata key', () => {
    const data: DataNode = {
      type: 'data',
      entries: [
        prop('_series', 'Revenue'),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('_series = "Revenue"')
  })

  it('converts multi-value entries', () => {
    const data: DataNode = {
      type: 'data',
      entries: [
        { type: 'property', key: '_series', value: 'Gold', isPercentage: false, values: ['Gold', 'Silver'] },
        { type: 'property', key: 'USA', value: 40, isPercentage: false, values: [40, 44] },
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toContain('_series = "Gold","Silver"')
    expect(result).toContain('"USA" = 40,44')
  })

  it('handles string values with commas in legacy format', () => {
    const data: DataNode = {
      type: 'data',
      entries: [
        prop('Label', '10,20,30'),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"Label" = "10,20,30"')
  })

  it('quotes ISO date string values', () => {
    const data: DataNode = {
      type: 'data',
      entries: [
        prop('USA', '2022-09-25'),
        prop('China', '2022-10-01'),
      ],
    }
    const result = dataEntriesToString(data)
    expect(result).toBe('"USA" = "2022-09-25"\n"China" = "2022-10-01"')
  })
})

describe('convertHighlights', () => {
  it('converts empty array', () => {
    expect(convertHighlights([])).toEqual([])
  })

  it('converts highlights with default color', () => {
    const nodes: HighlightNode[] = [{
      type: 'highlight',
      target: 'Apple',
      properties: [],
    }]
    const result = convertHighlights(nodes)
    expect(result).toEqual([{
      target: 'Apple',
      color: '#e15759',
      label: undefined,
    }])
  })

  it('converts highlights with custom color and label', () => {
    const nodes: HighlightNode[] = [{
      type: 'highlight',
      target: 'Revenue',
      properties: [
        prop('color', '#ff0000'),
        prop('label', 'Top performer'),
      ],
    }]
    const result = convertHighlights(nodes)
    expect(result).toEqual([{
      target: 'Revenue',
      color: '#ff0000',
      label: 'Top performer',
    }])
  })

  it('converts multiple highlights', () => {
    const nodes: HighlightNode[] = [
      { type: 'highlight', target: 'A', properties: [prop('color', '#f00')] },
      { type: 'highlight', target: 'B', properties: [prop('color', '#0f0')] },
    ]
    const result = convertHighlights(nodes)
    expect(result).toHaveLength(2)
    expect(result[0].target).toBe('A')
    expect(result[1].target).toBe('B')
  })
})

describe('convertAreaFills', () => {
  it('converts empty array', () => {
    expect(convertAreaFills([])).toEqual([])
  })

  it('converts areafill with all properties', () => {
    const nodes: AreaFillNode[] = [{
      type: 'areafill',
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
      type: 'areafill',
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
      type: 'annotation',
      kind: 'point',
      target: 'Q3',
      properties: [prop('text', 'Peak quarter')],
    }]
    const result = convertAnnotations(nodes)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      kind: 'point',
      target: 'Q3',
      text: 'Peak quarter',
    })
  })

  it('converts point annotation with all optional properties', () => {
    const nodes: AnnotationNode[] = [{
      type: 'annotation',
      kind: 'point',
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
        { type: 'property', key: 'maxWidth', value: 120, isPercentage: false },
      ],
    }]
    const result = convertAnnotations(nodes)
    const ann = result[0]
    expect(ann.kind).toBe('point')
    if (ann.kind === 'point') {
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
      type: 'annotation',
      kind: 'range',
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
      kind: 'range',
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
      type: 'annotation',
      kind: 'range',
      properties: [
        prop('start', 'Jan'),
        prop('end', 'Mar'),
      ],
    }]
    const result = convertAnnotations(nodes)
    expect(result[0]).toMatchObject({
      kind: 'range',
      start: 'Jan',
      end: 'Mar',
    })
  })

  it('converts range annotation with anchor properties', () => {
    const nodes: AnnotationNode[] = [{
      type: 'annotation',
      kind: 'range',
      properties: [
        prop('start', 0),
        prop('end', 10),
        prop('startAnchor', 'center'),
        prop('endAnchor', 'end'),
      ],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === 'range') {
      expect(result[0].startAnchor).toBe('center')
      expect(result[0].endAnchor).toBe('end')
    }
  })

  it('defaults range start/end to 0 when missing', () => {
    const nodes: AnnotationNode[] = [{
      type: 'annotation',
      kind: 'range',
      properties: [],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === 'range') {
      expect(result[0].start).toBe(0)
      expect(result[0].end).toBe(0)
    }
  })

  it('converts free annotation', () => {
    const nodes: AnnotationNode[] = [{
      type: 'annotation',
      kind: 'free',
      properties: [
        prop('text', 'Important note'),
        { type: 'property', key: 'x', value: 50, isPercentage: true },
        { type: 'property', key: 'y', value: 25, isPercentage: true },
        prop('id', 'n1'),
        prop('textColor', '#666'),
        prop('textOutline', 'true'),
      ],
    }]
    const result = convertAnnotations(nodes)
    expect(result[0]).toMatchObject({
      kind: 'free',
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
      type: 'annotation',
      kind: 'free',
      properties: [
        prop('text', 'Note'),
        prop('x', 0),
        prop('y', 0),
        { type: 'property', key: 'maxWidth', value: 50, isPercentage: true },
      ],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === 'free') {
      expect(result[0].maxWidth).toBe('50%')
    }
  })

  it('converts free annotation maxWidth without percentage', () => {
    const nodes: AnnotationNode[] = [{
      type: 'annotation',
      kind: 'free',
      properties: [
        prop('text', 'Note'),
        prop('x', 0),
        prop('y', 0),
        { type: 'property', key: 'maxWidth', value: 200, isPercentage: false },
      ],
    }]
    const result = convertAnnotations(nodes)
    if (result[0].kind === 'free') {
      expect(result[0].maxWidth).toBe(200)
    }
  })

  it('converts mixed annotation types', () => {
    const nodes: AnnotationNode[] = [
      { type: 'annotation', kind: 'point', target: 'X', properties: [prop('text', 'pt')] },
      { type: 'annotation', kind: 'range', properties: [prop('start', 1), prop('end', 2)] },
      { type: 'annotation', kind: 'free', properties: [prop('text', 'free'), prop('x', 10), prop('y', 20)] },
    ]
    const result = convertAnnotations(nodes)
    expect(result).toHaveLength(3)
    expect(result[0].kind).toBe('point')
    expect(result[1].kind).toBe('range')
    expect(result[2].kind).toBe('free')
  })
})

describe('convertSeriesOverrides', () => {
  it('converts empty array', () => {
    expect(convertSeriesOverrides([])).toEqual([])
  })

  it('converts series with name only', () => {
    const nodes: SeriesNode[] = [{
      type: 'series',
      name: 'Revenue',
      properties: [],
    }]
    const result = convertSeriesOverrides(nodes)
    expect(result).toEqual([{ name: 'Revenue' }])
  })

  it('converts series with all properties', () => {
    const nodes: SeriesNode[] = [{
      type: 'series',
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

  it('converts multiple series', () => {
    const nodes: SeriesNode[] = [
      { type: 'series', name: 'A', properties: [prop('color', '#f00')] },
      { type: 'series', name: 'B', properties: [prop('color', '#0f0')] },
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
      type: 'scene',
      name: 'Overview',
      properties: [prop('title', 'Overview Chart')],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      transforms: [],
    }
    const result = extractSceneOverrides(scene, 'bar-vertical')
    expect(result.name).toBe('Overview')
    expect(result.properties.get('title')).toBe('Overview Chart')
    expect(result.data).toBeNull()
    expect(result.chartType).toBeUndefined()
  })

  it('extracts chart type override from scene', () => {
    const scene: SceneNode = {
      type: 'scene',
      name: 'As Line',
      properties: [prop('type', 'line')],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      transforms: [],
    }
    const result = extractSceneOverrides(scene, 'bar-vertical')
    expect(result.chartType).toBe('line')
  })

  it('passes through nested blocks', () => {
    const scene: SceneNode = {
      type: 'scene',
      name: 'Full',
      properties: [],
      data: {
        type: 'data',
        entries: [prop('A', 10)],
      },
      highlights: [{
        type: 'highlight',
        target: 'A',
        properties: [prop('color', '#f00')],
      }],
      areaFills: [{
        type: 'areafill',
        from: 'A',
        to: 'B',
        properties: [],
      }],
      annotations: [{
        type: 'annotation',
        kind: 'point',
        target: 'A',
        properties: [prop('text', 'note')],
      }],
      annotationVisibility: [{
        type: 'annotation-visibility',
        action: 'hide',
        kind: 'point',
        id: 'ann1',
      }],
      series: [{
        type: 'series',
        name: 'A',
        properties: [prop('color', '#0f0')],
      }],
      transforms: [{
        type: 'transform',
        transformType: 'cumulative',
        properties: [],
      }],
    }
    const result = extractSceneOverrides(scene, 'bar-vertical')
    expect(result.data).not.toBeNull()
    expect(result.highlights).toHaveLength(1)
    expect(result.areaFills).toHaveLength(1)
    expect(result.annotations).toHaveLength(1)
    expect(result.annotationVisibility).toHaveLength(1)
    expect(result.series).toHaveLength(1)
    expect(result.transforms).toHaveLength(1)
  })

  it('returns null name for unnamed scene', () => {
    const scene: SceneNode = {
      type: 'scene',
      name: null,
      properties: [],
      data: null,
      highlights: [],
      areaFills: [],
      annotations: [],
      annotationVisibility: [],
      series: [],
      transforms: [],
    }
    const result = extractSceneOverrides(scene, 'bar-vertical')
    expect(result.name).toBeNull()
  })
})
