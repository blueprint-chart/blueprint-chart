import { useDashboardPanelStore as useDashboardPanel } from './dashboardPanel'

describe('useDashboardPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with default state', () => {
    const store = useDashboardPanel()
    expect(store.panelMode).toBe('docked')
    expect(store.selectedChartId).toBeNull()
    expect(store.floatingPosition).toEqual({ x: -1, y: 16 })
  })

  it('docks the panel', () => {
    const store = useDashboardPanel()
    store.float()
    store.dock()
    expect(store.panelMode).toBe('docked')
  })

  it('floats the panel', () => {
    const store = useDashboardPanel()
    store.float()
    expect(store.panelMode).toBe('floating')
  })

  it('collapses the panel and clears selection', () => {
    const store = useDashboardPanel()
    store.selectChart('abc')
    store.collapse()
    expect(store.panelMode).toBe('collapsed')
    expect(store.selectedChartId).toBeNull()
  })

  it('selects a chart and restores last open mode from collapsed', () => {
    const store = useDashboardPanel()
    store.float()
    store.collapse()
    store.selectChart('abc')
    expect(store.selectedChartId).toBe('abc')
    expect(store.panelMode).toBe('floating')
  })

  it('toggles selection when selecting the same chart', () => {
    const store = useDashboardPanel()
    store.selectChart('abc')
    expect(store.selectedChartId).toBe('abc')
    store.selectChart('abc')
    expect(store.selectedChartId).toBeNull()
  })

  it('resets to defaults', () => {
    const store = useDashboardPanel()
    store.float()
    store.selectChart('abc')
    store.reset()
    expect(store.panelMode).toBe('collapsed')
    expect(store.selectedChartId).toBeNull()
    expect(store.floatingPosition).toEqual({ x: -1, y: 16 })
  })

  it('restores docked mode by default after collapse', () => {
    const store = useDashboardPanel()
    store.collapse()
    store.selectChart('xyz')
    expect(store.panelMode).toBe('docked')
  })

  it('shares state across calls', () => {
    const a = useDashboardPanel()
    const b = useDashboardPanel()
    a.selectChart('abc')
    expect(b.selectedChartId).toBe('abc')
  })
})
