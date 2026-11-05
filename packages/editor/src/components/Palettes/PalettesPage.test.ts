import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PalettesPage from './PalettesPage.vue'

async function mountAt(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/palettes', component: PalettesPage }],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(PalettesPage, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  return wrapper
}

describe('PalettesPage', () => {
  beforeEach(() => localStorage.clear())

  it('activates the Palettes tab by default', async () => {
    const wrapper = await mountAt('/palettes')
    expect(wrapper.find('.nav-link.active').text()).toBe('Palettes')
  })

  it('activates the Category colors tab from the query', async () => {
    const wrapper = await mountAt('/palettes?tab=categories')
    expect(wrapper.find('.nav-link.active').text()).toBe('Category colors')
  })
})
