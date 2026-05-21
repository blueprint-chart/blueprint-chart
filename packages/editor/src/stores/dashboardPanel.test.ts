import { useDashboardPanelStore as useDashboardPanel } from './dashboardPanel'
import { usePanelStore } from './panel'

describe('useDashboardPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with no chart selected', () => {
    const store = useDashboardPanel()
    expect(store.selectedChartId).toBeNull()
  })

  it('selects a chart', () => {
    const store = useDashboardPanel()
    store.selectChart('abc')
    expect(store.selectedChartId).toBe('abc')
  })

  it('toggles selection when selecting the same chart', () => {
    const store = useDashboardPanel()
    store.selectChart('abc')
    expect(store.selectedChartId).toBe('abc')
    store.selectChart('abc')
    expect(store.selectedChartId).toBeNull()
  })

  it('switches selection to a different chart', () => {
    const store = useDashboardPanel()
    store.selectChart('abc')
    store.selectChart('xyz')
    expect(store.selectedChartId).toBe('xyz')
  })

  it('reset() clears the selected chart', () => {
    const store = useDashboardPanel()
    store.selectChart('abc')
    store.reset()
    expect(store.selectedChartId).toBeNull()
  })

  it('shares state across calls', () => {
    const a = useDashboardPanel()
    const b = useDashboardPanel()
    a.selectChart('abc')
    expect(b.selectedChartId).toBe('abc')
  })

  it('selectChart opens the shared panel when chrome is closed', () => {
    const panel = usePanelStore()
    const store = useDashboardPanel()
    panel.close()
    store.selectChart('abc')
    expect(panel.mode).toBe('docked')
    expect(store.selectedChartId).toBe('abc')
  })

  it('selectChart leaves an already-open panel unchanged', () => {
    const panel = usePanelStore()
    const store = useDashboardPanel()
    panel.dock()
    store.selectChart('abc')
    expect(panel.mode).toBe('docked')
  })

  it('deselecting a chart does not touch the panel chrome', () => {
    const panel = usePanelStore()
    const store = useDashboardPanel()
    panel.dock()
    store.selectChart('abc')
    store.selectChart('abc')
    expect(store.selectedChartId).toBeNull()
    expect(panel.mode).toBe('docked')
  })
})
