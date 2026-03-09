import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import LandingPracticeCard from './LandingPracticeCard.vue'

const MockIcon = defineComponent({ render: () => h('svg') })

function mountCard(props = {}) {
  return mount(LandingPracticeCard, {
    props: {
      icon: MockIcon,
      title: 'Start at zero',
      description: 'Bars start at zero.',
      badge: 'Enforced',
      ...props,
    },
    global: {
      stubs: { AppIcon: { template: '<span class="icon-stub" />', props: ['name', 'size', 'variant'] } },
    },
  })
}

describe('LandingPracticeCard', () => {
  it('renders title, description and badge', () => {
    const w = mountCard()
    expect(w.text()).toContain('Start at zero')
    expect(w.text()).toContain('Bars start at zero.')
    expect(w.text()).toContain('Enforced')
  })

  it('renders the icon', () => {
    const w = mountCard()
    expect(w.find('.practice-card__icon').exists()).toBe(true)
  })
})
