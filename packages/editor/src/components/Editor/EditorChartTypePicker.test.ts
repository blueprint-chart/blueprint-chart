import { mount } from '@vue/test-utils'
import EditorChartTypePicker from './EditorChartTypePicker.vue'

const chartType = ref('bar-vertical')
const recommendations = ref([{ chartType: 'line', label: 'Line', fitness: 'best', reason: '' }])

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ chartType }),
}))

vi.mock('@/composables/useChartRecommendations', () => ({
  useChartRecommendations: () => ({ recommendations }),
}))

describe('EditorChartTypePicker', () => {
  beforeEach(() => {
    chartType.value = 'bar-vertical'
  })

  it('shows every chart type as a card', () => {
    const wrapper = mount(EditorChartTypePicker)
    expect(wrapper.findAll('button')).toHaveLength(14)
  })

  it('groups chart types by purpose', () => {
    const wrapper = mount(EditorChartTypePicker)
    const headings = wrapper.findAll('.editor-chart-type-picker__group__title').map(h => h.text())
    expect(headings).toEqual(['Compare categories', 'Parts of a whole', 'Change over time', 'Relationships'])
  })

  it('presses only the current chart type', () => {
    const wrapper = mount(EditorChartTypePicker)
    const pressed = wrapper.findAll<HTMLButtonElement>('button[aria-pressed="true"]')
    expect(pressed.map(b => b.element.value)).toEqual(['bar-vertical'])
  })

  it('presses the canonical card for an aliased chart type', () => {
    chartType.value = 'vertical-bar'
    const wrapper = mount(EditorChartTypePicker)
    const pressed = wrapper.findAll<HTMLButtonElement>('button[aria-pressed="true"]')
    expect(pressed.map(b => b.element.value)).toEqual(['bar-vertical'])
  })

  it('keeps an aliased chart type when its card is clicked again', async () => {
    chartType.value = 'vertical-bar'
    const wrapper = mount(EditorChartTypePicker)
    await wrapper.find('button[value="bar-vertical"]').trigger('click')
    expect(chartType.value).toBe('vertical-bar')
  })

  it('switches the chart type when a card is clicked', async () => {
    const wrapper = mount(EditorChartTypePicker)
    await wrapper.find('button[value="scatter"]').trigger('click')
    expect(chartType.value).toBe('scatter')
  })

  it('tags the best match for the current data', () => {
    const wrapper = mount(EditorChartTypePicker)
    const tagged = wrapper.findAll('.editor-chart-type-picker__group__list__card--best')
    expect(tagged.map(card => (card.element as HTMLButtonElement).value)).toEqual(['line'])
  })
})
