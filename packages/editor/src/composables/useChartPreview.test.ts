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
})
