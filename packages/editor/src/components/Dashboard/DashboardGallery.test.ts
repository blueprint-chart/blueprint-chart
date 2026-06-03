import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import DashboardGallery from './DashboardGallery.vue'
import { useWaitStore } from '@/stores/wait'

function mountGallery(charts: unknown[], waitingList: boolean) {
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  useWaitStore(pinia).set('dashboard-charts', waitingList)
  return mount(DashboardGallery, {
    props: {
      charts: charts as never,
      thumbnails: {},
      selectedId: null,
      layout: 'grid' as const,
      showCloud: true,
    },
    global: {
      plugins: [pinia],
      stubs: { DashboardChartCard: true, DashboardNewCard: true },
    },
  })
}

describe('DashboardGallery list loading', () => {
  it('renders skeleton cards (and no empty state) while loading an empty list', () => {
    const wrapper = mountGallery([], true)
    expect(wrapper.findAll('.gallery-card--loading').length).toBe(6)
    expect(wrapper.find('.feedback-empty-state').exists()).toBe(false)
  })

  it('renders the empty state (no skeletons) when not loading and empty', () => {
    const wrapper = mountGallery([], false)
    expect(wrapper.findAll('.gallery-card--loading').length).toBe(0)
    expect(wrapper.find('.feedback-empty-state').exists()).toBe(true)
  })

  it('does not render skeletons once charts are present, even mid-load', () => {
    const chart = {
      id: 'a', title: 'A', description: '', chartType: 'bar', savedAt: '2026-01-01',
      sceneCount: 0, rowCount: 0, allowDarkMode: true, sheetNumber: null, sheetId: '',
      syncState: 'cloud', published: false,
    }
    const wrapper = mountGallery([chart], true)
    expect(wrapper.findAll('.gallery-card--loading').length).toBe(0)
  })
})
