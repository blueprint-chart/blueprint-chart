import type { SceneOverride } from '@/stores/scenes'
import { findDataSourceSceneIndex } from './scenes'

function scene(overrides: Partial<SceneOverride> = {}): SceneOverride {
  return { id: Math.random().toString(36).slice(2), name: null, ...overrides }
}

describe('findDataSourceSceneIndex', () => {
  it('returns -1 when no scenes have data', () => {
    const scenes = [scene(), scene(), scene()]
    expect(findDataSourceSceneIndex(scenes, 2)).toBe(-1)
  })

  it('returns -1 for negative index', () => {
    const scenes = [scene({ data: '"A" = 1' })]
    expect(findDataSourceSceneIndex(scenes, -1)).toBe(-1)
  })

  it('returns current index when current scene has data', () => {
    const scenes = [scene(), scene({ data: '"A" = 1' })]
    expect(findDataSourceSceneIndex(scenes, 1)).toBe(1)
  })

  it('returns prior scene index when data is inherited', () => {
    const scenes = [scene({ data: '"A" = 1' }), scene(), scene()]
    expect(findDataSourceSceneIndex(scenes, 2)).toBe(0)
  })

  it('returns the closest prior scene with data', () => {
    const scenes = [
      scene({ data: '"A" = 1' }),
      scene({ data: '"B" = 2' }),
      scene(),
    ]
    expect(findDataSourceSceneIndex(scenes, 2)).toBe(1)
  })

  it('returns -1 when index is out of range', () => {
    const scenes = [scene({ data: '"A" = 1' })]
    expect(findDataSourceSceneIndex(scenes, 5)).toBe(-1)
  })

  it('returns -1 for empty scenes array', () => {
    expect(findDataSourceSceneIndex([], 0)).toBe(-1)
  })
})

import { describe, it, expect } from 'vitest'
import { AnnotationKind } from '@blueprint-chart/lib'
import { resolveVisibleAnnotations } from './scenes'
import type { SceneOverride as SceneOverrideForAnnotations } from '@/composables/useScenes'

function point(text: string, repeat?: number | 'always') {
  return { kind: AnnotationKind.Point, target: 'a', text, ...(repeat === undefined ? {} : { repeat }) } as const
}
function annotatedScene(annotations: SceneOverrideForAnnotations['annotations']): SceneOverrideForAnnotations {
  return { id: 's', name: null, annotations }
}

describe('resolveVisibleAnnotations', () => {
  it('shows all base annotations with base keys when no scene is active', () => {
    const r = resolveVisibleAnnotations([point('b0'), point('b1')], [], -1)
    expect(r.map(v => v.key)).toEqual(['base:0:point', 'base:1:point'])
  })

  it('windows a scene annotation: once shows only at its anchor', () => {
    const scenes = [annotatedScene([point('once')]), annotatedScene([])]
    expect(resolveVisibleAnnotations([], scenes, 0).map(v => v.config.text)).toEqual(['once'])
    expect(resolveVisibleAnnotations([], scenes, 1).map(v => v.config.text)).toEqual([])
  })

  it('windows true (always) and N correctly with scene keys', () => {
    // span has repeat=1 → its own scene (s1) plus the next 1 (s2).
    const scenes = [annotatedScene([point('always', 'always')]), annotatedScene([point('span', 1)]), annotatedScene([]), annotatedScene([])]
    expect(resolveVisibleAnnotations([], scenes, 0).map(v => v.key)).toEqual(['s0:0:point'])
    expect(resolveVisibleAnnotations([], scenes, 2).map(v => v.config.text)).toEqual(['always', 'span'])
    expect(resolveVisibleAnnotations([], scenes, 3).map(v => v.config.text)).toEqual(['always'])
  })

  it('windows base annotations forward from the base frame', () => {
    const scenes = [annotatedScene([]), annotatedScene([])]
    expect(resolveVisibleAnnotations([point('persist', 'always')], scenes, 1).map(v => v.key)).toEqual(['base:0:point'])
    expect(resolveVisibleAnnotations([point('once')], scenes, 1)).toEqual([])
  })

  it('shows a base "Never" annotation only on the first (base) frame, not in scenes', () => {
    // A top-level annotation belongs to the base chart — the first frame
    // (activeIndex -1). With no repeat it shows there and nowhere else; it must
    // not bleed into the declared scenes.
    const scenes = [annotatedScene([]), annotatedScene([])]
    expect(resolveVisibleAnnotations([point('once')], scenes, -1).map(v => v.key)).toEqual(['base:0:point'])
    expect(resolveVisibleAnnotations([point('once')], scenes, 0)).toEqual([])
    expect(resolveVisibleAnnotations([point('once')], scenes, 1)).toEqual([])
  })

  it('carries a base annotation into scenes by repeat (always everywhere, N = base + next N)', () => {
    const scenes = [annotatedScene([]), annotatedScene([])]
    // always: base + every scene
    expect(resolveVisibleAnnotations([point('a', 'always')], scenes, -1).map(v => v.key)).toEqual(['base:0:point'])
    expect(resolveVisibleAnnotations([point('a', 'always')], scenes, 1).map(v => v.key)).toEqual(['base:0:point'])
    // repeat=1: base frame + the next 1 scene (s0); not s1
    expect(resolveVisibleAnnotations([point('n', 1)], scenes, -1).map(v => v.key)).toEqual(['base:0:point'])
    expect(resolveVisibleAnnotations([point('n', 1)], scenes, 0).map(v => v.key)).toEqual(['base:0:point'])
    expect(resolveVisibleAnnotations([point('n', 1)], scenes, 1)).toEqual([])
  })
})
