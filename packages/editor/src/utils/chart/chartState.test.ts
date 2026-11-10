import { layoutDefaults } from '@/composables/useChartConfig'
import { parseChartState } from './chartState'

const chart = (body: string) => `chart bar-vertical {\n${body}\n}`

describe('parseChartState', () => {
  it('reads frame text and theme', () => {
    const state = parseChartState(chart(`
  title = "T"
  description = "D"
  byline = "B"
  note = "N"
  source = "S"
  sourceUrl = "https://example.com"
  theme = "ink"`))

    expect(state.chartType).toBe('bar-vertical')
    expect([state.title, state.description, state.byline, state.note, state.source, state.sourceUrl])
      .toEqual(['T', 'D', 'B', 'N', 'S', 'https://example.com'])
    expect(state.chartTheme).toBe('ink')
    expect(parseChartState(chart('')).chartTheme).toBe('blueprint')
  })

  it('reads chart and scene overlays', () => {
    const state = parseChartState(chart(`
  data {
    "A" = 1
    "B" = 2
  }
  overlay "A" "B" {
    title = "Band"
    opacity = 30
    pattern = stripes
  }
  scene {
    overlay "B" {
      color = "#ff0000"
    }
  }`))

    expect(state.overlays).toEqual([{ columns: ['A', 'B'], title: 'Band', opacity: 30, pattern: 'stripes' }])
    expect(state.scenes[0].overlays).toEqual([{ columns: ['B'], color: '#ff0000' }])
  })

  it('reads layout over defaults', () => {
    const state = parseChartState(chart(`
  sizing = fixed
  fixedWidth = 480
  heightMode = fixed
  fixedHeight = 300
  transparentBackground = true`))

    expect(state.layout).toEqual({
      ...layoutDefaults,
      sizing: 'fixed',
      fixedWidth: 480,
      heightMode: 'fixed',
      fixedHeight: 300,
      transparentBackground: true,
    })
    expect(parseChartState(chart('')).layout).toEqual(layoutDefaults)
  })

  it('keeps a padding with units verbatim', () => {
    expect(parseChartState(chart('  padding = "24px 32px"')).layout.padding).toBe('24px 32px')
    expect(parseChartState(chart('  padding = 12')).layout.padding).toBe(12)
  })

  it('reads allowDarkMode into the option overrides', () => {
    expect(parseChartState(chart('  allowDarkMode = false')).optionOverrides.allowDarkMode).toBe(false)
  })

  it('gives scenes positional ids', () => {
    const state = parseChartState(chart('  scene {\n  }\n  scene {\n  }'))
    expect(state.scenes.map(s => s.id)).toEqual(['scene-0', 'scene-1'])
  })

  it('drops unknown transform types', () => {
    const state = parseChartState(chart(`
  transform sort {
    columns = "value"
  }
  transform bogus {
    columns = "value"
  }`))
    expect(state.transforms.map(t => t.type)).toEqual(['sort'])
  })

  it('throws on invalid DSL', () => {
    expect(() => parseChartState('not a chart')).toThrow()
  })
})
