import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useDslOutput } from './useDslOutput'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDslSync } from './useDslSync'

describe('useDslOutput', () => {
  beforeEach(() => {
    useScenes().reset()
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

  describe('scene serialization', () => {
    it('serializes scene chartTypeOptions', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        chartTypeOptions: { colors: ['#ff0000', '#00ff00'] },
      })

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('scene {')
      expect(dsl.value).toContain('colors = "#ff0000, #00ff00"')
    })

    it('serializes boolean scene chartTypeOptions', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        chartTypeOptions: { showVerticalTicks: false },
      })

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('showVerticalTicks = false')
    })

    it('serializes string scene chartTypeOptions', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        chartTypeOptions: { colorPalette: 'viridis' },
      })

      const { dsl } = useDslOutput()
      expect(dsl.value).toContain('colorPalette = "viridis"')
    })

    it('scene chartType override serializes as type and preserves base chart type', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'
      config.data.value = 'Label,Value\nA,10\nB,20\nC,30'

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      // Change chart type while scene is active → should go to scene override
      config.chartType.value = 'bar-horizontal'

      const { dsl } = useDslOutput()
      // Top-level must stay bar-vertical
      expect(dsl.value).toMatch(/^chart bar-vertical \{/)
      // Scene block must contain type = bar-horizontal
      const sceneBlock = dsl.value.split('scene {')[1]
      expect(sceneBlock).toContain('type = bar-horizontal')
    })

    it('scene chartType round-trips through DSL parse', () => {
      // Build a DSL string with scene chartType override using parser-native format
      const dslInput = [
        'chart bar-vertical {',
        '  data {',
        '    "A" = 10',
        '    "B" = 20',
        '    "C" = 30',
        '  }',
        '',
        '  scene {',
        '    type = bar-horizontal',
        '  }',
        '}',
      ].join('\n')

      // Parse it
      const { applyDsl } = useDslSync()
      const result = applyDsl(dslInput)
      expect(result.success).toBe(true)

      // Verify internal state: base chartType is bar-vertical, scene has bar-horizontal
      const config = useChartConfig()
      expect(config._base.chartType.value).toBe('bar-vertical')

      const scenes = useScenes()
      expect(scenes.scenes.value).toHaveLength(1)
      expect(scenes.scenes.value[0].chartType).toBe('bar-horizontal')

      // Re-serialize and verify DSL output
      const { dsl } = useDslOutput()
      expect(dsl.value).toMatch(/^chart bar-vertical \{/)
      const sceneBlock = dsl.value.split('scene {')[1]
      expect(sceneBlock).toContain('type = bar-horizontal')
    })

    it('new scene does not get a data block from base data', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'
      config.data.value = 'Label,Value\nA,10\nB,20\nC,30'

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      // Scene was just added — should have no data override
      expect(scenes.scenes.value[0].data).toBeUndefined()

      const { dsl } = useDslOutput()
      const sceneBlock = dsl.value.split('scene {')[1]
      expect(sceneBlock).not.toContain('data {')
    })

    it('does not leak scene values into base chart section', () => {
      const config = useChartConfig()
      config.chartType.value = 'bar-vertical'
      config.title.value = 'Base Title'

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        properties: { title: 'Scene Title' },
        highlights: [{ target: 'A', color: '#f00', label: '' }],
      })
      scenes.setActive(0)

      const { dsl } = useDslOutput()
      // Base section should show base title, not scene title
      const lines = dsl.value.split('\n')
      const titleLine = lines.find(l => l.includes('title = ') && !l.includes('scene'))
      expect(titleLine).toContain('Base Title')
      // Base section should not have scene highlights
      const baseSection = dsl.value.split('scene {')[0]
      expect(baseSection).not.toContain('highlight "A"')
    })
  })
})
