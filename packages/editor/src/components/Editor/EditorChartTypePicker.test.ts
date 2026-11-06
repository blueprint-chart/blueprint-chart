import { mount } from '@vue/test-utils'
import EditorChartTypePicker from './EditorChartTypePicker.vue'

const chartType = ref('bar-vertical')
const selectedColumn = ref('')
const recommendations = ref([{ chartType: 'line', label: 'Line', fitness: 'best', reason: '' }])

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ chartType, selectedColumn }),
}))

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({ currentOptions: ref({}), availableOptionKeys: ref(['stackMode']), setOption: vi.fn() }),
}))

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({ columns: ref(['Label', 'Sales', 'Profit']) }),
}))

vi.mock('@/composables/useChartRecommendations', () => ({
  useChartRecommendations: () => ({ recommendations }),
}))

describe('EditorChartTypePicker', () => {
  beforeEach(() => {
    chartType.value = 'bar-vertical'
  })

  it('shows every chart type as a radio card', () => {
    const wrapper = mount(EditorChartTypePicker)
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(14)
  })

  it('groups chart types by purpose', () => {
    const wrapper = mount(EditorChartTypePicker)
    const headings = wrapper.findAll('.editor-chart-type-picker__group__title').map(h => h.text())
    expect(headings).toEqual(['Compare categories', 'Parts of a whole', 'Change over time', 'Relationships'])
  })

  it('checks the current chart type', () => {
    const wrapper = mount(EditorChartTypePicker)
    const checked = wrapper.find<HTMLInputElement>('input[type="radio"]:checked')
    expect(checked.element.value).toBe('bar-vertical')
  })

  it('switches the chart type when a card is picked', async () => {
    const wrapper = mount(EditorChartTypePicker)
    await wrapper.find('input[value="scatter"]').setValue()
    expect(chartType.value).toBe('scatter')
  })

  it('tags the best match for the current data', () => {
    const wrapper = mount(EditorChartTypePicker)
    const tagged = wrapper.findAll('.editor-chart-type-picker__group__list__card--best')
    expect(tagged.map(card => card.find('input').element.value)).toEqual(['line'])
  })

  it('leaves column and stack settings to the style tab', () => {
    const wrapper = mount(EditorChartTypePicker)
    expect(wrapper.find('#column-select').exists()).toBe(false)
    expect(wrapper.find('#opt-stack-mode').exists()).toBe(false)
  })

  it('marks only the selected card with a check', () => {
    const wrapper = mount(EditorChartTypePicker)
    const checks = wrapper.findAll('.editor-chart-type-picker__group__list__card__preview__check')
    expect(checks).toHaveLength(1)
    expect(checks[0].element.closest('label')!.querySelector('input')!.value).toBe('bar-vertical')
  })
})
