import { useChartThemeStore, chartThemeOptions } from './chartTheme'

describe('useChartThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to blueprint theme', () => {
    const store = useChartThemeStore()
    expect(store.chartTheme).toBe('blueprint')
  })

  it('allows setting a different theme', () => {
    const store = useChartThemeStore()
    store.chartTheme = 'blueprint-framed'
    expect(store.chartTheme).toBe('blueprint-framed')
  })

  it('reset returns to blueprint theme', () => {
    const store = useChartThemeStore()
    store.chartTheme = 'blueprint-framed'
    store.reset()
    expect(store.chartTheme).toBe('blueprint')
  })

  it('is a singleton across calls', () => {
    const a = useChartThemeStore()
    const b = useChartThemeStore()
    a.chartTheme = 'blueprint-framed'
    expect(b.chartTheme).toBe('blueprint-framed')
  })

  it('exports chartThemeOptions with available themes', () => {
    expect(chartThemeOptions).toHaveLength(3)
    expect(chartThemeOptions[0].value).toBe('blueprint')
    expect(chartThemeOptions[1].value).toBe('blueprint-framed')
    expect(chartThemeOptions[2].value).toBe('blueprint-bold')
  })
})
