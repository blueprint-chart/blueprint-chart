import { reactive, computed, toRefs } from 'vue'

export interface WizardStep {
  label: string
  key: string
}

const steps: WizardStep[] = [
  { label: 'Data', key: 'data' },
  { label: 'Visualize', key: 'edit' },
  { label: 'Export', key: 'export' },
]

const state = reactive({
  currentIndex: 0,
  furthestIndex: 0,
})

export function useWizard() {
  const currentStep = computed(() => steps[state.currentIndex])
  const isFirst = computed(() => state.currentIndex === 0)
  const isLast = computed(() => state.currentIndex === steps.length - 1)

  function next() {
    if (state.currentIndex < steps.length - 1) {
      state.currentIndex++
      if (state.currentIndex > state.furthestIndex) {
        state.furthestIndex = state.currentIndex
      }
    }
  }

  function back() {
    if (state.currentIndex > 0) {
      state.currentIndex--
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index <= state.furthestIndex) {
      state.currentIndex = index
    }
  }

  function reset() {
    state.currentIndex = 0
    state.furthestIndex = 0
  }

  function hydrate(snapshot: { currentIndex: number, furthestIndex: number }) {
    state.currentIndex = snapshot.currentIndex
    state.furthestIndex = snapshot.furthestIndex
  }

  return {
    ...toRefs(state),
    steps,
    currentStep,
    isFirst,
    isLast,
    next,
    back,
    goTo,
    reset,
    hydrate,
  }
}
