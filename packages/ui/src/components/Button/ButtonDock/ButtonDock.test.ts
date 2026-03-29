import { shallowMount } from '@vue/test-utils'
import ButtonDock from './ButtonDock.vue'

const stubs = {
  ButtonIcon: { template: '<button :class="$attrs.class" v-bind="$attrs"><slot /></button>' },
}

describe('ButtonDock rendering', () => {
  it('renders the button-panel-action class', () => {
    const wrapper = shallowMount(ButtonDock, { global: { stubs } })
    expect(wrapper.classes()).toContain('button-panel-action')
  })
})

describe('ButtonDock events', () => {
  it('emits click when clicked', async () => {
    const wrapper = shallowMount(ButtonDock, { global: { stubs } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
