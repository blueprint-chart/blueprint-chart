import { mount } from '@vue/test-utils'
import type { Dataset } from '@/utils/datasets'
import DatasetsCard from './DatasetsCard.vue'

const dataset: Dataset = {
  key: 'k',
  chartType: 'bar',
  data: '"A" = 1',
  steps: [{ type: 'sort', config: { column: 'value', direction: 'descending' } }],
  rowCount: 12,
  columns: ['country', 'bags', 'year'],
  charts: [
    { id: 'one', title: 'Coffee exports', savedAt: '2026-11-01T00:00:00Z' },
    { id: 'two', title: 'Older', savedAt: null },
  ],
  source: null,
  dsl: '',
}

function mountCard(overrides: Partial<Dataset> = {}, variants: Dataset[] = []) {
  const first = { ...dataset, ...overrides }
  return mount(DatasetsCard, { props: { group: { key: first.data, variants: [first, ...variants] }, selected: false } })
}

describe('DatasetsCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-04T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the name, size, columns, pipeline and usage', () => {
    const text = mountCard().text()
    expect(text).toContain('country, bags, year')
    expect(text).toContain('Coffee exports')
    expect(text).toContain('12 rows · 3 columns')
    expect(text).toContain('Sort')
    expect(text).toMatch(/1 pipeline · 2 charts\s+· 3 days ago/)
  })

  it('lists one pipeline per variant of the same raw data', () => {
    const transposed = { ...dataset, key: 'k2', steps: [{ type: 'transpose', config: {} }], charts: [dataset.charts[0]] }
    const wrapper = mountCard({}, [transposed])
    const pipelines = wrapper.findAll('.datasets-card__pipelines__item')
    expect(pipelines.map(p => p.findAll('.datasets-pipeline__step').map(i => i.text()))).toEqual([
      ['Raw data', 'Sort'],
      ['Raw data', 'Transpose'],
    ])
    expect(wrapper.text()).toContain('2 pipelines · 3 charts')
  })

  it('collapses all but the last step into a count', () => {
    const steps = ['sort', 'rename', 'filter', 'transpose'].map(type => ({ type, config: {} }))
    const items = mountCard({ steps }).findAll('.datasets-pipeline__step')
    expect(items.map(i => i.text())).toEqual(['Raw data', '+3', 'Transpose'])
    expect(items[1].attributes('title')).toBe('Sort → Rename → Filter')
  })

  it('emits select when the title is clicked', async () => {
    const wrapper = mountCard()
    await wrapper.find('.datasets-card__header__text__name').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('emits newChart with the pipeline whose button is clicked', async () => {
    const transposed = { ...dataset, key: 'k2', steps: [{ type: 'transpose', config: {} }] }
    const wrapper = mountCard({}, [transposed])
    await wrapper.findAll('.datasets-card__pipelines__item__action')[1].trigger('click')
    expect(wrapper.emitted('newChart')).toEqual([[transposed]])
  })
})
