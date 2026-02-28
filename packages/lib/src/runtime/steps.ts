export interface StepDefinition {
  name: string
  data?: Record<string, unknown>
}

export interface StepController {
  currentStep: number
  totalSteps: number
  next(): void
  previous(): void
  goTo(index: number): void
  destroy(): void
}

function createStepNav(container: HTMLElement): { nav: HTMLElement, prevBtn: HTMLButtonElement, nextBtn: HTMLButtonElement, counter: HTMLSpanElement } {
  const nav = document.createElement('nav')
  nav.className = 'blueprint-chart-steps'

  const prevBtn = document.createElement('button')
  prevBtn.className = 'blueprint-chart-steps-prev'
  prevBtn.textContent = 'Previous'

  const nextBtn = document.createElement('button')
  nextBtn.className = 'blueprint-chart-steps-next'
  nextBtn.textContent = 'Next'

  const counter = document.createElement('span')
  counter.className = 'blueprint-chart-steps-counter'

  nav.appendChild(prevBtn)
  nav.appendChild(counter)
  nav.appendChild(nextBtn)
  container.appendChild(nav)

  return { nav, prevBtn, nextBtn, counter }
}

function buildStepControllerResult(nav: HTMLElement, goTo: (index: number) => void, getCurrentStep: () => number, totalSteps: number): StepController {
  return {
    get currentStep() { return getCurrentStep() },
    get totalSteps() { return totalSteps },
    next() { goTo(getCurrentStep() + 1) },
    previous() { goTo(getCurrentStep() - 1) },
    goTo,
    destroy() { nav.remove() },
  }
}

export function createStepController(
  container: HTMLElement,
  steps: StepDefinition[],
  onStepChange: (step: StepDefinition, index: number) => void,
): StepController {
  let currentStep = 0
  const { nav, prevBtn, nextBtn, counter } = createStepNav(container)

  function updateCounter(): void {
    counter.textContent = `${currentStep + 1} / ${steps.length}`
  }

  function goTo(index: number): void {
    const clamped = ((index % steps.length) + steps.length) % steps.length
    currentStep = clamped
    updateCounter()
    onStepChange(steps[clamped], clamped)
  }

  prevBtn.addEventListener('click', () => goTo(currentStep - 1))
  nextBtn.addEventListener('click', () => goTo(currentStep + 1))
  updateCounter()
  return buildStepControllerResult(nav, goTo, () => currentStep, steps.length)
}
