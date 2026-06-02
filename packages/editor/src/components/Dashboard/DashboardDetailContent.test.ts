import { mount } from '@vue/test-utils'
import DashboardDetailContent from './DashboardDetailContent.vue'

function mountContent(props: Record<string, unknown> = {}) {
  return mount(DashboardDetailContent, {
    props: {
      title: 'My chart',
      chartType: 'bar',
      sceneCount: 1,
      rowCount: 3,
      syncState: 'local' as const,
      showCloud: true,
      ...props,
    },
    global: {
      stubs: {
        DashboardDetailPreview: true,
        DashboardDetailMeta: true,
        DashboardDetailActions: true,
      },
    },
  })
}

describe('DashboardDetailContent sync action', () => {
  it('shows the "Sync to cloud" button for a local chart when cloud is available', () => {
    const wrapper = mountContent({ syncState: 'local', showCloud: true })
    expect(wrapper.find('.dashboard-detail-content__sync').exists()).toBe(true)
  })

  it('hides the "Sync to cloud" button when cloud is unavailable (signed out)', () => {
    const wrapper = mountContent({ syncState: 'local', showCloud: false })
    expect(wrapper.find('.dashboard-detail-content__sync').exists()).toBe(false)
  })

  it('does not show the sync button for a non-local chart', () => {
    const wrapper = mountContent({ syncState: 'synced', showCloud: true })
    expect(wrapper.find('.dashboard-detail-content__sync').exists()).toBe(false)
  })
})
