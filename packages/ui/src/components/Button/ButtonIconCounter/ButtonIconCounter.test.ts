import { shallowMount } from '@vue/test-utils'
import ButtonIconCounter from './ButtonIconCounter.vue'

describe('ButtonIconCounter', () => {
  it('renders nothing when counter is null', () => {
    const wrapper = shallowMount(ButtonIconCounter, {
      global: { stubs: { BBadge: { template: '<span><slot /></span>' } } },
    })
    expect(wrapper.find('.button-icon-counter').exists()).toBe(false)
  })

  it('renders counter value', () => {
    const wrapper = shallowMount(ButtonIconCounter, {
      props: { counter: 5 },
      global: { stubs: { BBadge: { template: '<span class="button-icon-counter"><slot /></span>' } } },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('renders zero counter', () => {
    const wrapper = shallowMount(ButtonIconCounter, {
      props: { counter: 0 },
      global: { stubs: { BBadge: { template: '<span class="button-icon-counter"><slot /></span>' } } },
    })
    expect(wrapper.text()).toContain('0')
  })
})
