import { mount } from '@vue/test-utils'
import ChartThumbnail from '@/components/Chart/ChartThumbnail.vue'
import DataUploadSamples from './DataUploadSamples.vue'

vi.mock('@blueprint-chart/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/lib')>()
  return {
    ...actual,
    samples: [
      { id: 'test-1', title: 'Test Chart', chartType: actual.ChartType.BarVertical, tsvData: 'label\tvalue\nA\t1\nB\t2', serializedData: '', dsl: 'chart bar-vertical {}', description: '' },
      { id: 'test-2', title: 'Another Chart', chartType: actual.ChartType.Line, tsvData: 'x\ty\n1\t10\n2\t20\n3\t30', serializedData: '', dsl: 'chart line {}', description: '' },
    ],
  }
})

function mountSamples() {
  return mount(DataUploadSamples)
}

describe('DataUploadSamples', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders sample cards as native buttons', () => {
    const w = mountSamples()
    const cards = w.findAll('button.data-upload-samples__card[type="button"]')
    expect(cards).toHaveLength(2)
  })

  it('renders a card for each sample', () => {
    const w = mountSamples()
    const cards = w.findAll('.data-upload-samples__card')
    expect(cards.length).toBe(2)
  })

  it('wraps the cards in a block named after the component', () => {
    const w = mountSamples()
    expect(w.classes()).toContain('data-upload-samples')
  })

  it('displays sample title', () => {
    const w = mountSamples()
    const cards = w.findAll('.data-upload-samples__card')
    expect(cards[0].text()).toContain('Test Chart')
    expect(cards[1].text()).toContain('Another Chart')
  })

  it('displays row count and chart type label', () => {
    const w = mountSamples()
    const cards = w.findAll('.data-upload-samples__card')
    expect(cards[0].text()).toContain('2 rows')
    expect(cards[0].text()).toContain('Columns')
    expect(cards[1].text()).toContain('Line')
  })

  it('emits select with full ChartSample on click', async () => {
    const w = mountSamples()
    await w.findAll('.data-upload-samples__card')[0].trigger('click')
    const emitted = w.emitted('select')!
    expect(emitted).toHaveLength(1)
    const sample = emitted[0][0] as { id: string, tsvData: string, dsl: string }
    expect(sample.id).toBe('test-1')
    expect(sample.tsvData).toBe('label\tvalue\nA\t1\nB\t2')
    expect(sample).toHaveProperty('dsl')
  })

  it('renders a live thumbnail of each sample DSL', () => {
    const w = mountSamples()
    const thumbs = w.findAllComponents(ChartThumbnail)
    expect(thumbs.map(t => t.props('dsl'))).toEqual(['chart bar-vertical {}', 'chart line {}'])
  })

  it('offers an all filter plus one filter per chart family that has samples', () => {
    const w = mountSamples()
    const filters = w.findAll('.data-upload-samples__filters__filter')
    expect(filters.map(filter => filter.text())).toEqual(['All 2', 'Compare categories', 'Change over time'])
  })

  it('selects the all filter by default', () => {
    const w = mountSamples()
    const filters = w.findAll('.data-upload-samples__filters__filter')
    expect(filters.map(filter => filter.attributes('aria-pressed'))).toEqual(['true', 'false', 'false'])
  })

  it('shows only the samples of the picked family', async () => {
    const w = mountSamples()
    await w.findAll('.data-upload-samples__filters__filter')[2].trigger('click')
    const cards = w.findAll('.data-upload-samples__card').filter(card => card.isVisible())
    expect(cards.map(card => card.text())).toEqual([expect.stringContaining('Another Chart')])
    expect(w.findAll('.data-upload-samples__filters__filter')[2].attributes('aria-pressed')).toBe('true')
  })
  it('keeps every thumbnail mounted when switching filters', async () => {
    const w = mountSamples()
    await w.findAll('.data-upload-samples__filters__filter')[2].trigger('click')
    expect(w.findAllComponents(ChartThumbnail)).toHaveLength(2)
  })
})
