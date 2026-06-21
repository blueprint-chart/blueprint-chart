import { mount } from '@vue/test-utils'
import ChartEditToolbar from './ChartEditToolbar.vue'

const setViewMode = vi.fn()
vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({ viewMode: ref('preview'), setViewMode }),
}))
vi.mock('@/stores/chartHistory', () => ({
  useChartHistory: () => ({ canUndo: ref(false), canRedo: ref(false), undo: vi.fn(), redo: vi.fn() }),
}))

describe('ChartEditToolbar', () => {
  beforeEach(() => { setViewMode.mockClear() })

  it('offers Chart, Chart + BPC and BPC options', () => {
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    const text = wrapper.text()
    expect(text).toContain('Chart + BPC')
    expect(text).toContain('BPC')
    // exactly three segmented options
    expect(wrapper.findAll('.navigation-segmented-control__option').length).toBe(3)
  })
})
