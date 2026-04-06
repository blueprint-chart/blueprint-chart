import { ChartType } from '@blueprint-chart/lib'
import { mount } from '@vue/test-utils'
import DataRecommendationCard from './DataRecommendationCard.vue'

function mountCard(props = {}) {
  return mount(DataRecommendationCard, {
    props: {
      chartType: ChartType.BarVertical,
      label: 'Vertical Bar Chart',
      fitness: 'best' as const,
      reason: '1 categorical + 1 numeric',
      ...props,
    },
  })
}

describe('DataRecommendationCard', () => {
  it('renders label and reason', () => {
    const w = mountCard()
    expect(w.text()).toContain('Vertical Bar Chart')
    expect(w.text()).toContain('1 categorical + 1 numeric')
  })

  it('shows correct badge for best fitness', () => {
    const w = mountCard({ fitness: 'best' })
    const badge = w.find('.reco-card__body__title__badge')
    expect(badge.text()).toBe('Best match')
    expect(badge.classes()).toContain('reco-card__body__title__badge--best')
  })

  it('shows correct badge for good fitness', () => {
    const w = mountCard({ fitness: 'good' })
    const badge = w.find('.reco-card__body__title__badge')
    expect(badge.text()).toBe('Good fit')
    expect(badge.classes()).toContain('reco-card__body__title__badge--good')
  })

  it('shows correct badge for alternative fitness', () => {
    const w = mountCard({ fitness: 'alternative' })
    const badge = w.find('.reco-card__body__title__badge')
    expect(badge.text()).toBe('Alternative')
    expect(badge.classes()).toContain('reco-card__body__title__badge--alt')
  })

  it('emits select with chartType on click', async () => {
    const w = mountCard()
    await w.find('.reco-card').trigger('click')
    expect(w.emitted('select')).toEqual([[ChartType.BarVertical]])
  })
})
