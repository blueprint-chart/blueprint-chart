import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import AccountSignInModal from './AccountSignInModal.vue'
import { useAccountStore } from '@/stores/account'

describe('AccountSignInModal', () => {
  it('calls signInWithEmail with the entered address on submit', async () => {
    const wrapper = mount(AccountSignInModal, {
      props: { open: true },
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
        stubs: { BModal: { template: '<div><slot /></div>' } },
      },
    })
    const store = useAccountStore()
    store.signInWithEmail = vi.fn().mockResolvedValue(undefined)

    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('form').trigger('submit.prevent')

    expect(store.signInWithEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('shows the confirmation message once a link is sent', async () => {
    const wrapper = mount(AccountSignInModal, {
      props: { open: true },
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
        stubs: { BModal: { template: '<div><slot /></div>' } },
      },
    })
    const store = useAccountStore()
    store.status = 'link-sent'
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Check your inbox')
  })
})
