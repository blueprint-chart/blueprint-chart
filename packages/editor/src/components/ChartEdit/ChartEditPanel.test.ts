import { shallowMount } from '@vue/test-utils'
import ChartEditPanel from './ChartEditPanel.vue'

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    viewMode: ref('preview'),
    activeTab: ref(''),
    canvasMode: ref('blueprint'),
    showDimensions: ref(false),
    selectTab: vi.fn(),
    setLastNarrowEditTab: vi.fn(),
  }),
}))

vi.mock('@/stores/panel', () => ({
  usePanel: () => ({ mode: ref('docked') }),
  usePanelStore: () => ({ mode: ref('docked'), dockedWidth: ref(0.22), dock: vi.fn(), close: vi.fn() }),
  MIN_CANVAS_WIDTH: 220,
  PANEL_MIN_WIDTH: 260,
  PANEL_MAX_WIDTH: 660,
  CRAMPED_THRESHOLD: 480,
  DEFAULT_DOCKED_WIDTH_FRACTION: 0.22,
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ layout: ref({}) }),
}))

vi.mock('@/composables/useCanvasCardStyle', () => ({
  useCanvasCardStyle: () => ({ cardClass: ref(''), cardStyle: ref({}) }),
}))

vi.mock('@/composables/useChartEditSections', () => ({
  useChartEditSections: () => ({ sections: ref([]) }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  useBreakpoint: () => ({ isNarrow: ref(false) }),
}))

vi.mock('@vueuse/core', () => ({
  useResizeObserver: vi.fn(),
}))

function mountPanel() {
  return shallowMount(ChartEditPanel, {
    global: { plugins: [createPinia()] },
  })
}

describe('ChartEditPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders a timeline slot at the bottom of the canvas', () => {
    const w = mountPanel()
    const canvas = w.find('.chart-edit-panel__canvas')
    const slot = canvas.find('[data-timeline-slot]')
    expect(slot.exists()).toBe(true)
    expect(canvas.element.lastElementChild).toBe(slot.element)
  })
})
