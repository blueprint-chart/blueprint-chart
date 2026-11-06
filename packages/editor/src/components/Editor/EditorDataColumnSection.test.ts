import { mount } from '@vue/test-utils'
import EditorDataColumnSection from './EditorDataColumnSection.vue'

const chartType = ref('bar-vertical')
const selectedColumn = ref('')

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ chartType, selectedColumn }),
}))

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({ columns: ref(['Label', 'Sales', 'Profit']) }),
}))

describe('EditorDataColumnSection', () => {
  beforeEach(() => {
    selectedColumn.value = ''
  })

  it('lists every value column', () => {
    const wrapper = mount(EditorDataColumnSection)
    expect(wrapper.findAll('#column-select option').map(o => o.text())).toEqual(['Sales', 'Profit'])
  })

  it('defaults to the first value column', () => {
    mount(EditorDataColumnSection)
    expect(selectedColumn.value).toBe('Sales')
  })

  it('switches the plotted column', async () => {
    const wrapper = mount(EditorDataColumnSection)
    await wrapper.find('#column-select').setValue('Profit')
    expect(selectedColumn.value).toBe('Profit')
  })
})
