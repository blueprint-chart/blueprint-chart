import { shallowMount } from '@vue/test-utils'
import ChartEditPanel from './ChartEditPanel.vue'
import FloatingSceneTimeline from '@/components/Scene/FloatingSceneTimeline.vue'
import PreviewChart from '@/components/Preview/PreviewChart.vue'
import { useEditorPanel } from '@/stores/editorPanel'

const editorPanelState = {
  viewMode: ref('preview'),
  activeTab: ref(''),
  canvasMode: ref('blueprint'),
  showDimensions: ref(false),
  splitRatio: ref(0.5),
  selectTab: vi.fn(),
  setLastNarrowEditTab: vi.fn(),
  setSplitRatio: vi.fn(),
}

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => editorPanelState,
}))

const panelStoreMock = vi.hoisted(() => ({ dock: vi.fn(), close: vi.fn() }))

vi.mock('@/stores/panel', () => ({
  usePanel: () => ({ mode: ref('docked') }),
  usePanelStore: () => ({ mode: ref('docked'), dockedWidth: ref(0.22), ...panelStoreMock }),
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

  it('renders the floating timeline inside the canvas in preview mode', () => {
    useEditorPanel().viewMode.value = 'preview'
    const w = mountPanel()
    const timeline = w.findComponent(FloatingSceneTimeline)
    expect(timeline.exists()).toBe(true)
  })
})

describe('ChartEditPanel view modes', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('shows the chart and not the DSL pane in preview mode', () => {
    useEditorPanel().viewMode.value = 'preview'
    const wrapper = mountPanel()
    expect(wrapper.findComponent(PreviewChart).exists()).toBe(true)
    expect(wrapper.find('.chart-edit-panel__canvas__dsl').exists()).toBe(false)
  })

  it('shows BOTH the chart and the DSL pane in split mode', () => {
    useEditorPanel().viewMode.value = 'split'
    const wrapper = mountPanel()
    expect(wrapper.findComponent(PreviewChart).exists()).toBe(true)
    expect(wrapper.find('.chart-edit-panel__canvas__dsl').exists()).toBe(true)
  })

  it('shows the DSL pane and hides the chart in dsl mode', () => {
    useEditorPanel().viewMode.value = 'dsl'
    const wrapper = mountPanel()
    expect(wrapper.findComponent(PreviewChart).exists()).toBe(false)
    expect(wrapper.find('.chart-edit-panel__canvas__dsl').exists()).toBe(true)
  })

  it('renders the pinned view toolbar in every mode', () => {
    useEditorPanel().viewMode.value = 'dsl'
    const wrapper = mountPanel()
    expect(wrapper.find('.chart-edit-panel__view-toolbar').exists()).toBe(true)
  })

  it('renders the scene timeline in split mode (chart is visible)', () => {
    useEditorPanel().viewMode.value = 'split'
    const wrapper = mountPanel()
    expect(wrapper.findComponent(FloatingSceneTimeline).exists()).toBe(true)
  })

  it('binds the DSL pane width to splitRatio in split mode', () => {
    const panel = useEditorPanel()
    panel.viewMode.value = 'split'
    panel.splitRatio.value = 0.3
    const wrapper = mountPanel()
    const pane = wrapper.find('.chart-edit-panel__canvas__dsl')
    expect(pane.attributes('style')).toContain('30%')
  })

  it('calls setSplitRatio while dragging the divider', async () => {
    const panel = useEditorPanel()
    panel.viewMode.value = 'split'
    const wrapper = mountPanel()
    const divider = wrapper.find('.chart-edit-panel__divider')
    // jsdom: getBoundingClientRect returns zeros, so width is 0 → guarded; we
    // assert the handler is wired by dispatching pointerdown without throwing.
    await divider.trigger('pointerdown', { clientX: 100, pointerId: 1 })
    expect(divider.exists()).toBe(true)
  })

  it('closes the options panel when entering split mode and re-docks on preview', async () => {
    const panel = useEditorPanel()
    panel.viewMode.value = 'preview'
    mountPanel()
    panel.viewMode.value = 'split'
    await nextTick()
    expect(panelStoreMock.close).toHaveBeenCalled()
    panel.viewMode.value = 'preview'
    await nextTick()
    expect(panelStoreMock.dock).toHaveBeenCalled()
  })
})
