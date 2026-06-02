import { mount } from '@vue/test-utils'
import DashboardSyncPill from './DashboardSyncPill.vue'

describe('DashboardSyncPill', () => {
  it('renders nothing when there are no local-only charts', () => {
    const wrapper = mount(DashboardSyncPill, { props: { count: 0, syncing: false } })
    expect(wrapper.find('.dashboard-sync-pill').exists()).toBe(false)
  })

  it('shows singular label and "Back up" for one local chart', () => {
    const wrapper = mount(DashboardSyncPill, { props: { count: 1, syncing: false } })
    expect(wrapper.text()).toContain('1 on this device')
    expect(wrapper.find('.dashboard-sync-pill__btn').text()).toBe('Back up')
  })

  it('shows "Back up all" when several charts are local', () => {
    const wrapper = mount(DashboardSyncPill, { props: { count: 3, syncing: false } })
    expect(wrapper.text()).toContain('3 on this device')
    expect(wrapper.find('.dashboard-sync-pill__btn').text()).toBe('Back up all')
  })

  it('emits sync when the button is clicked', async () => {
    const wrapper = mount(DashboardSyncPill, { props: { count: 1, syncing: false } })
    await wrapper.find('.dashboard-sync-pill__btn').trigger('click')
    expect(wrapper.emitted('sync')).toHaveLength(1)
  })

  it('shows a busy state and hides the button while syncing', () => {
    const wrapper = mount(DashboardSyncPill, { props: { count: 2, syncing: true } })
    expect(wrapper.text()).toContain('Backing up…')
    expect(wrapper.find('.dashboard-sync-pill__btn').exists()).toBe(false)
  })
})
