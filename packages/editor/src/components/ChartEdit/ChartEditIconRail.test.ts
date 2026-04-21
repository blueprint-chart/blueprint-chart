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
})
