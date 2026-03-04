import { mount } from '@vue/test-utils'
import SceneTimelineItem from './SceneTimelineItem.vue'

describe('SceneTimelineItem', () => {
  it('renders scene label with index', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 2 },
    })
    expect(wrapper.find('.scene-timeline-item__label').text()).toBe('Scene 3')
  })

  it('renders scene name when provided', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: 'Intro', index: 0 },
    })
    expect(wrapper.find('.scene-timeline-item__name').text()).toBe('Intro')
  })

  it('does not render name element when name is null', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0 },
    })
    expect(wrapper.find('.scene-timeline-item__name').exists()).toBe(false)
  })

  it('renders thumbnail SVG when provided', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0, thumbnail: '<svg viewBox="0 0 600 400"><rect fill="red"/></svg>' },
    })
    expect(wrapper.find('.scene-timeline-item__preview').html()).toContain('<svg')
  })

  it('shows empty preview when no thumbnail', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0 },
    })
    const preview = wrapper.find('.scene-timeline-item__preview')
    expect(preview.exists()).toBe(true)
    expect(preview.html()).not.toContain('<svg')
  })

  it('applies active class when active', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0, active: true },
    })
    expect(wrapper.classes()).toContain('scene-timeline-item--active')
  })

  it('does not apply active class by default', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0 },
    })
    expect(wrapper.classes()).not.toContain('scene-timeline-item--active')
  })

  it('emits select on click', async () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0 },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('emits remove when close button is clicked', async () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0, removable: true },
    })
    await wrapper.find('.scene-timeline-item__remove').trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('hides remove button when removable is false', () => {
    const wrapper = mount(SceneTimelineItem, {
      props: { name: null, index: 0, removable: false },
    })
    expect(wrapper.find('.scene-timeline-item__remove').exists()).toBe(false)
  })
})
