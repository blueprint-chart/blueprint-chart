import { AnnotationKind, ChartType, CompassDirection, Orientation } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useDslOutput } from './useDslOutput'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDslSync } from './useDslSync'

describe('useDslOutput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useScenes().reset()
    useChartConfig().reset()
    useChartTypeOptions().reset()
  })

  describe('colorize serialization', () => {
    it('emits colorize blocks', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical
      config.colorizes.value = [
        { target: 'Q3', color: '#ff0000', label: 'Peak' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('colorize "Q3"')
      expect(dsl()).toContain('color = "#ff0000"')
      expect(dsl()).toContain('label = "Peak"')
    })

    it('skips colorizes without target', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical
      config.colorizes.value = [
        { target: '', color: '#ff0000', label: '' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toContain('colorize')
    })
  })

  describe('area fill serialization', () => {
    it('emits area-fill blocks', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.areaFills.value = [
        { from: 'A', to: 'B', color: '#ff0000', negativeColor: '#0000ff', opacity: 0.5, interpolation: 'monotoneX' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('area-fill "A" "B"')
      expect(dsl()).toContain('color = "#ff0000"')
      expect(dsl()).toContain('negativeColor = "#0000ff"')
      expect(dsl()).toContain('opacity = 0.5')
      expect(dsl()).toContain('interpolation = "monotoneX"')
    })

    it('skips area fills without from or to', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.areaFills.value = [
        { from: '', to: 'B' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toContain('area-fill')
    })
  })

  describe('annotation serialization', () => {
    it('emits point annotation blocks', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Point, target: '2024-Q1', text: 'Peak', showArrow: true, anchorDirection: CompassDirection.NE, textOffsetX: 30, textOffsetY: -40 },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('annotation "2024-Q1"')
      expect(dsl()).toContain('text = "Peak"')
      expect(dsl()).toContain('showArrow = true')
      expect(dsl()).toContain('anchorDirection = NE')
      expect(dsl()).toContain('textOffsetX = 30')
      expect(dsl()).toContain('textOffsetY = -40')
    })

    it('emits range annotation blocks', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Range, start: 100, end: 200, orientation: Orientation.Vertical, bgColor: '#d3d3d3', bgOpacity: 15 },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('range {')
      expect(dsl()).toContain('start = 100')
      expect(dsl()).toContain('end = 200')
      expect(dsl()).toContain('orientation = vertical')
      expect(dsl()).toContain('bgColor = "#d3d3d3"')
      expect(dsl()).toContain('bgOpacity = 15')
    })

    it('emits free annotation (note) blocks', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Free, text: 'Context', x: 50, y: 25 },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('note {')
      expect(dsl()).toContain('text = "Context"')
      expect(dsl()).toContain('x = 50')
      expect(dsl()).toContain('y = 25')
    })

    it('emits free annotation with px position', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Free, text: 'Pixel', x: '120px', y: '80px' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('x = "120px"')
      expect(dsl()).toContain('y = "80px"')
    })

    it('skips point annotations without target', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Point, target: '', text: 'Peak' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toContain('annotation')
    })

    it('emits repeat = true for an always annotation', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Point, target: '2024-Q1', text: 'Peak', repeat: 'always' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('repeat = true')
      expect(dsl()).not.toContain('id =')
    })

    it('emits repeat = N for an integer repeat', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Point, target: '2024-Q1', text: 'Peak', repeat: 3 },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('repeat = 3')
    })

    it('omits repeat for a once (default) annotation', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Point, target: '2024-Q1', text: 'Peak' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toContain('repeat =')
    })

    it('never emits id or visibility verbs', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line
      config.annotations.value = [
        { kind: AnnotationKind.Point, target: '2024-Q1', text: 'Peak', id: 'abc12' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toMatch(/\bid =/)
      expect(dsl()).not.toContain('hide-')
      expect(dsl()).not.toContain('show-')
    })
  })

  describe('series override serialization', () => {
    it('emits series blocks with all properties', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.LineMulti
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

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('series "Revenue"')
      expect(dsl()).toContain('color = "#ff0000"')
      expect(dsl()).toContain('lineWidth = 2')
      expect(dsl()).toContain('dash = "4,2"')
      expect(dsl()).toContain('interpolation = "monotoneX"')
      expect(dsl()).toContain('labelMode = "direct"')
      expect(dsl()).toContain('labelText = "Rev"')
      expect(dsl()).toContain('valueLabels = true')
      expect(dsl()).toContain('lineSymbols = true')
      expect(dsl()).toContain('hidden = false')
      expect(dsl()).toContain('symbolShape = "diamond"')
      expect(dsl()).toContain('symbolShowOn = "all"')
      expect(dsl()).toContain('symbolStyle = "hollow"')
      expect(dsl()).toContain('symbolSize = 5')
      expect(dsl()).toContain('symbolOpacity = 0.8')
    })

    it('skips series without name', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.LineMulti
      config.seriesOverrides.value = [
        { name: '', color: '#ff0000' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toContain('series')
    })

    it('emits only set properties', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.LineMulti
      config.seriesOverrides.value = [
        { name: 'Costs', color: '#00ff00' },
      ]

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('series "Costs"')
      expect(dsl()).toContain('color = "#00ff00"')
      expect(dsl()).not.toContain('lineWidth')
      expect(dsl()).not.toContain('dash = ')
    })
  })

  describe('scene serialization', () => {
    it('serializes scene chartTypeOptions', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        chartTypeOptions: { colors: ['#ff0000', '#00ff00'] },
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('scene {')
      expect(dsl()).toContain('colors = "#ff0000, #00ff00"')
    })

    it('serializes boolean scene chartTypeOptions', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        chartTypeOptions: { showVerticalTicks: false },
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('showVerticalTicks = false')
    })

    it('serializes string scene chartTypeOptions', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        chartTypeOptions: { colorPalette: 'viridis' },
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('colorPalette = "viridis"')
    })

    it('scene chartType override serializes as type and preserves base chart type', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical
      config.data.value = 'Label,Value\nA,10\nB,20\nC,30'

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      // Change chart type while scene is active → should go to scene override
      config.chartType.value = ChartType.BarHorizontal

      const { generateDsl: dsl } = useDslOutput()
      // Top-level must stay bar-vertical
      expect(dsl()).toMatch(/^chart bar-vertical \{/)
      // Scene block must contain type = bar-horizontal
      const sceneBlock = dsl().split('scene {')[1]
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
      expect(config._base.chartType.value).toBe(ChartType.BarVertical)

      const scenes = useScenes()
      expect(scenes.scenes.value).toHaveLength(1)
      expect(scenes.scenes.value[0].chartType).toBe(ChartType.BarHorizontal)

      // Re-serialize and verify DSL output
      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toMatch(/^chart bar-vertical \{/)
      const sceneBlock = dsl().split('scene {')[1]
      expect(sceneBlock).toContain('type = bar-horizontal')
    })

    it('new scene does not get a data block from base data', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical
      config.data.value = 'Label,Value\nA,10\nB,20\nC,30'

      const scenes = useScenes()
      scenes.add()
      scenes.setActive(0)

      // Scene was just added — should have no data override
      expect(scenes.scenes.value[0].data).toBeUndefined()

      const { generateDsl: dsl } = useDslOutput()
      const sceneBlock = dsl().split('scene {')[1]
      expect(sceneBlock).not.toContain('data {')
    })

    it('does not leak scene values into base chart section', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical
      config.title.value = 'Base Title'

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        properties: { title: 'Scene Title' },
        colorizes: [{ target: 'A', color: '#f00', label: '' }],
      })
      scenes.setActive(0)

      const { generateDsl: dsl } = useDslOutput()
      // Base section should show base title, not scene title
      const lines = dsl().split('\n')
      const titleLine = lines.find(l => l.includes('title = ') && !l.includes('scene'))
      expect(titleLine).toContain('Base Title')
      // Base section should not have scene colorizes
      const baseSection = dsl().split('scene {')[0]
      expect(baseSection).not.toContain('colorize "A"')
    })

    it('serializes point annotation in scene', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        annotations: [
          { kind: AnnotationKind.Point, target: '2024-Q1', text: 'Peak', showArrow: true },
        ],
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('scene {')
      expect(dsl()).toContain('annotation "2024-Q1"')
      expect(dsl()).not.toContain('id =')
      expect(dsl()).toContain('text = "Peak"')
      expect(dsl()).toContain('showArrow = true')
    })

    it('serializes range annotation in scene', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        annotations: [
          { kind: AnnotationKind.Range, start: 10, end: 90, bgColor: '#ccc' },
        ],
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('scene {')
      expect(dsl()).toContain('range {')
      expect(dsl()).not.toContain('id =')
      expect(dsl()).toContain('start = 10')
      expect(dsl()).toContain('end = 90')
      expect(dsl()).toContain('bgColor = "#ccc"')
    })

    it('serializes free annotation (note) in scene', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        annotations: [
          { kind: AnnotationKind.Free, text: 'Note', x: 50, y: 25 },
        ],
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('scene {')
      expect(dsl()).toContain('note {')
      expect(dsl()).not.toContain('id =')
      expect(dsl()).toContain('text = "Note"')
      expect(dsl()).toContain('x = 50')
      expect(dsl()).toContain('y = 25')
    })

    it('serializes all annotation kinds in scene', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.Line

      const scenes = useScenes()
      scenes.add()
      scenes.update(0, {
        annotations: [
          { kind: AnnotationKind.Point, target: 'X', text: 'Pt' },
          { kind: AnnotationKind.Range, start: 0, end: 100 },
          { kind: AnnotationKind.Free, text: 'Free', x: 10, y: 20 },
        ],
      })

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('annotation "X"')
      expect(dsl()).toContain('range {')
      expect(dsl()).toContain('note {')
    })

    it('serializes non-default player type', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical
      config._base.layout.value = { ...config._base.layout.value, playerType: 'progress-bar' }

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('player = "progress-bar"')
    })

    it('omits player when it is the default buttons', () => {
      const config = useChartConfig()
      config.chartType.value = ChartType.BarVertical

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).not.toContain('player =')
    })

    it('player type round-trips through DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  player = "dot-stepper"
}`)

      const config = useChartConfig()
      expect(config.layout.value.playerType).toBe('dot-stepper')

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('player = "dot-stepper"')
    })

    it('scene annotation round-trip through DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    annotation "X" {
      text = "Hello"
      showArrow = true
    }
    range {
      start = 10
      end = 90
    }
    note {
      text = "Note"
      x = 50
      y = 25
    }
  }
}`)

      const { generateDsl: dsl } = useDslOutput()
      expect(dsl()).toContain('annotation "X"')
      expect(dsl()).not.toContain('id =')
      expect(dsl()).toContain('text = "Hello"')
      expect(dsl()).toContain('showArrow = true')
      expect(dsl()).toContain('range {')
      expect(dsl()).toContain('start = 10')
      expect(dsl()).toContain('end = 90')
      expect(dsl()).toContain('note {')
      expect(dsl()).toContain('text = "Note"')
      expect(dsl()).toContain('x = 50')
      expect(dsl()).toContain('y = 25')
    })

    it('scene annotation round-trip omits id and visibility verbs', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  annotation "Base" {
    text = "Base ann"
  }
  range {
    start = 0
    end = 100
  }

  scene {
    annotation "Extra" {
      text = "Extra"
    }
  }
}`)

      const { generateDsl: dsl } = useDslOutput()
      // Base annotations should be present
      expect(dsl()).toContain('annotation "Base"')
      expect(dsl()).toContain('range {')
      // No id or visibility verbs
      expect(dsl()).not.toMatch(/\bid =/)
      expect(dsl()).not.toContain('hide-')
      expect(dsl()).not.toContain('show-')
    })
  })
})
