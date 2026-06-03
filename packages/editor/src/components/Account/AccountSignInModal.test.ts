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

  it('resets status when the modal opens', async () => {
    const wrapper = mount(AccountSignInModal, {
      props: { open: false },
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
        stubs: { BModal: { template: '<div><slot /></div>' } },
      },
    })
    const store = useAccountStore()
    store.resetStatus = vi.fn()

    await wrapper.setProps({ open: true })

    expect(store.resetStatus).toHaveBeenCalledTimes(1)
  })

  it('renders the branded headline, both benefit rows, and refined form copy', () => {
    const wrapper = mount(AccountSignInModal, {
      props: { open: true },
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
        stubs: { BModal: { template: '<div><slot /></div>' } },
      },
    })
    const text = wrapper.text()
    expect(text).toContain('Keep your charts in sync')
    expect(text).toContain('Your work, safe and ready wherever you sign in.')
    expect(text).toContain('Charts save to the cloud as you edit')
    expect(text).toContain('Open your full library from any device')
    expect(text).toContain('No password required. The link arrives in seconds.')
    expect(wrapper.find('button[type="submit"]').text()).toContain('Email me a magic link')
    expect(wrapper.find('input[type="email"]').attributes('placeholder')).toBe('you@example.com')
  })
})
