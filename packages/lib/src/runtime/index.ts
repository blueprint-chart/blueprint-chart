import { initBlueprint } from './runtime'

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlueprint)
}
else {
  initBlueprint()
}

export { initBlueprint }
export { renderBpc } from '../render/render-bpc'
export { createSceneController, createStepController } from './scenes'
export type { SceneDefinition, SceneController, StepDefinition, StepController } from './scenes'
export { mountScenePlayer } from './player'
export type { PlayerConfig, PlayerPosition, PlayerType } from './player'
