import { mount } from '@vue/test-utils'
import DashboardToolbar from './DashboardToolbar.vue'

function mountToolbar(empty: boolean) {
  return mount(DashboardToolbar, {
    props: { chartCount: 0, sortValue: 'date-desc', layout: 'grid', localOnlyCount: 0, syncingAll: false, empty },
    global: { stubs: { LayoutBreadcrumb: true, DashboardSyncPill: true } },
  })
}

describe('DashboardToolbar', () => {
  it('renders the view, sort and new chart controls', () => {
    const wrapper = mountToolbar(false)
    expect(wrapper.find('.layout-page-header__end').element.children.length).toBeGreaterThan(0)
  })

  it('leaves the end slot empty when there are no charts', () => {
    const wrapper = mountToolbar(true)
    expect(wrapper.find('.layout-page-header__end').element.children.length).toBe(0)
  })
})
