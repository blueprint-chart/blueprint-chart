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
    await wrapper.find('button.gallery-card__meta__title').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('is not itself a button and nests no buttons', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
      slots: { actions: '<button class="act">Edit</button>' },
    })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.element.querySelectorAll('button button')).toHaveLength(0)
  })

  it('does not emit click when Enter is pressed on an action', async () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'My Chart' },
      slots: { actions: '<button class="act">Edit</button>' },
    })
    await wrapper.find('.act').trigger('keydown.enter')
    expect(wrapper.emitted('click')).toBeUndefined()
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

  it('renders the title in the body font, never the display serif', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'Offshore flows', layout: 'grid' },
      attrs: { serifTitle: true },
    })
    expect(wrapper.find('.gallery-card__meta__title').classes()).not.toContain('bc-display')
  })
})

describe('GalleryCard #thumb slot', () => {
  it('renders the thumb slot instead of the image', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'X', thumbSrc: 'data:image/svg+xml,x' },
      slots: { thumb: '<div class="probe" />' },
    })
    expect(wrapper.find('.gallery-card__thumb .probe').exists()).toBe(true)
    expect(wrapper.find('.gallery-card__thumb__img').exists()).toBe(false)
  })

  it('adds the slotted modifier', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'X' },
      slots: { thumb: '<div class="probe" />' },
    })
    expect(wrapper.find('.gallery-card__thumb').classes()).toContain('gallery-card__thumb--slotted')
  })

  it('keeps the image when no slot is given', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'X', thumbSrc: 'data:image/svg+xml,x' } })
    expect(wrapper.find('.gallery-card__thumb__img').exists()).toBe(true)
    expect(wrapper.find('.gallery-card__thumb').classes()).not.toContain('gallery-card__thumb--slotted')
  })
})

describe('GalleryCard #status slot', () => {
  it('renders status slot content on the thumbnail', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'X' },
      slots: { status: '<span class="probe">●</span>' },
    })
    expect(wrapper.find('.gallery-card__thumb__status .probe').exists()).toBe(true)
  })

  it('omits the status container when no slot is provided', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'X' } })
    expect(wrapper.find('.gallery-card__thumb__status').exists()).toBe(false)
  })
})

describe('GalleryCard loading states', () => {
  it('renders skeleton lines and no real meta when loading', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'Real title', loading: true } })
    expect(wrapper.classes()).toContain('gallery-card--loading')
    expect(wrapper.findAll('.feedback-skeleton').length).toBeGreaterThanOrEqual(3)
    expect(wrapper.text()).not.toContain('Real title')
  })

  it('is not interactive while loading', async () => {
    const wrapper = mount(GalleryCard, { props: { title: '', loading: true } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('shows a thumb skeleton when thumbLoading and no thumbSrc', () => {
    const wrapper = mount(GalleryCard, { props: { title: 'T', thumbLoading: true } })
    expect(wrapper.find('.gallery-card__thumb__skeleton').exists()).toBe(true)
    expect(wrapper.text()).toContain('T') // meta still real
  })

  it('prefers the real image once thumbSrc is present', () => {
    const wrapper = mount(GalleryCard, {
      props: { title: 'T', thumbLoading: true, thumbSrc: 'data:image/svg+xml,x' },
    })
    expect(wrapper.find('.gallery-card__thumb__skeleton').exists()).toBe(false)
    expect(wrapper.find('.gallery-card__thumb__img').exists()).toBe(true)
  })

  it('emits click normally when not loading', async () => {
    const wrapper = mount(GalleryCard, { props: { title: 'T' } })
    await wrapper.find('button.gallery-card__meta__title').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
