import { shallowMount } from '@vue/test-utils'
import ButtonUndo from './ButtonUndo.vue'

const stubs = {
  ButtonIcon: {
    props: ['disabled'],
    template: '<button :disabled="disabled"><slot /></button>',
  },
}

describe('ButtonUndo rendering', () => {
  it('renders without errors', () => {
    const wrapper = shallowMount(ButtonUndo, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('is enabled by default', () => {
    const wrapper = shallowMount(ButtonUndo, { global: { stubs } })
    expect(wrapper.find('button').element.disabled).toBe(false)
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = shallowMount(ButtonUndo, {
      props: { disabled: true },
      global: { stubs },
    })
    expect(wrapper.find('button').element.disabled).toBe(true)
  })
})

describe('ButtonUndo events', () => {
  it('emits click when clicked', async () => {
    const wrapper = shallowMount(ButtonUndo, { global: { stubs } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
