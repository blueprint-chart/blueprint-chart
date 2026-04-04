import { mount } from '@vue/test-utils'
import ChartEditDockedPanel from './ChartEditDockedPanel.vue'
import { useEditorPanelStore as useEditorPanel } from '@/stores/editorPanel'

vi.mock('@blueprint-chart/ui', () => ({
  LayoutPanel: {
    template: '<div class="panel"><div class="title">{{ title }}</div><slot name="actions" /><slot /></div>',
    props: ['title'],
  },
  ButtonIcon: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    props: ['iconLeft', 'label', 'hideLabel', 'square', 'variant', 'size'],
    emits: ['click'],
  },
  ButtonDetach: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  ButtonClose: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
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
vi.mock('@/components/Editor/EditorLayoutTab.vue', () => ({
  default: { template: '<div class="layout" />' },
}))
vi.mock('./ChartEditToolbar.vue', () => ({
  default: { template: '<div class="toolbar" />' },
}))
vi.mock('@/components/Panel/PanelStepperFooter.vue', () => ({
  default: { template: '<div class="stepper-footer" />' },
}))

describe('ChartEditDockedPanel', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useEditorPanel().reset()
  })

  it('renders correct title for active tab', () => {
    useEditorPanel().selectTab('text')
    const w = mount(ChartEditDockedPanel, { props: { collapsed: false }, global: { plugins: [pinia] } })
    expect(w.find('.title').text()).toBe('Text')
  })

  it('renders type picker for type tab', () => {
    const w = mount(ChartEditDockedPanel, { props: { collapsed: false }, global: { plugins: [pinia] } })
    expect(w.find('.type-picker').exists()).toBe(true)
  })

  it('adds collapsed class when collapsed prop is true', () => {
    const w = mount(ChartEditDockedPanel, { props: { collapsed: true }, global: { plugins: [pinia] } })
    expect(w.find('.panel-docked--collapsed').exists()).toBe(true)
  })

  it('renders detach and close buttons', () => {
    const w = mount(ChartEditDockedPanel, { props: { collapsed: false }, global: { plugins: [pinia] } })
    const buttons = w.findAll('.btn-icon')
    expect(buttons.length).toBe(2)
  })
})
