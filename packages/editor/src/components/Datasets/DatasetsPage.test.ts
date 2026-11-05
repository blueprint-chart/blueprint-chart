import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, shallowRef } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Dataset } from '@/utils/datasets'
import DatasetsPage from './DatasetsPage.vue'

const list = shallowRef<Dataset[]>([])
const loading = shallowRef(false)
const startChart = vi.fn<(dataset: Dataset) => string | null>()

vi.mock('@/composables/useDatasets', () => ({
  useDatasets: () => ({ datasets: computed(() => list.value), loading, refresh: vi.fn(), startChart, chartDsl: vi.fn() }),
}))

function dataset(key: string, data = `"${key}" = 1`): Dataset {
  return {
    key,
    chartType: 'bar',
    data,
    steps: [],
    rowCount: 1,
    columns: ['label', 'value'],
    charts: [{ id: key, title: key, savedAt: null }],
    source: null,
    dsl: '',
  }
}

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { template: '<div />' } }],
  })
  await router.push('/datasets')
  await router.isReady()
  setActivePinia(createPinia())
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(DatasetsPage, {
    global: {
      plugins: [router],
      stubs: { RouterLink: RouterLinkStub, LayoutBreadcrumb: true, DatasetsDetail: true, PanelShell: { template: '<div><slot /></div>' } },
    },
  })
  return { wrapper, push }
}

describe('DatasetsPage', () => {
  beforeEach(() => {
    startChart.mockReset()
    loading.value = false
  })

  it('renders one card per dataset', async () => {
    list.value = [dataset('a'), dataset('b')]
    const { wrapper } = await mountPage()
    expect(wrapper.findAll('.datasets-card')).toHaveLength(2)
  })

  it('shows the selected dataset in the panel', async () => {
    list.value = [dataset('a'), dataset('b')]
    const { wrapper } = await mountPage()
    await wrapper.findAll('.datasets-card__header__text__name')[1].trigger('click')
    expect(wrapper.findComponent({ name: 'DatasetsDetail' }).props('group')).toEqual({ key: list.value[1].data, variants: [list.value[1]] })
  })

  it('groups pipelines of the same raw data into one card', async () => {
    list.value = [dataset('a', 'same'), dataset('b', 'same'), dataset('c')]
    const { wrapper } = await mountPage()
    expect(wrapper.findAll('.datasets-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('2 datasets')
  })

  it('shows the chart-style empty panel when no dataset is selected', async () => {
    list.value = [dataset('a')]
    const { wrapper } = await mountPage()
    expect(wrapper.find('.panel-empty-state').text()).toBe('Select a dataset to see its data, steps and charts.')
  })

  it('renders the empty state with no datasets', async () => {
    list.value = []
    const { wrapper } = await mountPage()
    expect(wrapper.text()).toContain('No datasets yet')
  })

  it('hides the empty state while cloud datasets load', async () => {
    list.value = []
    loading.value = true
    const { wrapper } = await mountPage()
    expect(wrapper.text()).not.toContain('No datasets yet')
  })

  it('links the empty state button to the new chart wizard', async () => {
    list.value = []
    const { wrapper } = await mountPage()
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/new')
  })

  it('starts a chart and routes to its data step', async () => {
    list.value = [dataset('a')]
    startChart.mockReturnValue('new-id')
    const { wrapper, push } = await mountPage()
    await wrapper.find('.datasets-card__pipelines__item__action').trigger('click')
    await flushPromises()
    expect(startChart).toHaveBeenCalledWith(list.value[0])
    expect(push).toHaveBeenCalledWith('/edit/new-id/data')
  })

  it('starts a chart from the pipeline the panel reuses', async () => {
    list.value = [dataset('a'), dataset('b')]
    startChart.mockReturnValue('new-id')
    const { wrapper } = await mountPage()
    await wrapper.findAll('.datasets-card__header__text__name')[0].trigger('click')
    wrapper.findComponent({ name: 'DatasetsDetail' }).vm.$emit('newChart', list.value[0])
    expect(startChart).toHaveBeenCalledWith(list.value[0])
  })

  it('stays on the page when no chart is created', async () => {
    list.value = [dataset('a')]
    startChart.mockReturnValue(null)
    const { wrapper, push } = await mountPage()
    await wrapper.find('.datasets-card__pipelines__item__action').trigger('click')
    expect(push).not.toHaveBeenCalled()
  })
})
