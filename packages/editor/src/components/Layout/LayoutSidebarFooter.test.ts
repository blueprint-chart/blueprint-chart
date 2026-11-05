import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutSidebarFooter from './LayoutSidebarFooter.vue'
import { useAccountStore } from '@/stores/account'
import { useThemeStore } from '@/stores/theme'

const accountsOn = vi.hoisted(() => ({ value: true }))

vi.mock('@/config/runtimeConfig', async (orig) => {
  const actual = await orig<typeof import('@/config/runtimeConfig')>()
  return { ...actual, accountsEnabled: () => accountsOn.value }
})

const mounted: Array<{ unmount: () => void }> = []

beforeEach(() => {
  accountsOn.value = true
})

async function mountFooter(signedIn: boolean) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/charts', component: { template: '<div />' } }],
  })
  await router.push('/charts')
  await router.isReady()
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      account: { user: signedIn ? { id: '1', email: 'hello@pirhoo.com' } : null },
      theme: { theme: 'light' },
    },
  })
  const wrapper = mount(LayoutSidebarFooter, {
    attachTo: document.body,
    global: {
      stubs: { 'router-link': RouterLinkStub, 'AccountSignInModal': true },
      plugins: [pinia, router],
    },
  })
  mounted.push(wrapper)
  return { wrapper, router }
}

async function openMenu(wrapper: Awaited<ReturnType<typeof mountFooter>>['wrapper']) {
  await wrapper.find('button[aria-label="More options"]').trigger('click')
  await flushPromises()
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('LayoutSidebarFooter (signed in)', () => {
  it('shows the avatar alone, without a name', async () => {
    const { wrapper } = await mountFooter(true)
    expect(wrapper.find('.layout-sidebar-footer__identity .account-avatar').exists()).toBe(true)
    expect(wrapper.find('.layout-sidebar-footer__identity').text()).toBe('H')
  })

  it('lists the email, My charts and Sign out in the menu', async () => {
    const { wrapper } = await mountFooter(true)
    await openMenu(wrapper)
    const text = document.body.textContent ?? ''
    expect(text).toContain('hello@pirhoo.com')
    expect(text).toContain('My charts')
    expect(text).toContain('Sign out')
  })

  it('groups the menu: identity, navigation, theme, sign out', async () => {
    const { wrapper } = await mountFooter(true)
    await openMenu(wrapper)
    const menu = document.body.querySelector('.layout-sidebar-footer__menu') as HTMLElement
    const sections = [...menu.children].map((child) => {
      if (child.querySelector('hr, .dropdown-divider') || child.matches('hr, .dropdown-divider')) {
        return 'divider'
      }
      if (child.querySelector('.layout-sidebar-footer__menu__header')) {
        return 'identity'
      }
      if (child.matches('.layout-sidebar-footer__theme')) {
        return 'theme'
      }
      return child.textContent?.trim()
    })
    expect(sections).toEqual(['identity', 'divider', 'My charts', 'divider', 'theme', 'divider', 'Sign out'])
  })

  it('shows the full email with an avatar in the menu header', async () => {
    const { wrapper } = await mountFooter(true)
    await openMenu(wrapper)
    const header = document.body.querySelector('.layout-sidebar-footer__menu__header') as HTMLElement
    expect(header.querySelector('.account-avatar')).not.toBeNull()
    expect(header.querySelector('.layout-sidebar-footer__menu__header__email')?.textContent).toBe('hello@pirhoo.com')
  })

  it('signs out from the menu', async () => {
    const { wrapper } = await mountFooter(true)
    const store = useAccountStore()
    const signOut = vi.spyOn(store, 'signOut').mockResolvedValue()
    await openMenu(wrapper)
    const item = [...document.body.querySelectorAll('.dropdown-item')].find(el => el.textContent?.includes('Sign out')) as HTMLElement
    item.click()
    await flushPromises()
    expect(signOut).toHaveBeenCalled()
  })
})

describe('LayoutSidebarFooter (theme)', () => {
  it('offers system, light and dark in the menu and marks the current one', async () => {
    const { wrapper } = await mountFooter(true)
    await openMenu(wrapper)
    const options = [...document.body.querySelectorAll('.layout-sidebar-footer__theme button')]
    expect(options.map(o => o.getAttribute('aria-label'))).toEqual(['System', 'Light', 'Dark'])
    expect(options[1].getAttribute('aria-current')).toBe('true')
  })

  it('switches the theme when an option is picked', async () => {
    const { wrapper } = await mountFooter(true)
    await openMenu(wrapper)
    const dark = document.body.querySelector('.layout-sidebar-footer__theme button[aria-label="Dark"]') as HTMLElement
    dark.click()
    await flushPromises()
    expect(useThemeStore().theme).toBe('dark')
  })
})

describe('LayoutSidebarFooter (signed out)', () => {
  it('shows a Sign in button and keeps the theme menu', async () => {
    const { wrapper } = await mountFooter(false)
    expect(wrapper.find('button.btn-strong').text()).toContain('Sign in')
    await openMenu(wrapper)
    expect(document.body.querySelector('.layout-sidebar-footer__theme')).not.toBeNull()
    expect(document.body.textContent).not.toContain('Sign out')
  })

  it('hides Sign in when accounts are disabled', async () => {
    accountsOn.value = false
    const { wrapper } = await mountFooter(false)
    expect(wrapper.find('button.btn-strong').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="More options"]').exists()).toBe(true)
  })
})
