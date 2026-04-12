import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import DataUploadSamples from './DataUploadSamples.vue'

const FAKE_SVG = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
const FAKE_DATA_URL = 'data:image/svg+xml;base64,abc'

vi.mock('@/composables/useChartThumbnail', () => ({
  renderThumbnailFromDsl: vi.fn((dsl: string) => (dsl ? FAKE_SVG : null)),
  svgToDataUrl: vi.fn(() => FAKE_DATA_URL),
}))

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
  it('renders a card for each sample', () => {
    const w = mountSamples()
    const cards = w.findAll('.sample-card')
    expect(cards.length).toBe(2)
  })

  it('displays sample title', () => {
    const w = mountSamples()
    const cards = w.findAll('.sample-card')
    expect(cards[0].text()).toContain('Test Chart')
    expect(cards[1].text()).toContain('Another Chart')
  })

  it('displays row count and chart type label', () => {
    const w = mountSamples()
    const cards = w.findAll('.sample-card')
    expect(cards[0].text()).toContain('2 rows')
    expect(cards[0].text()).toContain('Columns')
    expect(cards[1].text()).toContain('Line')
  })

  it('emits select with full ChartSample on click', async () => {
    const w = mountSamples()
    await w.findAll('.sample-card')[0].trigger('click')
    const emitted = w.emitted('select')!
    expect(emitted).toHaveLength(1)
    const sample = emitted[0][0] as { id: string, tsvData: string, dsl: string }
    expect(sample.id).toBe('test-1')
    expect(sample.tsvData).toBe('label\tvalue\nA\t1\nB\t2')
    expect(sample).toHaveProperty('dsl')
  })

  it('renders chart thumbnail images after mount', async () => {
    const w = mountSamples()
    await nextTick()
    const images = w.findAll('.sample-card__thumb__img')
    expect(images.length).toBe(2)
    expect(images[0].attributes('src')).toBe(FAKE_DATA_URL)
    expect(images[1].attributes('src')).toBe(FAKE_DATA_URL)
  })

  it('sets alt text on thumbnail images', async () => {
    const w = mountSamples()
    await nextTick()
    const images = w.findAll('.sample-card__thumb__img')
    expect(images[0].attributes('alt')).toBe('Test Chart')
    expect(images[1].attributes('alt')).toBe('Another Chart')
  })
})
