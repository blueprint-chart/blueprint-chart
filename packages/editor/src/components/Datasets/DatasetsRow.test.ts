import { mount } from '@vue/test-utils'
import type { Dataset } from '@/utils/datasets'
import DatasetsRow from './DatasetsRow.vue'

const dataset: Dataset = {
  key: 'k',
  chartType: 'bar',
  data: '"A" = 1',
  steps: [],
  rowCount: 12,
  columnCount: 3,
  charts: [
    { id: 'one', title: 'Coffee exports', savedAt: '2026-11-01T00:00:00Z' },
    { id: 'two', title: 'Older', savedAt: null },
  ],
  source: null,
  dsl: '',
}

function mountRow() {
  return mount(DatasetsRow, {
    props: { dataset, expanded: false },
    global: { stubs: { DatasetsDetail: true } },
  })
}

describe('DatasetsRow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-04T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the name, size and chart count', () => {
    const text = mountRow().text()
    expect(text).toContain('Coffee exports')
    expect(text).toContain('12 × 3')
    expect(text).toContain('used by 2 charts')
  })

  it('renders the last used time relative to now', () => {
    expect(mountRow().text()).toContain('3 days ago')
  })

  it('emits newChart when "New chart" is clicked', async () => {
    const wrapper = mountRow()
    const button = wrapper.findAll('button').find(b => b.text() === 'New chart')
    await button!.trigger('click')
    expect(wrapper.emitted('newChart')).toHaveLength(1)
    expect(wrapper.emitted('update:expanded')).toBeUndefined()
  })

  it('sets expanded when the row is clicked', async () => {
    const wrapper = mountRow()
    await wrapper.find('.datasets-row__summary').trigger('click')
    expect(wrapper.emitted('update:expanded')).toEqual([[true]])
  })
})
