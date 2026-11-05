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

describe('ButtonIcon lazy tooltip', () => {
  const props = { label: 'Edit', hideLabel: true }
  const stubs = {
    BButton: { template: '<button><slot /></button>' },
    BTooltip: { name: 'BTooltip', props: ['target', 'title', 'delay', 'placement', 'boundaryPadding', 'teleportTo'], template: '<span />' },
  }

  it('does not mount the tooltip before any interaction', () => {
    const wrapper = shallowMount(ButtonIcon, { props, global: { stubs } })
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(false)
  })

  it('mounts the tooltip on first hover', async () => {
    const wrapper = shallowMount(ButtonIcon, { props, global: { stubs } })
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(false)
    await wrapper.trigger('mouseenter')
    expect(wrapper.findComponent({ name: 'BTooltip' }).props()).toMatchObject({ placement: 'top', delay: { show: 0, hide: 0 }, title: 'Edit' })
  })

  it('mounts the tooltip on first focus', async () => {
    const wrapper = shallowMount(ButtonIcon, { props, global: { stubs } })
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(false)
    await wrapper.trigger('focus')
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(true)
  })

  it('never mounts it with hideTooltip', async () => {
    const wrapper = shallowMount(ButtonIcon, { props: { ...props, hideTooltip: true }, global: { stubs } })
    await wrapper.trigger('mouseenter')
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(false)
  })
})
