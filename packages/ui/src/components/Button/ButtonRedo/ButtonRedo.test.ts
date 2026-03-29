import { shallowMount } from '@vue/test-utils'
import ButtonRedo from './ButtonRedo.vue'

const stubs = {
  ButtonIcon: {
    props: ['disabled'],
    template: '<button :disabled="disabled"><slot /></button>',
  },
}

describe('ButtonRedo rendering', () => {
  it('renders without errors', () => {
    const wrapper = shallowMount(ButtonRedo, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('is enabled by default', () => {
    const wrapper = shallowMount(ButtonRedo, { global: { stubs } })
    expect(wrapper.find('button').element.disabled).toBe(false)
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = shallowMount(ButtonRedo, {
      props: { disabled: true },
      global: { stubs },
    })
    expect(wrapper.find('button').element.disabled).toBe(true)
  })
})

describe('ButtonRedo events', () => {
  it('emits click when clicked', async () => {
    const wrapper = shallowMount(ButtonRedo, { global: { stubs } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
