import { mount } from '@vue/test-utils'
import DashboardDetailPreview from './DashboardDetailPreview.vue'

describe('DashboardDetailPreview', () => {
  it('renders the live thumbnail when a DSL is present', () => {
    const wrapper = mount(DashboardDetailPreview, {
      props: { dsl: 'chart bar {}' },
      global: { stubs: { ChartThumbnail: true } },
    })
    expect(wrapper.findComponent({ name: 'ChartThumbnail' }).props('dsl')).toBe('chart bar {}')
    expect(wrapper.find('.feedback-skeleton').exists()).toBe(false)
  })

  it('renders a skeleton when loading and no DSL', () => {
    const wrapper = mount(DashboardDetailPreview, { props: { loading: true } })
    expect(wrapper.find('.feedback-skeleton').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ChartThumbnail' }).exists()).toBe(false)
  })

  it('renders nothing when neither DSL nor loading', () => {
    const wrapper = mount(DashboardDetailPreview, { props: {} })
    expect(wrapper.find('.dashboard-detail-preview').exists()).toBe(false)
  })
})
