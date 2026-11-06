import { mount } from '@vue/test-utils'
import EditorDataColumnSection from './EditorDataColumnSection.vue'

const selectedColumn = ref('')
const columns = ref(['Label', 'Sales', 'Profit'])

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ selectedColumn }),
}))

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({ columns }),
}))

describe('EditorDataColumnSection', () => {
  beforeEach(() => {
    selectedColumn.value = ''
    columns.value = ['Label', 'Sales', 'Profit']
  })

  it('lists every value column', () => {
    const wrapper = mount(EditorDataColumnSection)
    expect(wrapper.findAll('#column-select option').map(o => o.text())).toEqual(['Sales', 'Profit'])
  })

  it('shows the first value column when none is picked, without storing it', () => {
    const wrapper = mount(EditorDataColumnSection)
    expect(wrapper.find<HTMLSelectElement>('#column-select').element.value).toBe('Sales')
    expect(selectedColumn.value).toBe('')
  })

  it('falls back to the first value column when the picked one is gone', async () => {
    selectedColumn.value = 'Sales'
    const wrapper = mount(EditorDataColumnSection)
    columns.value = ['Label', 'Revenue', 'Cost']
    await nextTick()
    expect(wrapper.find<HTMLSelectElement>('#column-select').element.value).toBe('Revenue')
  })

  it('switches the plotted column', async () => {
    const wrapper = mount(EditorDataColumnSection)
    await wrapper.find('#column-select').setValue('Profit')
    expect(selectedColumn.value).toBe('Profit')
  })
})
