import { mount } from '@vue/test-utils'
import DashboardDetailPreview from './DashboardDetailPreview.vue'

describe('DashboardDetailPreview', () => {
  it('renders the image when src is present', () => {
    const wrapper = mount(DashboardDetailPreview, { props: { src: 'data:image/svg+xml,x' } })
    expect(wrapper.find('.dashboard-detail-preview__img').exists()).toBe(true)
    expect(wrapper.find('.feedback-skeleton').exists()).toBe(false)
  })

  it('renders a skeleton when loading and no src', () => {
    const wrapper = mount(DashboardDetailPreview, { props: { loading: true } })
    expect(wrapper.find('.feedback-skeleton').exists()).toBe(true)
    expect(wrapper.find('.dashboard-detail-preview__img').exists()).toBe(false)
  })

  it('renders nothing when neither src nor loading', () => {
    const wrapper = mount(DashboardDetailPreview, { props: {} })
    expect(wrapper.find('.dashboard-detail-preview').exists()).toBe(false)
  })
})
