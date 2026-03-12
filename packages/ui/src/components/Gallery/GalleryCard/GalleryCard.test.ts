import { mount } from '@vue/test-utils'
import GalleryCard from './GalleryCard.vue'

describe('GalleryCard', () => {
  it('renders title', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__title').text()).toBe('My Chart')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart', subtitle: 'Description' } })
    expect(wrapper.find('.gallery-card__subtitle').text()).toBe('Description')
  })

  it('hides subtitle when not provided', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__subtitle').exists()).toBe(false)
  })

  it('applies selected class', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart', selected: true } })
    expect(wrapper.classes()).toContain('gallery-card--selected')
  })

  it('applies row layout class', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart', layout: 'row' } })
    expect(wrapper.classes()).toContain('gallery-card--row')
  })

  it('emits click on click', async () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits click on Enter key', async () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    await wrapper.trigger('keydown.enter')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('renders thumb image when thumbSrc is provided', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart', thumbSrc: 'data:image/svg+xml;base64,abc' },
    })
    const img = wrapper.find('.gallery-card__thumb-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/svg+xml;base64,abc')
  })

  it('hides thumb image when thumbSrc is not provided', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
    })
    expect(wrapper.find('.gallery-card__thumb-img').exists()).toBe(false)
  })

  it('renders footer slot', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
      slots: { footer: '<span>footer</span>' },
    })
    expect(wrapper.find('.gallery-card__footer').text()).toBe('footer')
  })

  it('hides footer when slot is empty', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__footer').exists()).toBe(false)
  })
})
