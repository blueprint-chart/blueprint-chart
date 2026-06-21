import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import ChartEditToolbar from './ChartEditToolbar.vue'

const setViewMode = vi.fn()
const isNarrowRef = ref(false)

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({ viewMode: ref('preview'), setViewMode }),
}))
vi.mock('@/stores/chartHistory', () => ({
  useChartHistory: () => ({ canUndo: ref(false), canRedo: ref(false), undo: vi.fn(), redo: vi.fn() }),
}))
// Keep NavigationToggle (and the rest of the library) real so the rendered
// options are exercised; only override the breakpoint so the test controls
// narrow/wide.
vi.mock('@blueprint-chart/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@blueprint-chart/ui')>()),
  useBreakpoint: () => ({ isNarrow: isNarrowRef }),
}))

function optionLabels(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll('.navigation-segmented-control__option')
    .map(el => el.text().trim())
}

describe('ChartEditToolbar', () => {
  beforeEach(() => {
    setViewMode.mockClear()
    isNarrowRef.value = false
  })

  it('offers exactly Chart, Chart + BPC and BPC options on wide viewports', () => {
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    expect(optionLabels(wrapper)).toEqual(['Chart', 'Chart + BPC', 'BPC'])
  })

  it('drops the Chart + BPC option on narrow viewports', () => {
    isNarrowRef.value = true
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    expect(optionLabels(wrapper)).toEqual(['Chart', 'BPC'])
  })

  it('renders an icon per option (icon-only toggle)', () => {
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    const icons = wrapper.findAll('.navigation-segmented-control__option__icon')
    expect(icons.length).toBe(3)
  })

  it('exposes the mode name as a tooltip on each option', () => {
    const wrapper = mount(ChartEditToolbar, { global: { stubs: { ButtonUndo: true, ButtonRedo: true } } })
    const titles = wrapper
      .findAll('.navigation-segmented-control__option')
      .map(el => el.attributes('title'))
    expect(titles).toEqual(['Chart', 'Chart + BPC', 'BPC'])
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
