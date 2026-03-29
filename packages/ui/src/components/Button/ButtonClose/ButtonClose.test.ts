import { shallowMount } from '@vue/test-utils'
import ButtonClose from './ButtonClose.vue'

const stubs = {
  ButtonIcon: { template: '<button :class="$attrs.class" v-bind="$attrs"><slot /></button>' },
}

describe('ButtonClose rendering', () => {
  it('renders the button-panel-action class', () => {
    const wrapper = shallowMount(ButtonClose, { global: { stubs } })
    expect(wrapper.classes()).toContain('button-panel-action')
  })
})

describe('ButtonClose events', () => {
  it('emits click when clicked', async () => {
    const wrapper = shallowMount(ButtonClose, { global: { stubs } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
