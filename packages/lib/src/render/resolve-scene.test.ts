import { describe, it, expect, vi } from 'vitest'
import { resolveScene, __resetTransformWarnings } from './resolve-scene'
import type { ChartDefinition } from './types'
import { DslNodeType, AnnotationKind, AnnotationAction, ChartType, SortMode } from '../enums'

function baseDef(overrides: Partial<ChartDefinition> = {}): ChartDefinition {
  return {
    chartType: ChartType.BarVertical,
    data: { labels: ['a', 'b'], values: [1, 2] },
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],
    seriesOverrides: [],
    scenes: [],
    ...overrides,
  }
}

describe('resolveScene', () => {
  it('returns base state unchanged when sceneIndex is undefined', () => {
    const def = baseDef({ highlights: [{ target: 'a' }] })
    const state = resolveScene(def, undefined)
    expect(state.chartType).toBe(ChartType.BarVertical)
    expect(state.highlights).toEqual([{ target: 'a' }])
  })

  it('returns base when sceneIndex is out of range', () => {
    const def = baseDef({ scenes: [] })
    const state = resolveScene(def, 0)
    expect(state.chartType).toBe(ChartType.BarVertical)
  })

  it('applies chartType override from the scene', () => {
    const def = baseDef({
      scenes: [{
        type: DslNodeType.Scene,
        name: null,
        properties: [{ type: DslNodeType.Property, key: 'type', value: ChartType.Line, isPercentage: false }],
        data: null,
        colorizes: [], highlights: [], areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
      }],
    })
    const state = resolveScene(def, 0)
    expect(state.chartType).toBe(ChartType.Line)
  })

  it('makes highlights scene-only (not cascading from prior scenes)', () => {
    const def = baseDef({
      highlights: [{ target: 'base' }],
      scenes: [
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [{ type: DslNodeType.Highlight, target: 's0' }],
          areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
        },
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [],
          areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
        },
      ],
    })
    expect(resolveScene(def, 0).highlights).toEqual([{ target: 's0' }])
    // Scene 1 has no highlights of its own → no highlights (NOT inherited from scene 0)
    expect(resolveScene(def, 1).highlights).toEqual([])
  })

  it('cascades annotationVisibility hide/show across scenes', () => {
    const vis = (action: AnnotationAction, id: string) => ({
      type: DslNodeType.AnnotationVisibility as const,
      action, kind: AnnotationKind.Point, id,
    })
    const def = baseDef({
      annotations: [{ kind: AnnotationKind.Point, id: 'x', target: 'a', text: 't' }],
      scenes: [
        { type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [], areaFills: [], annotations: [],
          annotationVisibility: [vis(AnnotationAction.Hide, 'x')], series: [], transforms: [] },
        { type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [], areaFills: [], annotations: [],
          annotationVisibility: [vis(AnnotationAction.Show, 'x')], series: [], transforms: [] },
      ],
    })
    expect(resolveScene(def, 0).annotations).toEqual([])
    expect(resolveScene(def, 1).annotations.map((a: { id?: string }) => a.id)).toEqual(['x'])
  })

  it('clears inherited colorizes when scene supplies new data', () => {
    const def = baseDef({
      colorizes: [{ target: 'a', color: '#f00' }],
      scenes: [{
        type: DslNodeType.Scene, name: null, properties: [],
        data: { type: DslNodeType.Data, entries: [
          { type: DslNodeType.Property, key: 'x', value: '1', isPercentage: false },
        ] },
        colorizes: [], highlights: [], areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
      }],
    })
    expect(resolveScene(def, 0).colorizes).toEqual([])
  })

  // S1: scenes that declare data override the resolved data
  it('reparses scene data so labels/values reflect the scene override', () => {
    const def = baseDef({
      data: { labels: ['A', 'B'], values: [1, 2] },
      scenes: [{
        type: DslNodeType.Scene, name: null, properties: [],
        data: { type: DslNodeType.Data, entries: [
          { type: DslNodeType.Property, key: 'A', value: 99, isPercentage: false },
        ] },
        colorizes: [], highlights: [], areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
      }],
    })
    const state = resolveScene(def, 0)
    expect(state.data.labels).toEqual(['A'])
    expect(state.data.values).toEqual([99])
  })

  // S3: scene annotations accumulate across scenes (do not replace each other)
  it('accumulates scene annotations across scene 0 → scene 1', () => {
    const def = baseDef({
      scenes: [
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [], areaFills: [],
          annotations: [{
            type: DslNodeType.Annotation, kind: AnnotationKind.Point, target: 'a',
            properties: [
              { type: DslNodeType.Property, key: 'id', value: 'a0', isPercentage: false },
              { type: DslNodeType.Property, key: 'text', value: 'first', isPercentage: false },
            ],
          }],
          annotationVisibility: [], series: [], transforms: [],
        },
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [], areaFills: [],
          annotations: [],
          annotationVisibility: [], series: [], transforms: [],
        },
      ],
    })
    const s1 = resolveScene(def, 1)
    expect(s1.annotations.map(a => a.id)).toEqual(['a0'])
  })

  // S3: when two scenes declare annotations with the same id, the later one wins
  it('dedupes scene annotations by id, keeping the later declaration', () => {
    const def = baseDef({
      scenes: [
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [], areaFills: [],
          annotations: [{
            type: DslNodeType.Annotation, kind: AnnotationKind.Point, target: 'a',
            properties: [
              { type: DslNodeType.Property, key: 'id', value: 'shared', isPercentage: false },
              { type: DslNodeType.Property, key: 'text', value: 'first', isPercentage: false },
            ],
          }],
          annotationVisibility: [], series: [], transforms: [],
        },
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [], areaFills: [],
          annotations: [{
            type: DslNodeType.Annotation, kind: AnnotationKind.Point, target: 'b',
            properties: [
              { type: DslNodeType.Property, key: 'id', value: 'shared', isPercentage: false },
              { type: DslNodeType.Property, key: 'text', value: 'second', isPercentage: false },
            ],
          }],
          annotationVisibility: [], series: [], transforms: [],
        },
      ],
    })
    const s1 = resolveScene(def, 1)
    expect(s1.annotations.length).toBe(1)
    const a = s1.annotations[0] as { id?: string, text?: string, target?: string }
    expect(a.id).toBe('shared')
    expect(a.text).toBe('second')
    expect(a.target).toBe('b')
  })

  // S2/S9: a `transform sort` directive populates sortMode
  it('applies transform sort to sortMode = total', () => {
    const def = baseDef({
      scenes: [{
        type: DslNodeType.Scene, name: null, properties: [], data: null,
        colorizes: [], highlights: [], areaFills: [], annotations: [],
        annotationVisibility: [], series: [],
        transforms: [{
          type: DslNodeType.Transform, transformType: 'sort',
          properties: [
            { type: DslNodeType.Property, key: 'column', value: 'value', isPercentage: false },
            { type: DslNodeType.Property, key: 'direction', value: 'descending', isPercentage: false },
          ],
        }],
      }],
    })
    expect(resolveScene(def, 0).sortMode).toBe(SortMode.Total)
  })

  // Frame-property merge tests
  it('merges scene title into returned frame', () => {
    const def = baseDef({
      frame: { title: 'Base', description: 'BaseDesc' },
      scenes: [{
        type: DslNodeType.Scene, name: null, data: null,
        properties: [{ type: DslNodeType.Property, key: 'title', value: 'SceneTitle', isPercentage: false }],
        colorizes: [], highlights: [], areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
      }],
    })
    const state = resolveScene(def, 0)
    expect(state.frame?.title).toBe('SceneTitle')
    expect(state.frame?.description).toBe('BaseDesc')
  })

  it('preserves base frame fields not overridden by scene', () => {
    const def = baseDef({
      frame: { title: 'Base', description: 'BaseDesc' },
      scenes: [{
        type: DslNodeType.Scene, name: null, data: null,
        properties: [{ type: DslNodeType.Property, key: 'description', value: 'SceneDesc', isPercentage: false }],
        colorizes: [], highlights: [], areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
      }],
    })
    const state = resolveScene(def, 0)
    expect(state.frame?.title).toBe('Base')
    expect(state.frame?.description).toBe('SceneDesc')
  })

  it('does not leak non-frame scene properties into frame', () => {
    const def = baseDef({
      frame: { title: 'Base' },
      scenes: [{
        type: DslNodeType.Scene, name: null, data: null,
        properties: [{ type: DslNodeType.Property, key: 'padding', value: '32px', isPercentage: false }],
        colorizes: [], highlights: [], areaFills: [], annotations: [], annotationVisibility: [], series: [], transforms: [],
      }],
    })
    const state = resolveScene(def, 0)
    // `padding` is not in the FRAME_PROPERTY_KEYS whitelist; must not appear in frame.
    expect((state.frame as Record<string, unknown> | undefined)?.padding).toBeUndefined()
    expect(state.frame?.title).toBe('Base')
  })

  it('returns base.frame unchanged when no sceneIndex is provided', () => {
    const baseFrame = { title: 'Base' }
    const def = baseDef({ frame: baseFrame, scenes: [] })
    const state = resolveScene(def, undefined)
    expect(state.frame).toBe(baseFrame) // identity: early-return path passes base.frame through
  })

  it('warns once per unknown transform type', () => {
    __resetTransformWarnings()
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const defWithUnknown = baseDef({
      scenes: [{
        type: DslNodeType.Scene, name: null, properties: [], data: null,
        colorizes: [], highlights: [], areaFills: [], annotations: [],
        annotationVisibility: [], series: [],
        transforms: [{ type: DslNodeType.Transform, transformType: 'mystery', properties: [] }],
      }],
    })
    resolveScene(defWithUnknown, 0)
    resolveScene(defWithUnknown, 0)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('mystery')
    spy.mockRestore()
  })
})
