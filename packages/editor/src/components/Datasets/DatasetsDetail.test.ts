import { mount, RouterLinkStub } from '@vue/test-utils'
import type { Dataset, DatasetStep } from '@/utils/datasets'
import { describeStep } from '@/components/Data/DataTransform/describeStep'
import DatasetsDetail from './DatasetsDetail.vue'

const rows = Array.from({ length: 8 }, (_, i) => `  "Row ${i}" = ${i}`).join('\n')

const steps: DatasetStep[] = [
  { type: 'sort', config: { column: 'value', direction: 'descending' } },
  { type: 'filter', config: { column: 'value', condition: 'greater-than', value: '2' } },
]

const dataset: Dataset = {
  key: 'k',
  chartType: 'bar',
  data: rows,
  steps: [],
  rowCount: 8,
  columns: ['label', 'value'],
  charts: [
    { id: 'one', title: 'First', savedAt: null },
    { id: 'two', title: '', savedAt: null },
  ],
  source: null,
  dsl: '',
}

function mountDetail(overrides: Partial<Dataset> = {}, variants: Dataset[] = []) {
  const first = { ...dataset, ...overrides }
  return mount(DatasetsDetail, {
    props: { group: { key: first.data, variants: [first, ...variants] }, pipeline: first.key, thumbnails: { one: 'data:one' } },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('DatasetsDetail', () => {
  it('renders at most 5 preview rows and says how many there are', () => {
    const wrapper = mountDetail()
    expect(wrapper.findAll('tbody tr')).toHaveLength(5)
    expect(wrapper.find('.datasets-detail__table__caption').text()).toBe('First 5 of 8 rows')
  })

  it('gives only the row count when every row fits', () => {
    expect(mountDetail({ steps: [steps[1]] }).find('.datasets-detail__table__caption').text()).toBe('5 rows')
  })

  it('counts rows and columns after the steps', () => {
    const chips = mountDetail({ steps: [steps[1]] }).findAll('.dashboard-meta-chip')
    expect(chips.map(c => c.text())).toEqual(['Rows5', 'Columns2', 'Steps1', 'Charts2'])
  })

  it('emits newChart with the first pipeline when the picked one is gone', async () => {
    const wrapper = mountDetail()
    await wrapper.setProps({ pipeline: 'missing' })
    await wrapper.findAll('button').find(b => b.text() === 'Reuse in new chart')!.trigger('click')
    expect(wrapper.emitted('newChart')).toEqual([[wrapper.props('group').variants[0]]])
  })

  it('renders one step per dataset step with its description', () => {
    const items = mountDetail({ steps }).findAll('.datasets-detail__steps__list__item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain(describeStep(steps[0]))
    expect(items[1].text()).toContain(describeStep(steps[1]))
  })

  it('hides the description of a step that has no settings', () => {
    const item = mountDetail({ steps: [{ type: 'sort', config: {} }] }).find('.datasets-detail__steps__list__item')
    expect(item.text()).toBe('1Sort')
  })

  it('applies the steps to the preview rows', () => {
    const firstCell = mountDetail({ steps: [steps[0]] }).find('tbody tr td')
    expect(firstCell.text()).toBe('Row 7')
  })

  it('emits newChart from the "Reuse in new chart" button', async () => {
    const wrapper = mountDetail()
    await wrapper.findAll('button').find(b => b.text() === 'Reuse in new chart')!.trigger('click')
    expect(wrapper.emitted('newChart')).toHaveLength(1)
  })

  it('shows a thumbnail for charts that have one', () => {
    const images = mountDetail().findAll('.datasets-detail__charts__list__item__link__thumb__img')
    expect(images.map(i => i.attributes('src'))).toEqual(['data:one'])
  })

  it('hides the pipeline picker with a single pipeline', () => {
    expect(mountDetail().find('.datasets-detail__pipelines').exists()).toBe(false)
  })

  it('switches the steps when another pipeline is picked', async () => {
    const sorted = { ...dataset, key: 'k2', steps: [steps[0]] }
    const wrapper = mountDetail({}, [sorted])
    expect(wrapper.find('.datasets-detail__steps').exists()).toBe(false)
    await wrapper.findAll('.datasets-detail__pipelines__list__item__button')[1].trigger('click')
    expect(wrapper.emitted('update:pipeline')).toEqual([['k2']])
    await wrapper.setProps({ pipeline: 'k2' })
    expect(wrapper.find('.datasets-detail__steps').text()).toContain('Sort')
  })

  it('links to each chart editor', () => {
    const links = mountDetail().findAllComponents(RouterLinkStub)
    expect(links.map(l => String(l.props('to')))).toEqual(['/edit/one', '/edit/two'])
  })
})
