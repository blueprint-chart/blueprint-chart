import { mount } from '@vue/test-utils'
import ChartEditToolbar from './ChartEditToolbar.vue'
import CanvasViewPicker from '@/components/Canvas/CanvasViewPicker/CanvasViewPicker.vue'

const isNarrowRef = ref(false)

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    viewMode: ref('preview'),
    canvasMode: ref('blueprint'),
    showDimensions: ref(true),
    setViewMode: vi.fn(),
    setCanvasMode: vi.fn(),
  }),
}))
vi.mock('@/stores/chartHistory', () => ({
  useChartHistory: () => ({ canUndo: ref(false), canRedo: ref(false), undo: vi.fn(), redo: vi.fn() }),
}))
// Keep the library real so the picker's segmented control renders; only
// override the breakpoint so the test controls narrow/wide.
vi.mock('@blueprint-chart/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@blueprint-chart/ui')>()),
  useBreakpoint: () => ({ isNarrow: isNarrowRef }),
}))
vi.mock('~icons/ph/ruler', () => ({
  default: { template: '<span class="icon-ruler" />' },
}))
vi.mock('~icons/ph/caret-down', () => ({
  default: { template: '<span class="icon-caret-down" />' },
}))

function mountToolbar() {
  return mount(ChartEditToolbar, {
    global: { stubs: { ButtonUndo: true, ButtonRedo: true } },
  })
}

describe('ChartEditToolbar', () => {
  beforeEach(() => {
    isNarrowRef.value = false
  })

  it('renders undo, redo and the view picker', () => {
    const wrapper = mountToolbar()
    expect(wrapper.find('button-undo-stub').exists()).toBe(true)
    expect(wrapper.find('button-redo-stub').exists()).toBe(true)
    expect(wrapper.findComponent(CanvasViewPicker).exists()).toBe(true)
  })

  it('asks the picker for its layout section', () => {
    const wrapper = mountToolbar()
    expect(wrapper.findComponent(CanvasViewPicker).props('showLayout')).toBe(true)
  })

  // The view modes moved into the picker's popover; the toolbar itself no
  // longer carries a segmented control (see CanvasViewPicker.test.ts for the
  // view mode assertions).
  it('renders no view mode toggle of its own', () => {
    const wrapper = mountToolbar()
    expect(wrapper.find('.canvas-view-picker__panel').exists()).toBe(false)
    expect(wrapper.find('.navigation-segmented-control').exists()).toBe(false)
  })
})
