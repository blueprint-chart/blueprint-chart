import { describe, it, expect, vi } from 'vitest'
import { resolveScene, __resetTransformWarnings } from './resolve-scene'
import type { ChartDefinition } from './types'
import { DslNodeType, AnnotationKind, ChartType, SortMode } from '../enums'
import { convertAnnotations } from '../dsl/converter'

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
    const def = baseDef({
      highlights: [{ target: 'a' }],
      annotations: [{ kind: AnnotationKind.Point, target: 'a', text: 't' }],
    })
    const state = resolveScene(def, undefined)
    expect(state.chartType).toBe(ChartType.BarVertical)
    expect(state.highlights).toEqual([{ target: 'a' }])
    // No-scene render still assigns anchor-0 keys to top-level annotations.
    expect(state.annotations).toHaveLength(1)
    expect(state.annotations[0].key).toBe('base:0:point')
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
        colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], transforms: [],
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
          areaFills: [], annotations: [], series: [], transforms: [],
        },
        {
          type: DslNodeType.Scene, name: null, properties: [], data: null,
          colorizes: [], highlights: [],
          areaFills: [], annotations: [], series: [], transforms: [],
        },
      ],
    })
    expect(resolveScene(def, 0).highlights).toEqual([{ target: 's0' }])
    // Scene 1 has no highlights of its own → no highlights (NOT inherited from scene 0)
    expect(resolveScene(def, 1).highlights).toEqual([])
  })

  // Windowing helpers used by the repeat tests below
  function ann(target: string, text: string, repeat?: string | number) {
    return {
      kind: AnnotationKind.Point,
      target,
      properties: [
        { type: DslNodeType.Property, key: 'text', value: text, isPercentage: false },
        ...(repeat === undefined
          ? []
          : [{ type: DslNodeType.Property, key: 'repeat', value: repeat, isPercentage: false }]),
      ],
    }
  }

  function makeScene(annotations: ReturnType<typeof ann>[] = []) {
    return {
      type: DslNodeType.Scene as const,
      name: null,
      properties: [],
      data: null,
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations,

      series: [],
      transforms: [],
    }
  }

  function makeDef(partial: Partial<ChartDefinition> = {}): ChartDefinition {
    return baseDef(partial)
  }

  it('shows a repeat=false scene annotation only in its own scene', () => {
    const def = makeDef({
      scenes: [
        makeScene([ann('a', 'first')]), // repeat omitted → once
        makeScene([]),
      ],
    })
    expect(resolveScene(def, 0).annotations.map(a => a.text)).toEqual(['first'])
    expect(resolveScene(def, 1).annotations.map(a => a.text)).toEqual([])
  })

  it('shows a repeat=true scene annotation from its scene onward', () => {
    const def = makeDef({
      scenes: [
        makeScene([ann('a', 'persist', 'true')]),
        makeScene([]),
        makeScene([]),
      ],
    })
    expect(resolveScene(def, 0).annotations.map(a => a.text)).toEqual(['persist'])
    expect(resolveScene(def, 2).annotations.map(a => a.text)).toEqual(['persist'])
  })

  it('shows a repeat=N annotation for exactly N scenes from its anchor', () => {
    const def = makeDef({
      scenes: [
        makeScene([]),
        makeScene([ann('a', 'span', 2)]), // scenes 1 and 2
        makeScene([]),
        makeScene([]),
      ],
    })
    expect(resolveScene(def, 0).annotations.map(a => a.text)).toEqual([])
    expect(resolveScene(def, 1).annotations.map(a => a.text)).toEqual(['span'])
    expect(resolveScene(def, 2).annotations.map(a => a.text)).toEqual(['span'])
    expect(resolveScene(def, 3).annotations.map(a => a.text)).toEqual([])
  })

  it('anchors top-level annotations at scene 0', () => {
    const def = makeDef({
      annotations: convertAnnotations([ann('top', 'banner', 'true')]),
      scenes: [makeScene([]), makeScene([])],
    })
    expect(resolveScene(def, 1).annotations.map(a => a.text)).toEqual(['banner'])
  })

  it('top-level repeat=false annotation shows only in scene 0', () => {
    const def = makeDef({
      annotations: convertAnnotations([ann('top', 'once')]),
      scenes: [makeScene([]), makeScene([])],
    })
    expect(resolveScene(def, 0).annotations.map(a => a.text)).toEqual(['once'])
    expect(resolveScene(def, 1).annotations.map(a => a.text)).toEqual([])
  })

  it('assigns a stable key to a persisting annotation across scenes', () => {
    const def = makeDef({
      scenes: [makeScene([ann('a', 'persist', 'true')]), makeScene([])],
    })
    const k0 = resolveScene(def, 0).annotations[0].key
    const k1 = resolveScene(def, 1).annotations[0].key
    expect(k0).toBeDefined()
    expect(k0).toBe(k1)
  })

  it('clears inherited colorizes when scene supplies new data', () => {
    const def = baseDef({
      colorizes: [{ target: 'a', color: '#f00' }],
      scenes: [{
        type: DslNodeType.Scene, name: null, properties: [],
        data: { type: DslNodeType.Data, entries: [
          { type: DslNodeType.Property, key: 'x', value: '1', isPercentage: false },
        ] },
        colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], transforms: [],
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
        colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], transforms: [],
      }],
    })
    const state = resolveScene(def, 0)
    expect(state.data.labels).toEqual(['A'])
    expect(state.data.values).toEqual([99])
  })

  // S2/S9: a `transform sort` directive populates sortMode
  it('applies transform sort to sortMode = total', () => {
    const def = baseDef({
      scenes: [{
        type: DslNodeType.Scene, name: null, properties: [], data: null,
        colorizes: [], highlights: [], areaFills: [], annotations: [],
        series: [],
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
        colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], transforms: [],
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
        colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], transforms: [],
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
        colorizes: [], highlights: [], areaFills: [], annotations: [], series: [], transforms: [],
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
        series: [],
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
