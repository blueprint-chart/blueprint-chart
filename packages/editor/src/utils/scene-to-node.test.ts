import { describe, it, expect } from 'vitest'
import { AnnotationKind, AnnotationAction, DslNodeType } from '@blueprint-chart/lib'
import { sceneOverrideToSceneNode } from './scene-to-node'

describe('sceneOverrideToSceneNode', () => {
  it('returns a minimal SceneNode for an empty override', () => {
    const node = sceneOverrideToSceneNode({ id: 's1', name: null })
    expect(node.type).toBe(DslNodeType.Scene)
    expect(node.properties).toEqual([])
    expect(node.colorizes).toEqual([])
    expect(node.annotationVisibility).toEqual([])
  })

  it('encodes chartType override as a `type` property', () => {
    const node = sceneOverrideToSceneNode({ id: 's1', name: null, chartType: 'line' })
    const typeProp = node.properties.find(p => p.key === 'type')
    expect(typeProp?.value).toBe('line')
  })

  it('maps annotationVisibility entries', () => {
    const node = sceneOverrideToSceneNode({
      id: 's1',
      name: null,
      annotationVisibility: [{ action: 'hide', kind: AnnotationKind.Point, id: 'abc' }],
    })
    expect(node.annotationVisibility).toEqual([
      {
        type: DslNodeType.AnnotationVisibility,
        action: AnnotationAction.Hide,
        kind: AnnotationKind.Point,
        id: 'abc',
      },
    ])
  })
})
