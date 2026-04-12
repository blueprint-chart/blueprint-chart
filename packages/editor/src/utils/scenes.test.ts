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
