import { describe, it, expect } from 'vitest'
import { SceneTransition, featureJoin, getSceneTransition, snapshotLiveAttrs } from './index'

describe('transitions public surface', () => {
  it('exports the orchestrator and primitive', () => {
    expect(typeof SceneTransition).toBe('function')
    expect(typeof featureJoin).toBe('function')
    expect(typeof getSceneTransition).toBe('function')
    expect(typeof snapshotLiveAttrs).toBe('function')
  })
})
