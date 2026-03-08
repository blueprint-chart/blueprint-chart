import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface WizardStep {
  label: string
  key: string
}

const steps: WizardStep[] = [
  { label: 'Data', key: 'data' },
  { label: 'Visualize', key: 'edit' },
  { label: 'Export', key: 'export' },
]

function stepKeyFromRoute(path: string): string {
  if (path.endsWith('/export')) {
    return 'export'
  }
  if (path.endsWith('/data')) {
    return 'data'
  }
  if (path.startsWith('/edit/')) {
    return 'edit'
  }
  // /new defaults to data
  return 'data'
}

export function stepPath(id: string, stepKey: string): string {
  if (stepKey === 'edit') {
    return `/edit/${id}`
  }
  return `/edit/${id}/${stepKey}`
}

// Hook called before advancing from the data step when no session exists yet.
// WizardShell registers this to serialize data and create a session.
const onCreateSession = ref<(() => string | null) | null>(null)

export function useWizard() {
  const route = useRoute()
  const router = useRouter()

  const currentStep = computed(() => {
    const key = stepKeyFromRoute(route?.path ?? '/new')
    return steps.find(s => s.key === key) ?? steps[0]
  })

  const currentIndex = computed({
    get: () => steps.indexOf(currentStep.value),
    set: (index: number) => {
      goTo(index)
    },
  })

  const isFirst = computed(() => currentIndex.value === 0)
  const isLast = computed(() => currentIndex.value === steps.length - 1)

  function resolveId(): string | null {
    const id = route?.params?.id as string | undefined
    if (id) {
      return id
    }
    // No session yet — try creating one via the registered hook
    if (onCreateSession.value) {
      return onCreateSession.value()
    }
    return null
  }

  function navigateTo(stepKey: string) {
    const id = resolveId()
    if (id && router) {
      router.replace(stepPath(id, stepKey))
    }
  }

  function next() {
    const idx = currentIndex.value
    if (idx < steps.length - 1) {
      navigateTo(steps[idx + 1].key)
    }
  }

  function back() {
    const idx = currentIndex.value
    if (idx > 0) {
      navigateTo(steps[idx - 1].key)
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < steps.length) {
      navigateTo(steps[index].key)
    }
  }

  function reset() {
    // No-op — state is driven by the route
  }

  function registerCreateSession(fn: () => string | null) {
    onCreateSession.value = fn
  }

  return {
    currentIndex,
    steps,
    currentStep,
    isFirst,
    isLast,
    next,
    back,
    goTo,
    reset,
    registerCreateSession,
  }
}
