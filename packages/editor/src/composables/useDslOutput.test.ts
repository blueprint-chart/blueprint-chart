import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useDslOutput } from './useDslOutput'
import { useChartTypeOptions } from './useChartTypeOptions'

describe('useDslOutput', () => {
  beforeEach(() => {
    useChartConfig().reset()
    useChartTypeOptions().reset()
  })

  describe('highlight serialization', () => {
    it('emits highlight blocks', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'
      config.highlights.value = [
        { target: 'Q3', color: '#ff0000', label: 'Peak' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('highlight "Q3"')
      expect(dsl.value).toContain('color = "#ff0000"')
      expect(dsl.value).toContain('label = "Peak"')
    })

    it('skips highlights without target', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'
      config.highlights.value = [
        { target: '', color: '#ff0000', label: '' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).not.toContain('highlight')
    })
  })

  describe('area fill serialization', () => {
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
      config.areaFills.value = [
        { from: '', to: 'B' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).not.toContain('areafill')
    })
  })

  describe('annotation serialization', () => {
    it('emits point annotation blocks', () => {
      const config = useChartConfig()
      config.chartType.value = 'line'
      config.annotations.value = [
        { kind: 'point', target: '2024-Q1', text: 'Peak', showArrow: true, anchorDirection: 'NE', textOffsetX: 30, textOffsetY: -40 },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('annotation "2024-Q1"')
      expect(dsl.value).toContain('text = "Peak"')
      expect(dsl.value).toContain('showArrow = true')
      expect(dsl.value).toContain('anchorDirection = NE')
      expect(dsl.value).toContain('textOffsetX = 30')
      expect(dsl.value).toContain('textOffsetY = -40')
    })

    it('emits range annotation blocks', () => {
      const config = useChartConfig()
      config.chartType.value = 'line'
      config.annotations.value = [
        { kind: 'range', start: 100, end: 200, orientation: 'vertical', bgColor: '#d3d3d3', bgOpacity: 15 },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('range {')
      expect(dsl.value).toContain('start = 100')
      expect(dsl.value).toContain('end = 200')
      expect(dsl.value).toContain('orientation = vertical')
      expect(dsl.value).toContain('bgColor = "#d3d3d3"')
      expect(dsl.value).toContain('bgOpacity = 15')
    })

    it('emits free annotation (note) blocks', () => {
      const config = useChartConfig()
      config.chartType.value = 'line'
      config.annotations.value = [
        { kind: 'free', text: 'Context', x: 50, y: 25 },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('note {')
      expect(dsl.value).toContain('text = "Context"')
      expect(dsl.value).toContain('x = 50')
      expect(dsl.value).toContain('y = 25')
    })

    it('emits free annotation with px position', () => {
      const config = useChartConfig()
      config.chartType.value = 'line'
      config.annotations.value = [
        { kind: 'free', text: 'Pixel', x: '120px', y: '80px' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('x = "120px"')
      expect(dsl.value).toContain('y = "80px"')
    })

    it('skips point annotations without target', () => {
      const config = useChartConfig()
      config.chartType.value = 'line'
      config.annotations.value = [
        { kind: 'point', target: '', text: 'Peak' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).not.toContain('annotation')
    })
  })

  describe('series override serialization', () => {
    it('emits series blocks with all properties', () => {
      const config = useChartConfig()
      config.chartType.value = 'line-multi'
      config.seriesOverrides.value = [
        {
          name: 'Revenue',
          color: '#ff0000',
          lineWidth: 2,
          dash: '4,2',
          interpolation: 'monotoneX',
          labelMode: 'direct',
          labelText: 'Rev',
          valueLabels: true,
          lineSymbols: true,
          hidden: false,
          symbolShape: 'diamond',
          symbolShowOn: 'all',
          symbolStyle: 'hollow',
          symbolSize: 5,
          symbolOpacity: 0.8,
        },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('series "Revenue"')
      expect(dsl.value).toContain('color = "#ff0000"')
      expect(dsl.value).toContain('lineWidth = 2')
      expect(dsl.value).toContain('dash = "4,2"')
      expect(dsl.value).toContain('interpolation = "monotoneX"')
      expect(dsl.value).toContain('labelMode = "direct"')
      expect(dsl.value).toContain('labelText = "Rev"')
      expect(dsl.value).toContain('valueLabels = true')
      expect(dsl.value).toContain('lineSymbols = true')
      expect(dsl.value).toContain('hidden = false')
      expect(dsl.value).toContain('symbolShape = "diamond"')
      expect(dsl.value).toContain('symbolShowOn = "all"')
      expect(dsl.value).toContain('symbolStyle = "hollow"')
      expect(dsl.value).toContain('symbolSize = 5')
      expect(dsl.value).toContain('symbolOpacity = 0.8')
    })

    it('skips series without name', () => {
      const config = useChartConfig()
      config.chartType.value = 'line-multi'
      config.seriesOverrides.value = [
        { name: '', color: '#ff0000' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).not.toContain('series')
    })

    it('emits only set properties', () => {
      const config = useChartConfig()
      config.chartType.value = 'line-multi'
      config.seriesOverrides.value = [
        { name: 'Costs', color: '#00ff00' },
      ]

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('series "Costs"')
      expect(dsl.value).toContain('color = "#00ff00"')
      expect(dsl.value).not.toContain('lineWidth')
      expect(dsl.value).not.toContain('dash = ')
    })
  })
})
