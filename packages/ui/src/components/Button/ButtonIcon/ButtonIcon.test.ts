import { shallowMount } from '@vue/test-utils'
import ButtonIcon from './ButtonIcon.vue'

const stubs = {
  BButton: { template: '<button :class="$attrs.class"><slot /></button>' },
  BTooltip: true,
}

describe('ButtonIcon rendering', () => {
  it('renders the button-icon class', () => {
    const wrapper = shallowMount(ButtonIcon, {
      global: { stubs },
    })
    expect(wrapper.classes()).toContain('button-icon')
  })

  it('renders label text', () => {
    const wrapper = shallowMount(ButtonIcon, {
      props: { label: 'Click me' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('hides label when hideLabel is true', () => {
    const wrapper = shallowMount(ButtonIcon, {
      props: { label: 'Click me', hideLabel: true, hideTooltip: true },
      global: { stubs },
    })
    expect(wrapper.find('.button-icon__label').exists()).toBe(false)
  })
})

describe('ButtonIcon class modifiers', () => {
  it('applies square class', () => {
    const wrapper = shallowMount(ButtonIcon, {
      props: { square: true },
      global: { stubs },
    })
    expect(wrapper.classes()).toContain('button-icon--square')
  })

  it('applies loading class', () => {
    const wrapper = shallowMount(ButtonIcon, {
      props: { loading: true },
      global: { stubs },
    })
    expect(wrapper.classes()).toContain('button-icon--loading')
  })

  it('applies truncate class', () => {
    const wrapper = shallowMount(ButtonIcon, {
      props: { truncate: true },
      global: { stubs },
    })
    expect(wrapper.classes()).toContain('button-icon--truncate')
  })
})

describe('ButtonIcon loading state', () => {
  it('shows loading text when loading', () => {
    const wrapper = shallowMount(ButtonIcon, {
      props: { label: 'Submit', loading: true, loadingText: 'Saving...' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Saving...')
  })
})
