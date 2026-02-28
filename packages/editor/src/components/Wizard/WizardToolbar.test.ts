import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import WizardToolbar from './WizardToolbar.vue'

const mockRouter = { replace: vi.fn() }
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('@/composables/useWizard', () => {
  const state = { currentIndex: 0, furthestIndex: 0 }
  const steps = [
    { label: 'Data', key: 'upload' },
    { label: 'Data', key: 'check' },
    { label: 'Visualize', key: 'edit' },
    { label: 'Export', key: 'export' },
  ]
  return {
    useWizard: () => ({
      currentIndex: ref(state.currentIndex),
      currentStep: computed(() => steps[state.currentIndex]),
      steps,
      isFirst: computed(() => state.currentIndex === 0),
      isLast: computed(() => state.currentIndex === steps.length - 1),
      next: vi.fn(() => { state.currentIndex++ }),
      back: vi.fn(),
      goTo: vi.fn((i: number) => { state.currentIndex = i }),
    }),
    __state: state,
  }
})

vi.mock('@/composables/useEditorPanel', () => ({
  useEditorPanel: () => ({
    viewMode: ref('preview'),
    setViewMode: vi.fn(),
  }),
}))

vi.mock('@/composables/useChartHistory', () => ({
  useChartHistory: () => ({
    canUndo: ref(false),
    canRedo: ref(false),
    undo: vi.fn(),
    redo: vi.fn(),
  }),
}))

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    rawInput: ref(''),
    rows: ref([]),
    columns: ref([]),
    columnTypes: ref([]),
    loadParsed: vi.fn(),
    serialize: vi.fn(() => ''),
  }),
}))

vi.mock('@/composables/useChartConfig', () => ({
  useChartConfig: () => ({
    chartType: ref('line'),
    data: ref(''),
  }),
}))

vi.mock('@/composables/useChartSession', () => ({
  useChartSession: () => ({
    sessionId: ref(null),
    createSession: vi.fn(() => 'test-id'),
  }),
}))

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    theme: ref('light'),
    cycleTheme: vi.fn(),
  }),
}))

vi.mock('@/composables/useDataParser', () => ({
  parseDelimited: vi.fn(() => ({ columns: [], rows: [] })),
}))

const uiStubs: Record<string, { template: string, props?: string[] }> = {
  NavigationStepper: { template: '<div class="stepper"><slot /></div>', props: ['currentStep', 'steps'] },
  ButtonIcon: { template: '<button class="btn-icon" :disabled="disabled"><slot /></button>', props: ['iconLeft', 'label', 'hideLabel', 'square', 'variant', 'size', 'disabled'] },
  FormControlButtonGroup: { template: '<div class="btn-group" />', props: ['modelValue', 'label', 'options'] },
}

function mountToolbar() {
  return mount(WizardToolbar, {
    global: {
      stubs: {
        ...uiStubs,
        BButton: { template: '<button class="b-btn" :disabled="disabled"><slot /></button>', props: ['variant', 'size', 'disabled'] },
      },
    },
  })
}

describe('WizardToolbar', () => {
  it('renders stepper', () => {
    const w = mountToolbar()
    expect(w.find('.stepper').exists()).toBe(true)
  })

  it('does not render theme toggle (moved to navbar)', () => {
    const w = mountToolbar()
    const icons = w.findAll('.btn-icon')
    const themeToggle = icons.filter(i => i.attributes('aria-label') === 'Toggle theme')
    expect(themeToggle.length).toBe(0)
  })
})
