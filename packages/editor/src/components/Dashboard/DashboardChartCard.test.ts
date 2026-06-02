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

function mountCard(over: Partial<UnifiedChartSummary> = {}) {
  return mount(DashboardChartCard, {
    props: { chart: chart(over), selected: false, layout: 'grid' as const },
    global: {
      // DashboardChartCard calls useTheme() → needs an active Pinia.
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      stubs: { DisplayChartTypeBadge: true, DisplayDate: true },
    },
  })
}

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
})
