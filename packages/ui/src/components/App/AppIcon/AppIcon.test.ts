import { shallowMount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import AppIcon from './AppIcon.vue'

const MockIcon = defineComponent({
  name: 'MockIcon',
  render() {
    return h('svg', { class: 'mock-icon' })
  },
})

describe('AppIcon', () => {
  it('renders the app-icon class', () => {
    const wrapper = shallowMount(AppIcon)
    expect(wrapper.classes()).toContain('app-icon')
  })

  it('renders slot content', () => {
    const wrapper = shallowMount(AppIcon, {
      slots: { default: '<svg class="test-icon"></svg>' },
    })
    expect(wrapper.find('.test-icon').exists()).toBe(true)
  })

  it('renders icon from name prop', () => {
    const wrapper = shallowMount(AppIcon, {
      props: { name: MockIcon },
    })
    expect(wrapper.findComponent(MockIcon).exists()).toBe(true)
  })

  describe('preset sizes', () => {
    const presetSizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']

    presetSizes.forEach((size) => {
      it(`applies app-icon--size-${size} class for size="${size}"`, () => {
        const wrapper = shallowMount(AppIcon, { props: { size } })
        expect(wrapper.classes()).toContain(`app-icon--size-${size}`)
        expect(wrapper.classes()).toContain('app-icon--has-size')
      })
    })
  })

  describe('raw CSS sizes', () => {
    it('applies app-icon--raw-size class for pixel size', () => {
      const wrapper = shallowMount(AppIcon, { props: { size: '24px' } })
      expect(wrapper.classes()).toContain('app-icon--raw-size')
      expect(wrapper.attributes('style')).toContain('--app-icon-raw-size: 24px')
    })

    it('applies app-icon--raw-size class for rem size', () => {
      const wrapper = shallowMount(AppIcon, { props: { size: '1.5rem' } })
      expect(wrapper.classes()).toContain('app-icon--raw-size')
      expect(wrapper.attributes('style')).toContain('--app-icon-raw-size: 1.5rem')
    })
  })

  describe('percentage sizes', () => {
    it('applies app-icon--percent-size class', () => {
      const wrapper = shallowMount(AppIcon, { props: { size: '50%' } })
      expect(wrapper.classes()).toContain('app-icon--percent-size')
      expect(wrapper.classes()).not.toContain('app-icon--raw-size')
      expect(wrapper.attributes('style')).toContain('--app-icon-percent-size: 50%')
    })
  })

  describe('color variants', () => {
    it('sets --app-icon-color for variant prop', () => {
      const wrapper = shallowMount(AppIcon, { props: { variant: 'primary' } })
      expect(wrapper.attributes('style')).toContain('--app-icon-color: var(--bs-primary, currentColor)')
    })

    it('applies hover variant color when hover is true', () => {
      const wrapper = shallowMount(AppIcon, {
        props: { variant: 'primary', hoverVariant: 'danger', hover: true },
      })
      expect(wrapper.attributes('style')).toContain('--app-icon-color: var(--bs-danger')
    })
  })

  describe('animations', () => {
    it('applies app-icon--spin class', () => {
      const wrapper = shallowMount(AppIcon, { props: { spin: true } })
      expect(wrapper.classes()).toContain('app-icon--spin')
    })

    it('applies app-icon--spin-reverse class', () => {
      const wrapper = shallowMount(AppIcon, { props: { spinReverse: true } })
      expect(wrapper.classes()).toContain('app-icon--spin-reverse')
    })

    it('applies app-icon--beat class', () => {
      const wrapper = shallowMount(AppIcon, { props: { beat: true } })
      expect(wrapper.classes()).toContain('app-icon--beat')
    })

    it('applies app-icon--fade class', () => {
      const wrapper = shallowMount(AppIcon, { props: { fade: true } })
      expect(wrapper.classes()).toContain('app-icon--fade')
    })

    it('sets custom spin duration', () => {
      const wrapper = shallowMount(AppIcon, { props: { spin: true, spinDuration: '2s' } })
      expect(wrapper.attributes('style')).toContain('--app-icon-spin-duration: 2s')
    })
  })

  describe('scale', () => {
    it('sets --app-icon-scale CSS variable', () => {
      const wrapper = shallowMount(AppIcon, { props: { scale: 2 } })
      expect(wrapper.attributes('style')).toContain('--app-icon-scale: 2')
    })

    it('defaults scale to 1', () => {
      const wrapper = shallowMount(AppIcon)
      expect(wrapper.attributes('style')).toContain('--app-icon-scale: 1')
    })
  })

  describe('mouse events', () => {
    it('sets hover state on mouseenter', async () => {
      const wrapper = shallowMount(AppIcon, { props: { hoverVariant: 'danger' } })
      expect(wrapper.classes()).not.toContain('app-icon--hover')
      await wrapper.trigger('mouseenter')
      expect(wrapper.classes()).toContain('app-icon--hover')
    })

    it('clears hover state on mouseleave', async () => {
      const wrapper = shallowMount(AppIcon, { props: { hoverVariant: 'danger' } })
      await wrapper.trigger('mouseenter')
      await wrapper.trigger('mouseleave')
      expect(wrapper.classes()).not.toContain('app-icon--hover')
    })

    it('keeps hover state on mouseleave when hover prop is true', async () => {
      const wrapper = shallowMount(AppIcon, {
        props: { hover: true, hoverVariant: 'danger' },
      })
      await wrapper.trigger('mouseenter')
      await wrapper.trigger('mouseleave')
      expect(wrapper.classes()).toContain('app-icon--hover')
    })
  })
})
