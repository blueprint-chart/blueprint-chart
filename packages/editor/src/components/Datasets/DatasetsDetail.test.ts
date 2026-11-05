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
  columnCount: 2,
  charts: [
    { id: 'one', title: 'First', savedAt: null },
    { id: 'two', title: '', savedAt: null },
  ],
  source: null,
  dsl: '',
}

function mountDetail(overrides: Partial<Dataset> = {}) {
  return mount(DatasetsDetail, {
    props: { dataset: { ...dataset, ...overrides } },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('DatasetsDetail', () => {
  it('renders at most 5 preview rows', () => {
    expect(mountDetail().findAll('tbody tr')).toHaveLength(5)
  })

  it('renders one step per dataset step with its description', () => {
    const items = mountDetail({ steps }).findAll('.datasets-detail__steps__item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain(describeStep(steps[0]))
    expect(items[1].text()).toContain(describeStep(steps[1]))
  })

  it('links to each chart editor', () => {
    const links = mountDetail().findAllComponents(RouterLinkStub)
    expect(links.map(l => String(l.props('to')))).toEqual(['/edit/one', '/edit/two'])
  })
})
