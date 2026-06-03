import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { BDropdownItem, BDropdownText } from 'bootstrap-vue-next'
import AccountMenu from './AccountMenu.vue'
import AccountAvatar from './AccountAvatar.vue'
import AccountSignInModal from './AccountSignInModal.vue'
import { useAccountStore } from '@/stores/account'

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/charts', component: { template: '<div />' } }],
  })
}

async function mountMenu(signedIn: boolean) {
  const router = makeRouter()
  await router.push('/charts')
  await router.isReady()
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      account: { user: signedIn ? { id: '1', email: 'hello@pirhoo.com' } : null },
    },
  })
  // The dropdown menu teleports to <body> (teleport-to="body" in AccountMenu.vue),
  // so attachTo: document.body must stay in sync — the teleported header/items are
  // only queryable through the wrapper when the component is attached to the document.
  const wrapper = mount(AccountMenu, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router],
      stubs: { 'router-link': RouterLinkStub },
    },
  })
  return { wrapper, router }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('AccountMenu (signed in)', () => {
  it('renders an avatar in the toggle with an accessible name carrying the email', async () => {
    const { wrapper } = await mountMenu(true)
    const toggle = wrapper.find('.dropdown-toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.findComponent(AccountAvatar).exists()).toBe(true)
    expect(toggle.text()).toContain('hello@pirhoo.com')
  })

  it('renders a "Signed in as" header with the email', async () => {
    const { wrapper } = await mountMenu(true)
    const header = wrapper.findComponent(BDropdownText)
    expect(header.text()).toContain('Signed in as')
    expect(header.text()).toContain('hello@pirhoo.com')
  })

  it('renders exactly two menu items: My charts and Sign out', async () => {
    const { wrapper } = await mountMenu(true)
    const items = wrapper.findAllComponents(BDropdownItem)
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('My charts')
    expect(items[1].text()).toContain('Sign out')
  })

  it('navigates to /charts when My charts is clicked', async () => {
    const { wrapper, router } = await mountMenu(true)
    const push = vi.spyOn(router, 'push')
    // BDropdownItem renders an inner <a> or <button>; trigger on that element so the
    // test fails loudly if that inner element ever disappears.
    const link = wrapper.findAllComponents(BDropdownItem)[0].find('a, button')
    expect(link.exists()).toBe(true)
    await link.trigger('click')
    expect(push).toHaveBeenCalledWith('/charts')
  })

  it('calls signOut and redirects to /charts when Sign out is clicked', async () => {
    const { wrapper, router } = await mountMenu(true)
    const store = useAccountStore()
    const push = vi.spyOn(router, 'push')
    // BDropdownItem renders an inner <a> or <button>; trigger on that element so the
    // test fails loudly if that inner element ever disappears.
    const link = wrapper.findAllComponents(BDropdownItem)[1].find('a, button')
    expect(link.exists()).toBe(true)
    await link.trigger('click')
    // onSignOut awaits signOut() then pushes '/charts'; flush so the post-await push runs.
    await flushPromises()
    expect(store.signOut).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/charts')
  })
})

describe('AccountMenu (signed out)', () => {
  it('renders a primary Sign in button and no dropdown', async () => {
    const { wrapper } = await mountMenu(false)
    expect(wrapper.find('.dropdown-toggle').exists()).toBe(false)
    const btn = wrapper.find('button.btn-primary')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Sign in')
  })

  it('opens the sign-in modal when the Sign in button is clicked', async () => {
    const { wrapper } = await mountMenu(false)
    expect(wrapper.findComponent(AccountSignInModal).props('open')).toBe(false)
    await wrapper.find('button.btn-primary').trigger('click')
    expect(wrapper.findComponent(AccountSignInModal).props('open')).toBe(true)
  })
})

describe('AccountMenu (session init)', () => {
  // Locks the "AccountMenu owns init()" contract: the navbar no longer calls it,
  // so the component must trigger the (memoized) session restore on mount.
  it('triggers store.init on mount', async () => {
    await mountMenu(false)
    const store = useAccountStore()
    expect(store.init).toHaveBeenCalled()
  })
})
