import { mount } from '@vue/test-utils'
import DashboardDetailActions from './DashboardDetailActions.vue'

describe('DashboardDetailActions', () => {
  it('does not emit delete until the confirmation is accepted', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'synced' as const },
      global: { stubs: { DashboardActionRow: false } },
    })
    // Click the Delete row → confirmation appears, no emit yet.
    await wrapper.find('[data-test="delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(wrapper.find('[data-test="confirm-delete"]').exists()).toBe(true)

    await wrapper.find('[data-test="confirm-delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('cancelling the confirmation emits nothing', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'local' as const },
      global: { stubs: { DashboardActionRow: false } },
    })
    await wrapper.find('[data-test="delete"]').trigger('click')
    await wrapper.find('[data-test="cancel-delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(wrapper.find('[data-test="confirm-delete"]').exists()).toBe(false)
  })

  it('shows device-scoped wording for a local-only chart', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'local' as const },
      global: { stubs: { DashboardActionRow: false } },
    })
    await wrapper.find('[data-test="delete"]').trigger('click')
    expect(wrapper.text()).toContain('this device')
  })

  it('shows account-scoped wording for a synced chart', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'synced' as const },
      global: { stubs: { DashboardActionRow: false } },
    })
    await wrapper.find('[data-test="delete"]').trigger('click')
    expect(wrapper.text()).toContain('every device')
  })
})
