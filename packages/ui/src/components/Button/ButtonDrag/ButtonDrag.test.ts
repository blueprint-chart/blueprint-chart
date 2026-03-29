import { shallowMount } from '@vue/test-utils'
import ButtonDrag from './ButtonDrag.vue'

const stubs = {
  ButtonIcon: { template: '<button :class="$attrs.class" v-bind="$attrs"><slot /></button>' },
}

describe('ButtonDrag rendering', () => {
  it('renders the button-drag class', () => {
    const wrapper = shallowMount(ButtonDrag, { global: { stubs } })
    expect(wrapper.classes()).toContain('button-drag')
  })
})
