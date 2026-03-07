import { describe, it, expect } from 'vitest'
import { resolveScene } from './useChartPreview'
import type { SceneOverride } from './useScenes'

function scene(overrides: Partial<SceneOverride> = {}): SceneOverride {
  return { id: Math.random().toString(36).slice(2), name: null, ...overrides }
}

describe('resolveScene', () => {
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
    const baseAnnotations = [{ id: 'a1', kind: 'point' as const, x: 1, y: 2 }]
    const sceneAnnotations = [{ id: 'a2', kind: 'range' as const, x: 3, y: 4 }]
    const scenes = [
      scene({ annotations: baseAnnotations as any }),
      scene({ annotations: sceneAnnotations as any }),
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
    const earlyTransforms = [{ type: 'filter', column: 'A', value: '1' }] as any
    const lateTransforms = [{ type: 'sort', column: 'B', value: 'asc' }] as any
    const scenes = [
      scene({ transforms: earlyTransforms }),
      scene({ transforms: lateTransforms }),
    ]
    const result = resolveScene(scenes, 1)!
    expect(result.transforms).toEqual(lateTransforms)
  })

  it('seriesOverrides from later scene replace earlier scene', () => {
    const earlyOverrides = [{ series: 'A', color: 'red' }] as any
    const lateOverrides = [{ series: 'B', color: 'blue' }] as any
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
    annotations: { id?: string; kind: string }[],
    hiddenIds?: Set<string>
  ): { id?: string; kind: string }[] {
    if (!hiddenIds) return annotations
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
