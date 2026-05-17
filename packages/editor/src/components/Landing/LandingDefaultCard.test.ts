import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import LandingDefaultCard from './LandingDefaultCard.vue'

const MockIcon = defineComponent({ render: () => h('svg', { 'data-test': 'mock-icon' }) })

function mountCard(props = {}) {
  return mount(LandingDefaultCard, {
    props: {
      icon: MockIcon,
      tag: '01',
      title: 'Axes start at zero',
      description: 'Bars never lie.',
      ...props,
    },
    global: {
      stubs: { AppIcon: { template: '<span class="icon-stub" />', props: ['name', 'size', 'variant'] } },
    },
  })
}

describe('LandingDefaultCard', () => {
  it('renders the title and description', () => {
    const w = mountCard()
    expect(w.text()).toContain('Axes start at zero')
    expect(w.text()).toContain('Bars never lie.')
  })

  it('renders a numeric tag', () => {
    const w = mountCard({ tag: '03' })
    expect(w.find('.landing-default-card__head__tag').text()).toBe('03')
  })

  it('renders a string tag verbatim', () => {
    const w = mountCard({ tag: 'SORT · FILTER · GROUP' })
    expect(w.find('.landing-default-card__head__tag').text()).toBe('SORT · FILTER · GROUP')
  })

  it('renders the icon slot via AppIcon', () => {
    const w = mountCard()
    expect(w.find('.landing-default-card__head__icon').exists()).toBe(true)
    expect(w.find('.icon-stub').exists()).toBe(true)
  })

  it('has the expected BEM root class', () => {
    const w = mountCard()
    expect(w.classes()).toContain('landing-default-card')
  })
})
