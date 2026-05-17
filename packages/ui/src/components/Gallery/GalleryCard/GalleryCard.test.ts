import { mount } from '@vue/test-utils'
import GalleryCard from './GalleryCard.vue'

describe('GalleryCard', () => {
  it('renders title', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__meta__title').text()).toBe('My Chart')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart', subtitle: 'Description' } })
    expect(wrapper.find('.gallery-card__meta__subtitle').text()).toBe('Description')
  })

  it('hides subtitle when not provided', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__meta__subtitle').exists()).toBe(false)
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
    const img = wrapper.find('.gallery-card__thumb__img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('data:image/svg+xml;base64,abc')
  })

  it('hides thumb image when thumbSrc is not provided', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
    })
    expect(wrapper.find('.gallery-card__thumb__img').exists()).toBe(false)
  })

  it('renders footer slot', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
      slots: { footer: '<span>footer</span>' },
    })
    expect(wrapper.find('.gallery-card__meta__footer').text()).toBe('footer')
  })

  it('hides footer when slot is empty', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__meta__footer').exists()).toBe(false)
  })

  it('renders actions slot inside thumb area', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
      slots: { actions: '<button class="edit-btn">Edit</button>' },
    })
    const overlay = wrapper.find('.gallery-card__thumb__actions')
    expect(overlay.exists()).toBe(true)
    expect(overlay.find('.edit-btn').text()).toBe('Edit')
  })

  it('hides actions overlay when slot is empty', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'My Chart' } })
    expect(wrapper.find('.gallery-card__thumb__actions').exists()).toBe(false)
  })

  it('renders subtitle below title in row layout', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart', subtitle: 'Description text', layout: 'row' },
    })
    const meta = wrapper.find('.gallery-card__meta')
    const title = meta.find('.gallery-card__meta__title')
    const subtitle = meta.find('.gallery-card__meta__subtitle')
    expect(title.exists()).toBe(true)
    expect(subtitle.exists()).toBe(true)
    // In row mode, subtitle should come after title in DOM (stacked, not side-by-side)
    const children = meta.element.children
    const titleIdx = Array.from(children).indexOf(title.element)
    const subtitleIdx = Array.from(children).indexOf(subtitle.element)
    expect(subtitleIdx).toBeGreaterThan(titleIdx)
  })

  it('actions click does not bubble to card click', async () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
      slots: { actions: '<button class="edit-btn">Edit</button>' },
    })
    await wrapper.find('.gallery-card__thumb__actions').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies the bc-display class to the title when serifTitle is true', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'Offshore flows', serifTitle: true, layout: 'grid' },
    })
    expect(wrapper.find('.gallery-card__meta__title').classes()).toContain('bc-display')
  })

  it('does not apply bc-display when serifTitle is false (default)', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'Offshore flows', layout: 'grid' },
    })
    expect(wrapper.find('.gallery-card__meta__title').classes()).not.toContain('bc-display')
  })
})
