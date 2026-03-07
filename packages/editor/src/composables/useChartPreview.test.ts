import { describe, it, expect } from 'vitest'
import type { AnnotationConfig, SeriesOverride } from '@blueprint-chart/lib'
import { resolveScene } from './useChartPreview'
import type { SceneOverride } from './useScenes'
import type { TransformStep } from './useDataTransforms'

function scene(overrides: Partial<SceneOverride> = {}): SceneOverride {
  return { id: Math.random().toString(36).slice(2), name: null, ...overrides }
}

describe('resolveScene', () => {
  it('inherits highlights from prior scene when current scene has none', () => {
    const scenes = [
      scene({ highlights: [{ target: 'India', color: '#00d084' }] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.highlights).toEqual([{ target: 'India', color: '#00d084' }])
  })

  it('inherits highlights from prior scene even when current scene has empty highlights array', () => {
    const scenes = [
      scene({ highlights: [{ target: 'India', color: '#00d084' }] }),
      scene({ highlights: [] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.highlights).toEqual([{ target: 'India', color: '#00d084' }])
  })

  it('later scene with non-empty highlights replaces prior highlights', () => {
    const scenes = [
      scene({ highlights: [{ target: 'India', color: '#00d084' }] }),
      scene({ highlights: [{ target: 'China', color: '#ff0000' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.highlights).toEqual([{ target: 'China', color: '#ff0000' }])
  })

  it('inherits seriesOverrides from prior scene when current has empty array', () => {
    const earlyOverrides: SeriesOverride[] = [{ name: 'A', color: 'red' }]
    const scenes = [
      scene({ seriesOverrides: earlyOverrides }),
      scene({ seriesOverrides: [] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.seriesOverrides).toEqual(earlyOverrides)
  })

  it('returns null for negative index', () => {
    expect(resolveScene([scene()], -1)).toBeNull()
  })

  it('returns null for out-of-bounds index', () => {
    expect(resolveScene([scene()], 5)).toBeNull()
  })

  it('returns the scene itself when it is the only one', () => {
    const s = scene({ chartType: 'line' })
    const result = resolveScene([s], 0)!
    expect(result.chartType).toBe('line')
  })

  it('inherits chartType from a prior scene', () => {
    const scenes = [
      scene({ chartType: 'line' }),
      scene({ highlights: [{ target: 'A', color: 'red' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartType).toBe('line')
    expect(result.highlights).toEqual([{ target: 'A', color: 'red' }])
  })

  it('later scene overrides chartType from earlier scene', () => {
    const scenes = [
      scene({ chartType: 'line' }),
      scene({ chartType: 'bar-vertical' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartType).toBe('bar-vertical')
  })

  it('deep-merges chartTypeOptions across scenes', () => {
    const scenes = [
      scene({ chartTypeOptions: { colors: ['red'], legend: true } }),
      scene({ chartTypeOptions: { legend: false } }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartTypeOptions).toEqual({ colors: ['red'], legend: false })
  })

  it('inherits data from prior scene', () => {
    const scenes = [
      scene({ data: 'A,1\nB,2' }),
      scene({ chartType: 'line' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.data).toBe('A,1\nB,2')
    expect(result.chartType).toBe('line')
  })

  it('data cascades through multiple scenes', () => {
    const scenes = [
      scene({ data: 'X,1\nY,2' }),
      scene({}),
      scene({}),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.data).toBe('X,1\nY,2')
  })

  it('later scene data overrides earlier scene data', () => {
    const scenes = [
      scene({ data: 'A,1' }),
      scene({ data: 'B,2' }),
      scene({}),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.data).toBe('B,2')
  })

  it('empty string data is a valid override (clears inherited data)', () => {
    const scenes = [
      scene({ data: 'A,1\nB,2' }),
      scene({ data: '' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.data).toBe('')
  })

  it('does not inherit from scenes after the active index', () => {
    const scenes = [
      scene({ chartType: 'line' }),
      scene({}),
      scene({ chartType: 'donut' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.chartType).toBe('line')
  })

  it('preserves id and name from the active scene', () => {
    const scenes = [
      scene({ name: 'First' }),
      scene({ name: 'Second' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.name).toBe('Second')
    expect(result.id).toBe(scenes[1].id)
  })

  it('replaces (not merges) highlights from later scene', () => {
    const scenes = [
      scene({ highlights: [{ target: 'A', color: 'red' }] }),
      scene({ highlights: [{ target: 'B', color: 'blue' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.highlights).toEqual([{ target: 'B', color: 'blue' }])
  })

  it('hide_annotation in a scene populates hiddenAnnotationIds', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['abc']))
  })

  it('show_annotation after hide removes from hiddenAnnotationIds', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
      scene({ annotationVisibility: [{ action: 'show', kind: 'point', id: 'abc' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.hiddenAnnotationIds).toBeUndefined()
  })

  it('hide cascades across multiple scenes', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['abc']))
  })

  it('show in later scene overrides hide from earlier scene', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'range', id: 'x' }] }),
      scene({}),
      scene({ annotationVisibility: [{ action: 'show', kind: 'range', id: 'x' }] }),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.hiddenAnnotationIds).toBeUndefined()
  })

  it('multiple hides accumulate across scenes', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'a' }] }),
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'b' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['a', 'b']))
  })

  it('hiddenAnnotationIds is undefined when no visibility directives exist', () => {
    const scenes = [
      scene({ chartType: 'line' }),
      scene({ chartType: 'bar-vertical' }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.hiddenAnnotationIds).toBeUndefined()
  })

  it('hiddenAnnotationIds is undefined when all hides are canceled by shows', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'a' }, { action: 'hide', kind: 'range', id: 'b' }] }),
      scene({ annotationVisibility: [{ action: 'show', kind: 'point', id: 'a' }, { action: 'show', kind: 'range', id: 'b' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.hiddenAnnotationIds).toBeUndefined()
  })

  it('hide and show of different annotation kinds work independently', () => {
    const scenes = [
      scene({ annotationVisibility: [
        { action: 'hide', kind: 'point', id: 'a' },
        { action: 'hide', kind: 'range', id: 'b' },
      ] }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['a', 'b']))
  })

  it('same id hidden and shown in same scene uses last directive', () => {
    const scenes = [
      scene({ annotationVisibility: [
        { action: 'hide', kind: 'point', id: 'a' },
        { action: 'show', kind: 'point', id: 'a' },
      ] }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.hiddenAnnotationIds).toBeUndefined()
  })

  it('annotations without id are never filtered by hiddenAnnotationIds', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
    ]
    const result = resolveScene(scenes, 0)!
    // hiddenAnnotationIds contains 'abc', but annotations without id should pass
    // the filter at render time: !a.id || !hiddenIds.has(a.id)
    expect(result.hiddenAnnotationIds).toEqual(new Set(['abc']))
    // An annotation without an id would survive the filter because !a.id is true
    const annotation = { kind: 'point' as const }
    const passes = !annotation.id || !result.hiddenAnnotationIds!.has(annotation.id!)
    expect(passes).toBe(true)
  })

  it('annotation visibility directives only affect matching ids', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['abc']))
    expect(result.hiddenAnnotationIds!.has('xyz')).toBe(false)
  })

  it('empty annotationVisibility array does not set hiddenAnnotationIds', () => {
    const scenes = [
      scene({ annotationVisibility: [] }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.hiddenAnnotationIds).toBeUndefined()
  })

  it('hide in scene 0, no directive in scene 1, annotation still hidden at scene 1', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['abc']))
  })

  it('hide in scene 0, show in scene 1, hide again in scene 2', () => {
    const scenes = [
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
      scene({ annotationVisibility: [{ action: 'show', kind: 'point', id: 'abc' }] }),
      scene({ annotationVisibility: [{ action: 'hide', kind: 'point', id: 'abc' }] }),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.hiddenAnnotationIds).toEqual(new Set(['abc']))
  })

  it('scene annotations override base annotations', () => {
    const baseAnnotations: AnnotationConfig[] = [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }]
    const sceneAnnotations: AnnotationConfig[] = [{ id: 'a2', kind: 'range', start: 0, end: 10 }]
    const scenes = [
      scene({ annotations: baseAnnotations }),
      scene({ annotations: sceneAnnotations }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.annotations).toEqual(sceneAnnotations)
  })

  it('resolved scene without annotations field returns undefined annotations', () => {
    const scenes = [
      scene({ chartType: 'line' }),
    ]
    const result = resolveScene(scenes, 0)!
    expect(result.annotations).toBeUndefined()
  })

  it('deep-merges properties across scenes', () => {
    const scenes = [
      scene({ properties: { width: 100, color: 'red' } }),
      scene({ properties: { color: 'blue' } }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.properties).toEqual({ width: 100, color: 'blue' })
  })

  it('transforms from later scene replace earlier scene', () => {
    const earlyTransforms: TransformStep[] = [{ type: 'filter', column: 'A', value: '1' }]
    const lateTransforms: TransformStep[] = [{ type: 'sort', column: 'B', value: 'asc' }]
    const scenes = [
      scene({ transforms: earlyTransforms }),
      scene({ transforms: lateTransforms }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.transforms).toEqual(lateTransforms)
  })

  it('empty annotations array in later scene does not override cascaded annotations', () => {
    const scenes = [
      scene({ annotations: [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }] }),
      scene({ annotations: [] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.annotations).toEqual([{ id: 'a1', kind: 'point', target: 'A', text: 'p' }])
  })

  it('non-empty annotations in later scene do override earlier scene', () => {
    const scenes = [
      scene({ annotations: [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }] }),
      scene({ annotations: [{ id: 'a2', kind: 'point', target: 'B', text: 'q' }] }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.annotations).toEqual([{ id: 'a2', kind: 'point', target: 'B', text: 'q' }])
  })

  it('empty annotations in middle scene does not block cascading to later scene', () => {
    const scenes = [
      scene({ annotations: [{ id: 'a1', kind: 'point', target: 'A', text: 'p' }] }),
      scene({ annotations: [] }),
      scene({}),
    ]
    const result = resolveScene(scenes, 2)!
    expect(result.annotations).toEqual([{ id: 'a1', kind: 'point', target: 'A', text: 'p' }])
  })

  it('seriesOverrides from later scene replace earlier scene', () => {
    const earlyOverrides: SeriesOverride[] = [{ name: 'A', color: 'red' }]
    const lateOverrides: SeriesOverride[] = [{ name: 'B', color: 'blue' }]
    const scenes = [
      scene({ seriesOverrides: earlyOverrides }),
      scene({ seriesOverrides: lateOverrides }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.seriesOverrides).toEqual(lateOverrides)
  })
})

describe('annotation filtering', () => {
  function filterAnnotations(
    annotations: { id?: string, kind: string }[],
    hiddenIds?: Set<string>,
  ): { id?: string, kind: string }[] {
    if (!hiddenIds) {
      return annotations
    }
    return annotations.filter(a => !a.id || !hiddenIds.has(a.id))
  }

  it('returns all annotations when hiddenIds is undefined', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    expect(filterAnnotations(annotations, undefined)).toEqual(annotations)
  })

  it('filters out annotation with matching id', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    const result = filterAnnotations(annotations, new Set(['a']))
    expect(result).toEqual([{ id: 'b', kind: 'range' }])
  })

  it('keeps annotation with no id even when hiddenIds is populated', () => {
    const annotations = [
      { kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    const result = filterAnnotations(annotations, new Set(['b']))
    expect(result).toEqual([{ kind: 'point' }])
  })

  it('keeps annotation with id not in hiddenIds', () => {
    const annotations = [
      { id: 'x', kind: 'point' },
    ]
    const result = filterAnnotations(annotations, new Set(['y']))
    expect(result).toEqual([{ id: 'x', kind: 'point' }])
  })

  it('filters multiple annotations with different ids', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
      { id: 'c', kind: 'free' },
    ]
    const result = filterAnnotations(annotations, new Set(['a', 'c']))
    expect(result).toEqual([{ id: 'b', kind: 'range' }])
  })

  it('empty hiddenIds set filters nothing', () => {
    const annotations = [
      { id: 'a', kind: 'point' },
      { id: 'b', kind: 'range' },
    ]
    const result = filterAnnotations(annotations, new Set())
    expect(result).toEqual(annotations)
  })
})

describe('base + scene annotation merging', () => {
  // Reproduces the real scenario: base annotation on "Japan", scene 0 adds
  // annotation on "India", scene 1 only has a highlight.
  // All scenes must show base annotations alongside scene annotations.

  function mergeAnnotations(
    baseAnnotations: AnnotationConfig[],
    sceneAnnotations: AnnotationConfig[],
    hiddenIds?: Set<string>,
  ): AnnotationConfig[] {
    const raw = [...baseAnnotations, ...sceneAnnotations]
    if (!hiddenIds) {
      return raw
    }
    return raw.filter(a => !a.id || !hiddenIds.has(a.id))
  }

  const baseAnns: AnnotationConfig[] = [
    { kind: 'point', id: '537sb', target: 'Japan', text: 'Base annotation', showLine: true, showArrow: true },
  ]

  const scene0Anns: AnnotationConfig[] = [
    { kind: 'point', id: 'tha5f', target: 'India', text: 'Scene annotation', showLine: true, showArrow: true },
  ]

  it('base annotation is present when no scene is active', () => {
    const result = mergeAnnotations(baseAnns, [])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('537sb')
  })

  it('base + scene annotations are both present in scene with own annotations', () => {
    const result = mergeAnnotations(baseAnns, scene0Anns)
    expect(result).toHaveLength(2)
    expect(result.map(a => a.id)).toEqual(['537sb', 'tha5f'])
  })

  it('base + cascaded scene annotations are present in later scene without annotations', () => {
    // Scene 1 inherits scene 0 annotations via resolveScene cascading
    const scenes = [
      scene({ annotations: scene0Anns }),
      scene({ highlights: [{ target: 'China', color: '#9900ef' }] }),
    ]
    const resolved = resolveScene(scenes, 1)!
    const cascadedSceneAnns = resolved.annotations ?? []

    const result = mergeAnnotations(baseAnns, cascadedSceneAnns)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('537sb')
    expect(result[1].id).toBe('tha5f')
  })

  it('hide_annotation removes specific annotation from merged result', () => {
    const scenes = [
      scene({
        annotations: scene0Anns,
        annotationVisibility: [{ action: 'hide', kind: 'point', id: '537sb' }],
      }),
    ]
    const resolved = resolveScene(scenes, 0)!

    const result = mergeAnnotations(baseAnns, resolved.annotations ?? [], resolved.hiddenAnnotationIds)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tha5f')
  })

  it('scene annotations do not duplicate base annotations', () => {
    // If a scene has no annotations of its own, only base should appear
    const scenes = [
      scene({ highlights: [{ target: 'X', color: 'red' }] }),
    ]
    const resolved = resolveScene(scenes, 0)!
    const result = mergeAnnotations(baseAnns, resolved.annotations ?? [])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('537sb')
  })
})
