import { shallowMount } from '@vue/test-utils'
import ButtonDetach from './ButtonDetach.vue'

const stubs = {
  ButtonIcon: { template: '<button :class="$attrs.class" v-bind="$attrs"><slot /></button>' },
}

describe('ButtonDetach rendering', () => {
  it('renders the button-panel-action class', () => {
    const wrapper = shallowMount(ButtonDetach, { global: { stubs } })
    expect(wrapper.classes()).toContain('button-panel-action')
  })
})

describe('ButtonDetach events', () => {
  it('emits click when clicked', async () => {
    const wrapper = shallowMount(ButtonDetach, { global: { stubs } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
