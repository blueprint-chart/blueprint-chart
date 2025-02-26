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
})
