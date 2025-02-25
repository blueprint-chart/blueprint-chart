import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEditorPanel } from '@/composables/useEditorPanel'

vi.mock('@/composables/useChartConfig', () => ({
  useChartConfig: () => ({
    chartType: { value: 'line' },
  }),
}))

vi.mock('@/composables/useChartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    availableOptionKeys: { value: ['showVerticalAxis', 'showHorizontalAxis'] },
  }),
}))

describe('ChartEditIconRail', () => {
  beforeEach(() => {
    useEditorPanel().reset()
  })

  it('useEditorPanel activeTab syncs with selectTab', () => {
    const { activeTab, selectTab } = useEditorPanel()
    selectTab('text')
    expect(activeTab.value).toBe('text')
  })

  it('selectTab from collapsed opens panel', () => {
    const { panelMode, collapse, selectTab } = useEditorPanel()
    collapse()
    expect(panelMode.value).toBe('collapsed')
    selectTab('appearance')
    expect(panelMode.value).toBe('docked')
  })

  it('toggleMode cycles correctly', () => {
    const { panelMode, toggleMode } = useEditorPanel()
    expect(panelMode.value).toBe('docked')
    toggleMode()
    expect(panelMode.value).toBe('floating')
    toggleMode()
    expect(panelMode.value).toBe('docked')
  })
})
