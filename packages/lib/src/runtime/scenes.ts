export interface SceneDefinition {
  name: string
  data?: Record<string, unknown>
}

/** @deprecated Use SceneDefinition instead */
export type StepDefinition = SceneDefinition

export interface SceneController {
  currentScene: number
  totalScenes: number
  next(): void
  previous(): void
  goTo(index: number): void
  destroy(): void
}

/** @deprecated Use StepController instead */
export type StepController = SceneController

export function createSceneController(
  container: HTMLElement,
  scenes: SceneDefinition[],
  onSceneChange: (scene: SceneDefinition, index: number) => void,
): SceneController {
  let currentScene = 0
  let destroyed = false

  const nav = document.createElement('nav')
  nav.className = 'blueprint-chart-scenes'

  const prevBtn = document.createElement('button')
  prevBtn.className = 'blueprint-chart-scenes-prev'
  prevBtn.textContent = 'Previous'

  const nextBtn = document.createElement('button')
  nextBtn.className = 'blueprint-chart-scenes-next'
  nextBtn.textContent = 'Next'

  const counter = document.createElement('span')
  counter.className = 'blueprint-chart-scenes-counter'

  nav.appendChild(prevBtn)
  nav.appendChild(counter)
  nav.appendChild(nextBtn)

  // Only attach nav when there are scenes to display; empty arrays render nothing.
  if (scenes.length > 0) {
    container.appendChild(nav)
  }

  function updateCounter(): void {
    if (scenes.length === 0) {
      counter.textContent = ''
      return
    }
    counter.textContent = `${currentScene + 1} / ${scenes.length}`
  }

  function goTo(index: number): void {
    if (destroyed) {
      return
    }
    if (scenes.length === 0) {
      return
    }
    if (!Number.isFinite(index)) {
      return
    }
    const normalized = Math.floor(index)
    const clamped = ((normalized % scenes.length) + scenes.length) % scenes.length
    currentScene = clamped
    updateCounter()
    onSceneChange(scenes[clamped], clamped)
  }

  prevBtn.addEventListener('click', () => goTo(currentScene - 1))
  nextBtn.addEventListener('click', () => goTo(currentScene + 1))

  updateCounter()

  return {
    get currentScene() {
      return currentScene
    },
    get totalScenes() {
      return scenes.length
    },
    next() {
      goTo(currentScene + 1)
    },
    previous() {
      goTo(currentScene - 1)
    },
    goTo,
    destroy() {
      if (destroyed) {
        return
      }
      destroyed = true
      nav.remove()
    },
  }
}

/** @deprecated Use createSceneController instead */
export const createStepController = createSceneController
