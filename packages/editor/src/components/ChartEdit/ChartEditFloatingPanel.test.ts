import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ChartEditFloatingPanel from './ChartEditFloatingPanel.vue'
import { useEditorPanel } from '@/composables/useEditorPanel'

vi.mock('@blueprint-chart/ui', () => ({
  ButtonIcon: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    props: ['iconLeft', 'label', 'hideLabel', 'square', 'variant', 'size'],
    emits: ['click'],
  },
  ButtonDrag: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  ButtonDock: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  ButtonClose: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  ButtonUndo: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled'],
    emits: ['click'],
  },
  ButtonRedo: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled'],
    emits: ['click'],
  },
  NavigationToggle: {
    template: '<div class="navigation-toggle" />',
    props: ['modelValue', 'options'],
  },
}))

vi.mock('@/composables/usePanelDrag', () => ({
  usePanelDrag: vi.fn(() => ({ isDragging: false })),
}))

vi.mock('@/composables/useChartHistory', () => ({
  useChartHistory: () => ({
    canUndo: { value: false },
    canRedo: { value: false },
    undo: vi.fn(),
    redo: vi.fn(),
  }),
}))

vi.mock('@/composables/useChartConfig', () => ({
  useChartConfig: () => ({
    chartType: { value: 'line' },
  }),
}))

vi.mock('@/composables/useChartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    availableOptionKeys: { value: ['showVerticalAxis'] },
  }),
}))

vi.mock('@/composables/useWizard', () => ({
  useWizard: () => ({
    steps: [
      { label: 'Data', key: 'data' },
      { label: 'Visualize', key: 'edit' },
      { label: 'Export', key: 'export' },
    ],
    currentIndex: { value: 1 },
    currentStep: { value: { label: 'Visualize', key: 'edit' } },
    isFirst: { value: false },
    isLast: { value: false },
    next: vi.fn(),
    back: vi.fn(),
    goTo: vi.fn(),
    reset: vi.fn(),
    registerCreateSession: vi.fn(),
  }),
}))

vi.mock('@/components/Editor/EditorChartTypePicker.vue', () => ({
  default: { template: '<div class="type-picker" />' },
}))
vi.mock('@/components/Editor/EditorPropertyForm.vue', () => ({
  default: { template: '<div class="prop-form" />' },
}))
vi.mock('@/components/Editor/EditorAppearanceTab.vue', () => ({
  default: { template: '<div class="appearance" />' },
}))
vi.mock('@/components/Editor/EditorSeriesPanel.vue', () => ({
  default: { template: '<div class="series" />' },
}))
vi.mock('@/components/Editor/EditorAxisOptions.vue', () => ({
  default: { template: '<div class="axes" />' },
}))
vi.mock('@/components/Editor/EditorAnnotateTab.vue', () => ({
  default: { template: '<div class="annotate" />' },
}))

describe('ChartEditFloatingPanel', () => {
  beforeEach(() => {
    useEditorPanel().reset()
  })

  it('renders tab bar', () => {
    const w = mount(ChartEditFloatingPanel, {
      props: { containerRef: null },
    })
    const tabs = w.findAll('.panel-tab-bar__tab')
    // type, text, appearance, layout, axes, annotate (6 with axes)
    expect(tabs.length).toBeGreaterThanOrEqual(4)
  })

  it('highlights active tab', () => {
    useEditorPanel().selectTab('text')
    const w = mount(ChartEditFloatingPanel, {
      props: { containerRef: null },
    })
    const activeTab = w.find('.panel-tab-bar__tab--active')
    expect(activeTab.text()).toBe('Text')
  })

  it('renders dock and close buttons', () => {
    const w = mount(ChartEditFloatingPanel, {
      props: { containerRef: null },
    })
    const buttons = w.findAll('.btn-icon')
    // drag, dock, close + stepper footer buttons
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('position style reflects composable state', () => {
    const { floatingPosition } = useEditorPanel()
    floatingPosition.value = { x: 100, y: 50 }
    const w = mount(ChartEditFloatingPanel, {
      props: { containerRef: null },
    })
    const style = w.find('.panel-floating').attributes('style')
    expect(style).toContain('left: 100px')
    expect(style).toContain('top: 50px')
  })
})
