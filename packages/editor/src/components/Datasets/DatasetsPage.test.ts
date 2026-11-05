import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { computed, shallowRef } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { Dataset } from '@/utils/datasets'
import DatasetsPage from './DatasetsPage.vue'

const list = shallowRef<Dataset[]>([])
const startChart = vi.fn<(dataset: Dataset) => string | null>()

vi.mock('@/composables/useDatasets', () => ({
  useDatasets: () => ({ datasets: computed(() => list.value), refresh: vi.fn(), startChart }),
}))

function dataset(key: string): Dataset {
  return {
    key,
    chartType: 'bar',
    data: '"A" = 1',
    steps: [],
    rowCount: 1,
    columnCount: 2,
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
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(DatasetsPage, {
    global: {
      plugins: [router],
      stubs: { RouterLink: RouterLinkStub, LayoutBreadcrumb: true, DatasetsDetail: true },
    },
  })
  return { wrapper, push }
}

describe('DatasetsPage', () => {
  beforeEach(() => {
    startChart.mockReset()
  })

  it('renders one row per dataset', async () => {
    list.value = [dataset('a'), dataset('b')]
    const { wrapper } = await mountPage()
    expect(wrapper.findAll('.datasets-row')).toHaveLength(2)
  })

  it('renders the empty state with no datasets', async () => {
    list.value = []
    const { wrapper } = await mountPage()
    expect(wrapper.text()).toContain('No datasets yet')
  })

  it('starts a chart and routes to its data step', async () => {
    list.value = [dataset('a')]
    startChart.mockReturnValue('new-id')
    const { wrapper, push } = await mountPage()
    await wrapper.findAll('button').find(b => b.text() === 'New chart')!.trigger('click')
    await flushPromises()
    expect(startChart).toHaveBeenCalledWith(list.value[0])
    expect(push).toHaveBeenCalledWith('/edit/new-id/data')
  })

  it('stays on the page when no chart is created', async () => {
    list.value = [dataset('a')]
    startChart.mockReturnValue(null)
    const { wrapper, push } = await mountPage()
    await wrapper.findAll('button').find(b => b.text() === 'New chart')!.trigger('click')
    expect(push).not.toHaveBeenCalled()
  })
})
