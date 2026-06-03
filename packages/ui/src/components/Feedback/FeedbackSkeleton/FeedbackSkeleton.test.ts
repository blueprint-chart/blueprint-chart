import { mount } from '@vue/test-utils'
import FeedbackSkeleton from './FeedbackSkeleton.vue'

describe('FeedbackSkeleton', () => {
  it('renders an aria-hidden block with the given dimensions', () => {
    const wrapper = mount(FeedbackSkeleton, { props: { width: '120px', height: '8px' } })
    const el = wrapper.find('.feedback-skeleton')
    expect(el.exists()).toBe(true)
    expect(el.attributes('aria-hidden')).toBe('true')
    expect(el.attributes('style')).toContain('width: 120px')
    expect(el.attributes('style')).toContain('height: 8px')
  })

  it('is animated by default and can be turned off', () => {
    expect(mount(FeedbackSkeleton).classes()).toContain('feedback-skeleton--animated')
    const off = mount(FeedbackSkeleton, { props: { animated: false } })
    expect(off.classes()).not.toContain('feedback-skeleton--animated')
  })

  it('renders a circle when circle is set', () => {
    const wrapper = mount(FeedbackSkeleton, { props: { circle: true } })
    expect(wrapper.classes()).toContain('feedback-skeleton--circle')
    expect(wrapper.attributes('style')).toContain('border-radius: 50%')
  })
})
