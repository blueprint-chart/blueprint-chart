import { mount } from '@vue/test-utils'
import { layoutDefaults, type ChartLayout } from '@/composables/useChartConfig'
import ChartCard from './ChartCard.vue'

function mountCard(overrides: Partial<ChartLayout> = {}) {
  return mount(ChartCard, {
    props: { layout: { ...layoutDefaults, ...overrides } },
    slots: { default: '<span class="slot-child" />' },
  })
}

describe('ChartCard', () => {
  it('applies the layout width', () => {
    const wrapper = mountCard({ sizing: 'fixed', fixedWidth: 480 })
    expect((wrapper.element as HTMLElement).style.width).toBe('480px')
  })

  it('adds the transparent modifier', () => {
    const wrapper = mountCard({ transparentBackground: true })
    expect(wrapper.classes()).toContain('chart-card--transparent')
  })

  it('adds the constrained-height modifier for aspect-ratio', () => {
    const wrapper = mountCard({ heightMode: 'aspect-ratio', aspectRatio: '16:9' })
    expect(wrapper.classes()).toContain('chart-card--constrained-height')
  })

  it('renders the slot', () => {
    expect(mountCard().find('.slot-child').exists()).toBe(true)
  })

  it('exposes the root element', () => {
    const wrapper = mountCard()
    expect((wrapper.vm as unknown as { el: HTMLElement }).el).toBe(wrapper.element)
  })
})
