import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutShell from './LayoutShell.vue'

const isNarrowRef = ref(true)

vi.mock('@blueprint-chart/ui', async (orig) => {
  const actual = await orig<typeof import('@blueprint-chart/ui')>()
  return { ...actual, useBreakpoint: () => ({ isNarrow: isNarrowRef }) }
})

beforeEach(() => {
  isNarrowRef.value = true
})

async function mountShell(initialPath = '/charts', attach = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/charts', component: { template: '<div />' } },
      { path: '/edit/:id', component: { template: '<div />' } },
    ],
  })
  await router.push(initialPath)
  await router.isReady()
  return mount(LayoutShell, {
    attachTo: attach ? document.body : undefined,
    slots: { default: '<div class="slot-content">slot</div>' },
    global: {
      stubs: { 'router-link': RouterLinkStub, 'BOffcanvas': { template: '<div class="b-offcanvas-stub" :data-open="modelValue"><slot /></div>', props: ['modelValue', 'placement', 'noHeader'] }, 'CommandPaletteModal': { name: 'CommandPaletteModal', template: '<div />', props: ['open'] } },
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
  })
}

describe('LayoutShell — skip link', () => {
  it('renders the skip link first and targets main', async () => {
    const wrapper = await mountShell('/charts', true)
    const first = document.body.querySelector('a, button, input, [tabindex]') as HTMLElement
    expect(first.getAttribute('href')).toBe('#main')
    expect(first.textContent?.trim()).toBe('Skip to content')
    expect(wrapper.find('main#main').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('LayoutShell — skip link activation', () => {
  it('focuses main without changing the route', async () => {
    const wrapper = await mountShell('/charts', true)
    const router = wrapper.vm.$router
    await wrapper.find('a[href="#main"]').trigger('click')
    expect(router.currentRoute.value.fullPath).toBe('/charts')
    expect(document.activeElement).toBe(wrapper.find('main#main').element)
    expect(wrapper.find('main#main').attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })
})

describe('LayoutShell — sidebarOpen state', () => {
  it('starts with sidebarOpen=false (offcanvas closed)', async () => {
    const wrapper = await mountShell()
    const oc = wrapper.find('.b-offcanvas-stub')
    expect(oc.exists()).toBe(true)
    expect(oc.attributes('data-open')).toBe('false')
  })

  it('toggleSidebar emitted from navbar flips sidebarOpen', async () => {
    const wrapper = await mountShell()
    await wrapper.findComponent({ name: 'LayoutNavbar' }).vm.$emit('toggleSidebar')
    await nextTick()
    expect(wrapper.find('.b-offcanvas-stub').attributes('data-open')).toBe('true')

    await wrapper.findComponent({ name: 'LayoutNavbar' }).vm.$emit('toggleSidebar')
    await nextTick()
    expect(wrapper.find('.b-offcanvas-stub').attributes('data-open')).toBe('false')
  })

  it('closes sidebar on route change', async () => {
    const wrapper = await mountShell('/charts')
    await wrapper.findComponent({ name: 'LayoutNavbar' }).vm.$emit('toggleSidebar')
    await nextTick()
    expect(wrapper.find('.b-offcanvas-stub').attributes('data-open')).toBe('true')

    const router = wrapper.vm.$router
    await router.push('/edit/abc')
    await nextTick()
    expect(wrapper.find('.b-offcanvas-stub').attributes('data-open')).toBe('false')
  })

  it('resets sidebarOpen when transitioning to wide', async () => {
    const wrapper = await mountShell()
    await wrapper.findComponent({ name: 'LayoutNavbar' }).vm.$emit('toggleSidebar')
    await nextTick()
    expect(wrapper.find('.b-offcanvas-stub').attributes('data-open')).toBe('true')

    isNarrowRef.value = false
    await nextTick()
    // BOffcanvas unmounts at wide, so the stub disappears; sidebarOpen is also reset.
    expect(wrapper.find('.b-offcanvas-stub').exists()).toBe(false)
  })

  it('does not render BOffcanvas when wide (isNarrow=false)', async () => {
    isNarrowRef.value = false
    const wrapper = await mountShell()
    expect(wrapper.find('.b-offcanvas-stub').exists()).toBe(false)
  })
})

describe('LayoutShell — sidebar chrome', () => {
  it('drops the topbar when wide', async () => {
    isNarrowRef.value = false
    const wrapper = await mountShell()
    expect(wrapper.find('.layout-shell__topbar').exists()).toBe(false)
  })

  it('keeps the topbar when narrow', async () => {
    const wrapper = await mountShell()
    expect(wrapper.find('.layout-shell__topbar').exists()).toBe(true)
  })

  it('opens the command palette from the sidebar search', async () => {
    isNarrowRef.value = false
    const wrapper = await mountShell()
    await wrapper.findComponent({ name: 'LayoutSidebar' }).vm.$emit('searchClick')
    await nextTick()
    expect(wrapper.findComponent({ name: 'CommandPaletteModal' }).props('open')).toBe(true)
  })
})
