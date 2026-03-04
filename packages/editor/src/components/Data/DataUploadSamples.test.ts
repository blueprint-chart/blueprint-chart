import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DataUploadSamples from './DataUploadSamples.vue'

vi.mock('@blueprint-chart/lib', () => ({
  samples: [
    { id: 'test-1', title: 'Test Chart', chartType: 'bar-vertical', tsvData: 'label\tvalue\nA\t1\nB\t2', serializedData: '', dsl: '', description: '' },
    { id: 'test-2', title: 'Another Chart', chartType: 'line', tsvData: 'x\ty\n1\t10\n2\t20\n3\t30', serializedData: '', dsl: '', description: '' },
  ],
}))

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

  it('displays row and col counts', () => {
    const w = mountSamples()
    const cards = w.findAll('.sample-card')
    expect(cards[0].text()).toContain('2 rows')
    expect(cards[0].text()).toContain('2 cols')
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

  it('renders an icon component for each card', () => {
    const w = mountSamples()
    const icons = w.findAll('.sample-card__icon')
    expect(icons.length).toBe(2)
    icons.forEach((icon) => {
      expect(icon.find('svg').exists() || icon.findComponent({ name: /^IPh/ }).exists()).toBe(true)
    })
  })
})
