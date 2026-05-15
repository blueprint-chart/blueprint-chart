import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import CommandPaletteModal from './CommandPaletteModal.vue'

vi.mock('bootstrap-vue-next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('bootstrap-vue-next')>()
  return {
    ...actual,
    BModal: {
      props: ['modelValue'],
      emits: ['update:modelValue', 'shown'],
      mounted(this: { modelValue: boolean, $emit: (event: string) => void }) {
        if (this.modelValue) {
          this.$emit('shown')
        }
      },
      template: '<div class="modal-stub"><slot v-if="modelValue" /></div>',
    },
  }
})

const Empty = { template: '<div />' }
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: Empty },
    { path: '/charts', component: Empty },
    { path: '/edit/:id', component: Empty },
  ],
})

vi.mock('@/stores/chartSession', () => ({
  useChartSession: () => ({
    listSavedCharts: () => [
      { id: 'a1', title: 'Facebook decline', description: 'Users falling', chartType: 'line', savedAt: '2026-05-15T10:00:00Z', sceneCount: 1, rowCount: 12, allowDarkMode: true },
      { id: 'b2', title: 'China CO₂', description: 'Emissions trend', chartType: 'bar', savedAt: '2026-05-14T10:00:00Z', sceneCount: 1, rowCount: 20, allowDarkMode: true },
    ],
  }),
}))

function mountModal(open = true) {
  return mount(CommandPaletteModal, {
    props: { open },
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
    attachTo: document.body,
  })
}

describe('CommandPaletteModal', () => {
  beforeEach(async () => {
    await router.push('/')
    localStorage.clear()
  })

  it('renders the input when open is true', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    expect(wrapper.find('input[aria-label="Search charts"]').exists()).toBe(true)
  })

  it('filters chart results by title (case-insensitive)', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    await wrapper.find('input[aria-label="Search charts"]').setValue('facebook')
    await flushPromises()
    const items = wrapper.findAll('[role="option"]')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('Facebook decline')
  })

  it('navigates to /edit/:id when a result is selected with Enter', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const wrapper = mountModal(true)
    await flushPromises()
    const input = wrapper.find('input[aria-label="Search charts"]')
    await input.setValue('facebook')
    await flushPromises()
    await input.trigger('keydown', { key: 'Enter' })
    expect(pushSpy).toHaveBeenCalledWith('/edit/a1')
  })

  it('emits update:open=false on Escape', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    await wrapper.find('input[aria-label="Search charts"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('emits update:open=false on route change', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    await router.push('/charts')
    await flushPromises()
    expect(wrapper.emitted('update:open')).toContainEqual([false])
  })

  it('shows the 5 most recently saved charts on empty query', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    const items = wrapper.findAll('[role="option"]')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].text()).toContain('Facebook decline')
  })

  it('shows a no-results message when the query has no matches', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    await wrapper.find('input[aria-label="Search charts"]').setValue('xyznomatch')
    await flushPromises()
    expect(wrapper.text()).toContain('No charts match')
  })

  it('focuses the input when the modal shows', async () => {
    const wrapper = mountModal(true)
    await flushPromises()
    await nextTick()
    const input = wrapper.find('input[aria-label="Search charts"]').element as HTMLInputElement
    expect(document.activeElement).toBe(input)
  })
})
