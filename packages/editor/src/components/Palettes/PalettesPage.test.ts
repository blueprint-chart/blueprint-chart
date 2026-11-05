import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PalettesPage from './PalettesPage.vue'
import { useCustomPalettes } from '@/stores/customPalettes'

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/palettes', component: PalettesPage }],
  })
  await router.push(path)
  await router.isReady()
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(PalettesPage, { global: { plugins: [pinia, router], stubs: { teleport: true } } })
  await flushPromises()
  return { wrapper, router }
}

const activeTab = (wrapper: Awaited<ReturnType<typeof mountAt>>['wrapper']) =>
  wrapper.find('.navigation-segmented-control__option--active')

describe('PalettesPage', () => {
  beforeEach(() => localStorage.clear())

  it('activates the Palettes tab by default', async () => {
    const { wrapper } = await mountAt('/palettes')
    expect(activeTab(wrapper).text()).toBe('Palettes')
  })

  it('activates the Category colors tab from the query', async () => {
    const { wrapper } = await mountAt('/palettes?tab=categories')
    expect(activeTab(wrapper).text()).toBe('Category colors')
  })

  it('keeps the selected tab in the URL', async () => {
    const { wrapper, router } = await mountAt('/palettes')
    const categories = wrapper.findAll('.navigation-segmented-control__option').find(b => b.text() === 'Category colors')!
    await categories.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.tab).toBe('categories')
    expect(activeTab(wrapper).text()).toBe('Category colors')
  })

  it('shows the panel only on the Palettes tab', async () => {
    expect((await mountAt('/palettes')).wrapper.find('.layout-panel').exists()).toBe(true)
    expect((await mountAt('/palettes?tab=categories')).wrapper.find('.layout-panel').exists()).toBe(false)
  })

  it('names the primary action after the tab', async () => {
    expect((await mountAt('/palettes')).wrapper.find('.palettes-toolbar__action').text()).toBe('New palette')
    expect((await mountAt('/palettes?tab=categories')).wrapper.find('.palettes-toolbar__action').text()).toBe('Add color')
  })

  it('creates a palette from the primary action', async () => {
    const { wrapper } = await mountAt('/palettes')
    await wrapper.find('.palettes-toolbar__action').trigger('click')
    await flushPromises()
    expect(useCustomPalettes().palettes.value).toHaveLength(1)
    expect((wrapper.find('.palettes-detail__body__name input').element as HTMLInputElement).value).toBe('New palette')
  })
})
