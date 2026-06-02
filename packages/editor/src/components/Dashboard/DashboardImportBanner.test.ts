import { mount } from '@vue/test-utils'
import DashboardImportBanner from './DashboardImportBanner.vue'

describe('DashboardImportBanner', () => {
  it('renders sync wording and emits sync on click', async () => {
    const wrapper = mount(DashboardImportBanner, { props: { count: 3, syncing: false } })
    expect(wrapper.text()).toContain('Sync')
    await wrapper.find('button.btn-primary').trigger('click')
    expect(wrapper.emitted('sync')).toHaveLength(1)
  })

  it('renders nothing when there are no local-only charts', () => {
    const wrapper = mount(DashboardImportBanner, { props: { count: 0, syncing: false } })
    expect(wrapper.find('.dashboard-import-banner').exists()).toBe(false)
  })
})
