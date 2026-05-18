import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutShell from './LayoutShell.vue'

vi.mock('@blueprint-chart/ui', async (orig) => {
  const actual = await orig<typeof import('@blueprint-chart/ui')>()
  return { ...actual, useBreakpoint: () => ({ isNarrow: ref(true) }) }
})

async function mountShell(initialPath = '/charts') {
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
    slots: { default: '<div class="slot-content">slot</div>' },
    global: {
      stubs: { 'router-link': RouterLinkStub, 'BOffcanvas': { template: '<div class="b-offcanvas-stub" :data-open="modelValue"><slot /></div>', props: ['modelValue', 'placement', 'noHeader'] } },
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
  })
}

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
})
