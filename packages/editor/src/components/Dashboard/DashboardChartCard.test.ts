import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import DashboardChartCard from './DashboardChartCard.vue'
import type { UnifiedChartSummary } from '@/composables/useDashboardCharts'

function chart(over: Partial<UnifiedChartSummary> = {}): UnifiedChartSummary {
  return {
    id: 'aaaaaaaaaaa', title: 'My chart', description: '', chartType: 'bar',
    savedAt: '2026-01-01', sceneCount: 1, rowCount: 3, allowDarkMode: true,
    sheetNumber: null, sheetId: '', syncState: 'local', published: false, ...over,
  }
}

function mountCard(over: Partial<UnifiedChartSummary> = {}, extra: Record<string, unknown> = {}) {
  return mount(DashboardChartCard, {
    props: { chart: chart(over), selected: false, layout: 'grid' as const, showCloud: true, ...extra },
    global: {
      // DashboardChartCard calls useTheme() → needs an active Pinia.
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      stubs: { DisplayChartTypeBadge: true, DisplayDate: true },
    },
  })
}

import { useWaitStore } from '@/stores/wait'

describe('DashboardChartCard status pill', () => {
  it('emits sync when a local-only chart pill is clicked', async () => {
    const wrapper = mountCard({ syncState: 'local' })
    await wrapper.find('.dashboard-chart-card__status').trigger('click')
    expect(wrapper.emitted('sync')?.[0]).toEqual(['aaaaaaaaaaa'])
  })

  it('emits open when a cloud-only chart pill is clicked', async () => {
    const wrapper = mountCard({ syncState: 'cloud' })
    await wrapper.find('.dashboard-chart-card__status').trigger('click')
    expect(wrapper.emitted('open')?.[0]).toEqual(['aaaaaaaaaaa'])
  })

  it('renders a non-interactive pill for a synced chart', async () => {
    const wrapper = mountCard({ syncState: 'synced' })
    await wrapper.find('.dashboard-chart-card__status').trigger('click')
    expect(wrapper.emitted('sync')).toBeUndefined()
    expect(wrapper.emitted('open')).toBeUndefined()
  })

  it('hides the sync-state pill when cloud is unavailable (signed out / accounts off)', () => {
    const wrapper = mountCard({ syncState: 'local' }, { showCloud: false })
    expect(wrapper.find('.dashboard-chart-card__status').exists()).toBe(false)
  })
})

describe('DashboardChartCard thumb loading', () => {
  it('shows a thumb skeleton while its chart-media loader is active', () => {
    // stubActions:false so the real wait store mutates; pass the same pinia in.
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    useWaitStore(pinia).set('chart-media:aaaaaaaaaaa', true)
    const wrapper = mount(DashboardChartCard, {
      props: { chart: chart({ syncState: 'cloud' }), selected: false, layout: 'grid' as const, showCloud: true },
      global: {
        plugins: [pinia],
        stubs: { DisplayChartTypeBadge: true, DisplayDate: true },
      },
    })
    expect(wrapper.find('.gallery-card__thumb__skeleton').exists()).toBe(true)
  })

  it('shows no thumb skeleton when the loader is inactive', () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    const wrapper = mount(DashboardChartCard, {
      props: { chart: chart({ syncState: 'cloud' }), selected: false, layout: 'grid' as const, showCloud: true },
      global: {
        plugins: [pinia],
        stubs: { DisplayChartTypeBadge: true, DisplayDate: true },
      },
    })
    expect(wrapper.find('.gallery-card__thumb__skeleton').exists()).toBe(false)
  })
})
