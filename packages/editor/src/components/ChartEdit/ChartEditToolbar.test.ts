import { ref } from 'vue'
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

  it('offers exactly Chart, Chart + BPC and BPC options', () => {
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    const labels = wrapper
      .findAll('.navigation-segmented-control__option')
      .map(el => el.text().trim())
    expect(labels).toEqual(['Chart', 'Chart + BPC', 'BPC'])
  })

  it('calls setViewMode with "split" when the Chart + BPC option is selected', async () => {
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    const splitOption = wrapper
      .findAll('.navigation-segmented-control__option')
      .find(el => el.text().trim() === 'Chart + BPC')
    expect(splitOption).toBeDefined()
    await splitOption!.trigger('click')
    expect(setViewMode).toHaveBeenCalledWith('split')
  })
})
