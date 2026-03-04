import { describe, it, expect } from 'vitest'
import { createStepController } from './steps'
import type { StepDefinition, StepController } from './steps'
import { createSceneController } from './scenes'
import type { SceneDefinition, SceneController } from './scenes'

describe('steps backward compatibility', () => {
  it('re-exports createStepController as alias for createSceneController', () => {
    expect(createStepController).toBe(createSceneController)
  })

  it('StepDefinition type is assignable from SceneDefinition', () => {
    const scene: SceneDefinition = { name: 'test' }
    const step: StepDefinition = scene
    expect(step.name).toBe('test')
  })

  it('StepController type is compatible with SceneController', () => {
    const ctrl: SceneController = {} as StepController
    expect(ctrl).toBeDefined()
  })
})
