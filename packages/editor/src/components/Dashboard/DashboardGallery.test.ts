import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import DashboardGallery from './DashboardGallery.vue'
import { useWaitStore } from '@/stores/wait'

function mountGallery(charts: unknown[], waitingList: boolean, empty = false, dsls: Record<string, string> = {}, globalOverrides: Record<string, unknown> = {}) {
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  useWaitStore(pinia).set('dashboard-charts', waitingList)
  return mount(DashboardGallery, {
    props: {
      charts: charts as never,
      dsls,
      selectedId: null,
      layout: 'grid' as const,
      showCloud: true,
      empty,
    },
    global: {
      plugins: [pinia],
      stubs: { DashboardChartCard: true, DashboardNewCard: true, RouterLink: RouterLinkStub },
      ...globalOverrides,
    },
  })
}

describe('DashboardGallery list loading', () => {
  it('renders skeleton cards (and no empty state) while loading an empty list', () => {
    const wrapper = mountGallery([], true)
    expect(wrapper.findAll('.gallery-card--loading').length).toBe(6)
    expect(wrapper.find('.feedback-empty-state').exists()).toBe(false)
  })

  it('renders the empty state (no skeletons) when empty', () => {
    const wrapper = mountGallery([], false, true)
    expect(wrapper.findAll('.gallery-card--loading').length).toBe(0)
    expect(wrapper.find('.feedback-empty-state__title').text()).toBe('No charts yet')
    expect(wrapper.find('.feedback-empty-state__icon svg').exists()).toBe(true)
  })

  it('replaces the new chart tile with a new chart link button when empty', () => {
    const wrapper = mountGallery([], false, true)
    expect(wrapper.findComponent({ name: 'DashboardNewCard' }).exists()).toBe(false)
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toBe('/new')
    expect(link.text()).toBe('New chart')
  })

  it('stays empty during a refresh once known empty', () => {
    const wrapper = mountGallery([], true, true)
    expect(wrapper.find('.feedback-empty-state').exists()).toBe(true)
    expect(wrapper.findAll('.gallery-card--loading').length).toBe(0)
  })

  it('puts the block class on the root', () => {
    expect(mountGallery([], false, true).classes()).toContain('dashboard-gallery')
    expect(mountGallery([], false, false).classes()).toContain('dashboard-gallery')
  })

  it('keeps the new chart tile while loading', () => {
    const wrapper = mountGallery([], true)
    expect(wrapper.findComponent({ name: 'DashboardNewCard' }).exists()).toBe(true)
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

  it('renders each chart thumbnail live from its DSL', () => {
    const chart = {
      id: 'a', title: 'A', description: '', chartType: 'bar', savedAt: '2026-01-01',
      sceneCount: 0, rowCount: 0, allowDarkMode: true, sheetNumber: null, sheetId: '',
      syncState: 'local', published: false,
    }
    const wrapper = mountGallery([chart], false, false, { a: 'chart bar {}' }, {
      stubs: { DashboardNewCard: true, ChartThumbnail: true, DisplayChartTypeBadge: true, DisplayDate: true },
    })
    expect(wrapper.findComponent({ name: 'ChartThumbnail' }).props('dsl')).toBe('chart bar {}')
  })
})
