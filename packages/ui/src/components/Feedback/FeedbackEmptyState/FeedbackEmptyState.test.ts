import { mount } from '@vue/test-utils'
import EmptyState from './FeedbackEmptyState.vue'

describe('EmptyState', () => {
  it('renders message prop', () => {
    const wrapper = mount(EmptyState, { props: { message: 'No items found' } })
    expect(wrapper.find('.feedback-empty-state__message').text()).toBe('No items found')
  })

  it('slot content overrides message prop', () => {
    const wrapper = mount(EmptyState, {
      props: { message: 'No items found' },
      slots: { default: 'Custom empty text' },
    })
    expect(wrapper.find('.feedback-empty-state__message').text()).toBe('Custom empty text')
  })

  it('renders the title prop and icon slot', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No items yet', message: 'Add one' },
      slots: { icon: '<svg class="icon" />' },
    })
    expect(wrapper.find('.feedback-empty-state__title').text()).toBe('No items yet')
    expect(wrapper.find('.feedback-empty-state__icon .icon').exists()).toBe(true)
  })

  it('renders no title or icon when not given', () => {
    const wrapper = mount(EmptyState, { props: { message: 'No items found' } })
    expect(wrapper.find('.feedback-empty-state__title').exists()).toBe(false)
    expect(wrapper.find('.feedback-empty-state__icon').exists()).toBe(false)
  })

  it('renders the actions slot below the message', () => {
    const wrapper = mount(EmptyState, {
      props: { message: 'No items found' },
      slots: { actions: '<a class="action">Add</a>' },
    })
    expect(wrapper.find('.feedback-empty-state__message + .feedback-empty-state__actions .action').exists()).toBe(true)
  })

  it('renders the title as a heading', () => {
    const wrapper = mount(EmptyState, { props: { title: 'No items yet' } })
    expect(wrapper.find('h2.feedback-empty-state__title').exists()).toBe(true)
  })

  it('renders no message paragraph without a message or default slot', () => {
    const wrapper = mount(EmptyState, { props: { title: 'No items yet' } })
    expect(wrapper.find('.feedback-empty-state__message').exists()).toBe(false)
  })
})
