import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia, storeToRefs } from 'pinia'
import { useEditorPanelStore as useEditorPanel } from '@/stores/editorPanel'

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({
    chartType: { value: 'line' },
  }),
}))

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    availableOptionKeys: { value: ['showVerticalAxis', 'showHorizontalAxis'] },
  }),
}))

describe('ChartEditIconRail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useEditorPanel().reset()
  })

  it('useEditorPanel activeTab syncs with selectTab', () => {
    const store = useEditorPanel()
    const { activeTab } = storeToRefs(store)
    store.selectTab('text')
    expect(activeTab.value).toBe('text')
  })

  it('selectTab from collapsed opens panel', () => {
    const store = useEditorPanel()
    const { panelMode } = storeToRefs(store)
    store.collapse()
    expect(panelMode.value).toBe('collapsed')
    store.selectTab('style')
    expect(panelMode.value).toBe('docked')
  })

  it('toggleMode cycles correctly', () => {
    const store = useEditorPanel()
    const { panelMode } = storeToRefs(store)
    expect(panelMode.value).toBe('docked')
    store.toggleMode()
    expect(panelMode.value).toBe('floating')
    store.toggleMode()
    expect(panelMode.value).toBe('docked')
  })
})
