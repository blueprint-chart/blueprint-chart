import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardChartCard from './DashboardChartCard.vue'

vi.mock('@blueprint-chart/ui', () => ({
  GalleryCard: {
    template: `<div class="gallery-card" @click="$emit('click')">
      <slot name="actions" />
      <slot name="footer" />
    </div>`,
    props: ['title', 'subtitle', 'thumbSrc', 'selected', 'layout', 'forceLightThumb'],
    emits: ['click'],
  },
  DisplayDate: {
    template: '<span class="display-date">{{ value }}</span>',
    props: ['value'],
  },
  DisplayChartTypeBadge: {
    template: '<span class="display-chart-type-badge">{{ chartType }}</span>',
    props: ['chartType'],
  },
  ButtonIcon: {
    template: '<button class="btn-icon" @click="$emit(\'click\')"></button>',
    props: ['iconLeft', 'label', 'hideLabel', 'square', 'variant', 'size'],
    emits: ['click'],
  },
}))

const chart = {
  id: 'abc',
  title: 'Test Chart',
  description: 'A chart',
  allowDarkMode: true,
  savedAt: '2026-01-01',
  chartType: 'bar',
  sceneCount: 1,
  rowCount: 10,
}

describe('DashboardChartCard', () => {
  it('emits edit when edit button is clicked', async () => {
    const w = mount(DashboardChartCard, {
      props: { chart, selected: false, layout: 'grid' as const },
    })
    await w.find('.dashboard-chart-card__edit-btn').trigger('click')
    expect(w.emitted('edit')).toEqual([[chart.id]])
  })

  it('renders the edit button', () => {
    const w = mount(DashboardChartCard, {
      props: { chart, selected: false, layout: 'grid' as const },
    })
    expect(w.find('.dashboard-chart-card__edit-btn').exists()).toBe(true)
  })

  it('emits select when card is clicked', async () => {
    const w = mount(DashboardChartCard, {
      props: { chart, selected: false, layout: 'grid' as const },
    })
    await w.find('.gallery-card').trigger('click')
    expect(w.emitted('select')).toEqual([[chart.id]])
  })
})
