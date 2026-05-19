import { describe, it, expect } from 'vitest'
import { resolveScene } from './resolve-scene'
import type { ChartDefinition } from './types'
import { DslNodeType, AnnotationKind, AnnotationAction, ChartType } from '../enums'

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
})
