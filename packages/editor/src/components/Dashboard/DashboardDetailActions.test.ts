import { mount } from '@vue/test-utils'
import DashboardDetailActions from './DashboardDetailActions.vue'

// Stub BModal so its slot renders only when open (model-value true), mirroring
// real modal visibility — lets us assert the confirm button appears only after
// the Delete row is clicked.
const bmodalStub = { props: ['modelValue'], template: '<div v-if="modelValue"><slot /></div>' }

describe('DashboardDetailActions', () => {
  it('does not emit delete until the confirmation modal is accepted', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'synced' as const },
      global: { stubs: { BModal: bmodalStub } },
    })
    // Modal closed initially → confirm button not rendered.
    expect(wrapper.find('[data-test="confirm-delete"]').exists()).toBe(false)

    await wrapper.find('[data-test="delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(wrapper.find('[data-test="confirm-delete"]').exists()).toBe(true)

    await wrapper.find('[data-test="confirm-delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('cancelling the confirmation emits nothing and closes the modal', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'local' as const },
      global: { stubs: { BModal: bmodalStub } },
    })
    await wrapper.find('[data-test="delete"]').trigger('click')
    await wrapper.find('[data-test="cancel-delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(wrapper.find('[data-test="confirm-delete"]').exists()).toBe(false)
  })

  it('shows device-scoped wording for a local-only chart', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'local' as const },
      global: { stubs: { BModal: bmodalStub } },
    })
    await wrapper.find('[data-test="delete"]').trigger('click')
    expect(wrapper.text()).toContain('this device')
  })

  it('shows account-scoped wording for a synced chart', async () => {
    const wrapper = mount(DashboardDetailActions, {
      props: { syncState: 'synced' as const },
      global: { stubs: { BModal: bmodalStub } },
    })
    await wrapper.find('[data-test="delete"]').trigger('click')
    expect(wrapper.text()).toContain('every device')
  })
})
