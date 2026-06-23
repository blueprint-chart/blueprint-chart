import { describe, it, expect } from 'vitest'
import { DslNodeType } from '@blueprint-chart/lib'
import { sceneOverrideToSceneNode } from './scene-to-node'

describe('sceneOverrideToSceneNode', () => {
  it('returns a minimal SceneNode for an empty override', () => {
    const node = sceneOverrideToSceneNode({ id: 's1', name: null })
    expect(node.type).toBe(DslNodeType.Scene)
    expect(node.properties).toEqual([])
    expect(node.colorizes).toEqual([])
  })

  it('encodes chartType override as a `type` property', () => {
    const node = sceneOverrideToSceneNode({ id: 's1', name: null, chartType: 'line' })
    const typeProp = node.properties.find(p => p.key === 'type')
    expect(typeProp?.value).toBe('line')
  })

  it('does not emit annotationVisibility on the scene node', () => {
    const node = sceneOverrideToSceneNode({ id: 's', name: 'S', annotations: [] })
    expect('annotationVisibility' in node).toBe(false)
  })
})
