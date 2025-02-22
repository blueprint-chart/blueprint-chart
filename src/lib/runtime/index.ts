import { initBlueprint } from './runtime'

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlueprint)
}
else {
  initBlueprint()
}

export { initBlueprint }
export { createStepController } from './steps'
export type { StepDefinition, StepController } from './steps'
