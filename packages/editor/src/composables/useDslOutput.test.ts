import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useDslOutput } from './useDslOutput'
import { useChartTypeOptions } from './useChartTypeOptions'

beforeEach(() => {
  useChartConfig().reset()
  useChartTypeOptions().reset()
})

describe('useDslOutput highlight serialization', () => {
  it('emits highlight blocks', () => {
    const config = useChartConfig()
    config.chartType.value = 'bar-vertical'
    config.highlights.value = [{ target: 'Q3', color: '#ff0000', label: 'Peak' }]
    const { dsl } = useDslOutput()
    expect(dsl.value).toContain('highlight "Q3"')
    expect(dsl.value).toContain('color = "#ff0000"')
    expect(dsl.value).toContain('label = "Peak"')
  })

  it('skips highlights without target', () => {
    const config = useChartConfig()
    config.chartType.value = 'bar-vertical'
    config.highlights.value = [{ target: '', color: '#ff0000', label: '' }]
    const { dsl } = useDslOutput()
    expect(dsl.value).not.toContain('highlight')
  })
})

describe('useDslOutput area fill serialization', () => {
  it('emits areafill blocks', () => {
    const config = useChartConfig()
    config.chartType.value = 'line'
    config.areaFills.value = [
      { from: 'A', to: 'B', color: '#ff0000', negativeColor: '#0000ff', opacity: 0.5, interpolation: 'monotoneX' },
    ]
    const { dsl } = useDslOutput()
    expect(dsl.value).toContain('areafill "A" "B"')
    expect(dsl.value).toContain('color = "#ff0000"')
    expect(dsl.value).toContain('negativeColor = "#0000ff"')
    expect(dsl.value).toContain('opacity = 0.5')
    expect(dsl.value).toContain('interpolation = "monotoneX"')
  })

  it('skips area fills without from or to', () => {
    const config = useChartConfig()
    config.chartType.value = 'line'
    config.areaFills.value = [{ from: '', to: 'B' }]
    const { dsl } = useDslOutput()
    expect(dsl.value).not.toContain('areafill')
  })
})

describe('useDslOutput annotation serialization', () => {
  it('emits annotation blocks', () => {
    const config = useChartConfig()
    config.chartType.value = 'line'
    config.annotations.value = [
      { target: '2024-Q1', text: 'Peak', dx: 10, dy: 20, showArrow: true },
    ]
    const { dsl } = useDslOutput()
    expect(dsl.value).toContain('annotation "2024-Q1"')
    expect(dsl.value).toContain('text = "Peak"')
    expect(dsl.value).toContain('dx = 10')
    expect(dsl.value).toContain('dy = 20')
    expect(dsl.value).toContain('showArrow = true')
  })

  it('skips annotations without target', () => {
    const config = useChartConfig()
    config.chartType.value = 'line'
    config.annotations.value = [{ target: '', text: 'Peak' }]
    const { dsl } = useDslOutput()
    expect(dsl.value).not.toContain('annotation')
  })
})

function assertSeriesRevenue(dslValue: string) {
  expect(dslValue).toContain('series "Revenue"')
  expect(dslValue).toContain('color = "#ff0000"')
  expect(dslValue).toContain('lineWidth = 2')
  expect(dslValue).toContain('dash = "4,2"')
  expect(dslValue).toContain('interpolation = "monotoneX"')
  expect(dslValue).toContain('labelMode = "direct"')
  expect(dslValue).toContain('labelText = "Rev"')
  expect(dslValue).toContain('valueLabels = true')
  expect(dslValue).toContain('lineSymbols = true')
  expect(dslValue).toContain('hidden = false')
  expect(dslValue).toContain('symbolShape = "diamond"')
  expect(dslValue).toContain('symbolShowOn = "all"')
  expect(dslValue).toContain('symbolStyle = "hollow"')
  expect(dslValue).toContain('symbolSize = 5')
  expect(dslValue).toContain('symbolOpacity = 0.8')
}

describe('useDslOutput series override full', () => {
  it('emits series blocks with all properties', () => {
    const config = useChartConfig()
    config.chartType.value = 'line-multi'
    config.seriesOverrides.value = [{
      name: 'Revenue', color: '#ff0000', lineWidth: 2, dash: '4,2',
      interpolation: 'monotoneX', labelMode: 'direct', labelText: 'Rev',
      valueLabels: true, lineSymbols: true, hidden: false,
      symbolShape: 'diamond', symbolShowOn: 'all', symbolStyle: 'hollow',
      symbolSize: 5, symbolOpacity: 0.8,
    }]
    assertSeriesRevenue(useDslOutput().dsl.value)
  })
})

describe('useDslOutput series override edges', () => {
  it('skips series without name', () => {
    const config = useChartConfig()
    config.chartType.value = 'line-multi'
    config.seriesOverrides.value = [{ name: '', color: '#ff0000' }]
    expect(useDslOutput().dsl.value).not.toContain('series')
  })

  it('emits only set properties', () => {
    const config = useChartConfig()
    config.chartType.value = 'line-multi'
    config.seriesOverrides.value = [{ name: 'Costs', color: '#00ff00' }]
    const { dsl } = useDslOutput()
    expect(dsl.value).toContain('series "Costs"')
    expect(dsl.value).toContain('color = "#00ff00"')
    expect(dsl.value).not.toContain('lineWidth')
    expect(dsl.value).not.toContain('dash = ')
  })
})
