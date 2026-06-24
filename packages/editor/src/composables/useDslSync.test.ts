import type { RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { ChartType, SortDirection } from '@blueprint-chart/lib'
import { TransformType } from '@/enums'
import { useChartConfig } from './useChartConfig'
import { useDslSync } from './useDslSync'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useDslOutput } from './useDslOutput'
import { useScenes } from './useScenes'
import { resolveScene, resolveSortFromTransforms } from './useChartPreview'

describe('useDslSync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useChartConfig().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
  })

  it('applies a basic DSL string to config', () => {
    const { applyDsl } = useDslSync()
    const result = applyDsl(`chart bar-horizontal {
  title = "Revenue"
  description = "Quarterly revenue"
  source = "Finance dept"

  data {
    "Q1" = 100
    "Q2" = 200
  }
}
`)

    expect(result.success).toBe(true)

    const config = useChartConfig()
    expect(config.chartType.value).toBe(ChartType.BarHorizontal)
    expect(config.title.value).toBe('Revenue')
    expect(config.description.value).toBe('Quarterly revenue')
    expect(config.source.value).toBe('Finance dept')
    expect(config.data.value).toContain('"Q1" = 100')
    expect(config.data.value).toContain('"Q2" = 200')
  })

  it('applies sort value', () => {
    const { applyDsl } = useDslSync()
    applyDsl(`chart bar-vertical {
  sort = ascending
}
`)

    const config = useChartConfig()
    expect(config.sort.value).toBe(SortDirection.Ascending)
  })

  it('resets sort to none when not present', () => {
    const config = useChartConfig()
    config.sort.value = SortDirection.Descending

    const { applyDsl } = useDslSync()
    applyDsl(`chart bar-vertical {
}
`)

    expect(config.sort.value).toBe(SortDirection.None)
  })

  it('clears fields not present in DSL', () => {
    const config = useChartConfig()
    config.title.value = 'Old title'
    config.byline.value = 'Old byline'

    const { applyDsl } = useDslSync()
    applyDsl(`chart line {
  title = "New title"
}
`)

    expect(config.title.value).toBe('New title')
    expect(config.byline.value).toBe('')
  })

  it('returns error on invalid DSL', () => {
    const { applyDsl } = useDslSync()
    const result = applyDsl('this is not valid dsl')

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns a structured location on a syntax error', () => {
    const { applyDsl } = useDslSync()
    const result = applyDsl('!!!')
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(typeof result.location?.line).toBe('number')
    expect(typeof result.location?.column).toBe('number')
  })

  it('handles percentage values in data', () => {
    const { applyDsl } = useDslSync()
    applyDsl(`chart donut {
  data {
    "Slice A" = 40%
    "Slice B" = 60%
  }
}
`)

    const config = useChartConfig()
    expect(config.data.value).toContain('"Slice A" = 40%')
    expect(config.data.value).toContain('"Slice B" = 60%')
  })

  it('applies colorizes', () => {
    const { applyDsl } = useDslSync()
    applyDsl(`chart bar-vertical {
  colorize "Q3" {
    color = "#ff0000"
    label = "Peak"
  }

  data {
    "Q1" = 10
    "Q3" = 30
  }
}
`)

    const config = useChartConfig()
    expect(config.colorizes.value).toHaveLength(1)
    expect(config.colorizes.value[0].target).toBe('Q3')
    expect(config.colorizes.value[0].color).toBe('#ff0000')
    expect(config.colorizes.value[0].label).toBe('Peak')
  })

  describe('new boolean keys', () => {
    it('parses valueLabels', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-vertical {
  valueLabels = true
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.valueLabels).toBe(true)
    })

    it('parses tooltips', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  tooltips = true
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.tooltips).toBe(true)
    })

    it('parses crosshair', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  crosshair = true
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.crosshair).toBe(true)
    })

    it('parses lineSymbols', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  lineSymbols = true
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.lineSymbols).toBe(true)
    })
  })

  describe('new string keys', () => {
    it('parses valueLabelPosition', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-vertical {
  valueLabelPosition = "inside"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.valueLabelPosition).toBe('inside')
    })

    it('parses crosshairDirection', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  crosshairDirection = "vertical"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.crosshairDirection).toBe('vertical')
    })

    it('parses lineSymbolShape', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  lineSymbolShape = "diamond"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.lineSymbolShape).toBe('diamond')
    })

    it('parses verticalScaleType', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  verticalScaleType = "log"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.verticalScaleType).toBe('log')
    })
  })

  describe('barGap persistence', () => {
    it('parses barGap from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-vertical {
  barGap = "25"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.barGap).toBe('25')
    })

    it('falls back to default barGap (60) when DSL omits barGap', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-vertical {
  title = "no-gap chart"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.barGap).toBe('60')
    })

    it('serializes an explicit barGap into the DSL output', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-vertical {
  barGap = "42"
}`)
      const { generateDsl } = useDslOutput()
      expect(generateDsl()).toContain('barGap = "42"')
    })

    it('round-trips barGap through parse → serialize → parse', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  barGap = "77"
}`)

      const { generateDsl } = useDslOutput()
      const output = generateDsl()
      expect(output).toContain('barGap = "77"')

      const result = applyDsl(output)
      expect(result.success).toBe(true)

      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.barGap).toBe('77')
    })

    it('round-trips default barGap (60) when DSL input omits it', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-vertical {
  title = "legacy chart"
}`)

      const { generateDsl } = useDslOutput()
      const output = generateDsl()

      const result = applyDsl(output)
      expect(result.success).toBe(true)

      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.barGap).toBe('60')
    })
  })

  describe('number keys', () => {
    it('parses lineSymbolSize as string', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  lineSymbolSize = "5"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.lineSymbolSize).toBe('5')
    })

    it('parses verticalRangeMin', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  verticalRangeMin = "0"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.verticalRangeMin).toBe('0')
    })

    it('parses verticalRangeMax', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  verticalRangeMax = "100"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.verticalRangeMax).toBe('100')
    })

    it('parses lineSymbolOpacity as string', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  lineSymbolOpacity = "0.5"
}`)
      const { currentOptions } = useChartTypeOptions()
      expect(currentOptions.value.lineSymbolOpacity).toBe('0.5')
    })
  })

  describe('area fills', () => {
    it('parses area fills from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  area-fill "SeriesA" "SeriesB" {
    color = "#ff0000"
    negativeColor = "#0000ff"
    opacity = 0.5
    interpolation = "monotoneX"
  }
}`)

      const config = useChartConfig()
      expect(config.areaFills.value).toHaveLength(1)
      expect(config.areaFills.value[0].from).toBe('SeriesA')
      expect(config.areaFills.value[0].to).toBe('SeriesB')
      expect(config.areaFills.value[0].color).toBe('#ff0000')
      expect(config.areaFills.value[0].negativeColor).toBe('#0000ff')
      expect(config.areaFills.value[0].opacity).toBe(0.5)
      expect(config.areaFills.value[0].interpolation).toBe('monotoneX')
    })

    it('clears area fills when not present', () => {
      const config = useChartConfig()
      config.areaFills.value = [{ from: 'a', to: 'b' }]

      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
}`)

      expect(config.areaFills.value).toEqual([])
    })
  })

  describe('annotations', () => {
    it('parses point annotations from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  annotation "2024-Q1" {
    text = "Peak"
    anchorDirection = NE
    textOffsetX = 30
    textOffsetY = -40
    showArrow = true
  }
}`)

      const config = useChartConfig()
      expect(config.annotations.value).toHaveLength(1)
      const ann = config.annotations.value[0]
      expect(ann.kind).toBe('point')
      expect('target' in ann && ann.target).toBe('2024-Q1')
      expect(ann.text).toBe('Peak')
      expect('anchorDirection' in ann && ann.anchorDirection).toBe('NE')
      expect('textOffsetX' in ann && ann.textOffsetX).toBe(30)
      expect('textOffsetY' in ann && ann.textOffsetY).toBe(-40)
      expect('showArrow' in ann && ann.showArrow).toBe(true)
    })

    it('parses range annotations from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  range {
    start = 100
    end = 200
    orientation = vertical
    bgColor = "#d3d3d3"
    bgOpacity = 15
  }
}`)

      const config = useChartConfig()
      expect(config.annotations.value).toHaveLength(1)
      const ann = config.annotations.value[0]
      expect(ann.kind).toBe('range')
      const range = ann as RangeAnnotationConfig
      expect(range.start).toBe(100)
      expect(range.end).toBe(200)
      expect(range.orientation).toBe('vertical')
      expect(range.bgColor).toBe('#d3d3d3')
      expect(range.bgOpacity).toBe(15)
    })

    it('parses free annotations (note) from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  note {
    text = "Context"
    x = 50
    y = 25
  }
}`)

      const config = useChartConfig()
      expect(config.annotations.value).toHaveLength(1)
      const ann = config.annotations.value[0]
      expect(ann.kind).toBe('free')
      const free = ann as FreeAnnotationConfig
      expect(free.text).toBe('Context')
      expect(free.x).toBe(50)
      expect(free.y).toBe(25)
    })

    it('parses free annotation with px position from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  note {
    text = "Pixel"
    x = "120px"
    y = "80px"
  }
}`)

      const config = useChartConfig()
      const free = config.annotations.value[0] as FreeAnnotationConfig
      expect(free.x).toBe('120px')
      expect(free.y).toBe('80px')
    })

    it('parses annotation with repeat = true from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  annotation "2024-Q1" {
    text = "Hello"
    repeat = true
  }
}`)

      const config = useChartConfig()
      expect(config.annotations.value).toHaveLength(1)
      const ann = config.annotations.value[0]
      expect(ann.repeat).toBe('always')
    })

    it('parses annotation with repeat = 3 from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  annotation "2024-Q1" {
    text = "Hello"
    repeat = 3
  }
}`)

      const config = useChartConfig()
      expect(config.annotations.value).toHaveLength(1)
      const ann = config.annotations.value[0]
      expect(ann.repeat).toBe(3)
    })

    it('clears annotations when not present', () => {
      const config = useChartConfig()
      config.annotations.value = [{ kind: 'point', target: 'x', text: 'y' }]

      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
}`)

      expect(config.annotations.value).toEqual([])
    })
  })

  describe('scene annotations', () => {
    it('parses point annotation in scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    annotation "X" {
      text = "Hello"
      showArrow = true
    }
  }
}`)

      const scenes = useScenes()
      expect(scenes.scenes.value).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      const ann = scenes.scenes.value[0].annotations![0]
      expect(ann.kind).toBe('point')
      expect(ann.text).toBe('Hello')
      expect('showArrow' in ann && ann.showArrow).toBe(true)
    })

    it('parses range annotation in scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    range {
      start = 10
      end = 90
      bgColor = "#ccc"
    }
  }
}`)

      const scenes = useScenes()
      expect(scenes.scenes.value).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      const ann = scenes.scenes.value[0].annotations![0]
      expect(ann.kind).toBe('range')
      const range = ann as RangeAnnotationConfig
      expect(range.start).toBe(10)
      expect(range.end).toBe(90)
      expect(range.bgColor).toBe('#ccc')
    })

    it('parses free annotation in scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    note {
      text = "Note"
      x = 50
      y = 25
    }
  }
}`)

      const scenes = useScenes()
      expect(scenes.scenes.value).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      const ann = scenes.scenes.value[0].annotations![0]
      expect(ann.kind).toBe('free')
      const free = ann as FreeAnnotationConfig
      expect(free.text).toBe('Note')
      expect(free.x).toBe(50)
      expect(free.y).toBe(25)
    })

    it('parses point annotation with all properties in scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    annotation "X" {
      text = "Full"
      anchorDirection = NE
      textOffsetX = 10
      textOffsetY = -20
      lineStyle = "curve-left"
      lineWeight = 2
      showLine = true
      showCircle = true
      circleSize = 6
      circleStyle = "dashed"
      circleColor = "#f00"
      textColor = "#333"
      textOutline = true
      maxWidth = 120
      lineTargetDistance = 5
      showArrow = true
    }
  }
}`)

      const scenes = useScenes()
      const ann = scenes.scenes.value[0].annotations![0]
      expect(ann.kind).toBe('point')
      expect(ann.text).toBe('Full')
      expect('anchorDirection' in ann && ann.anchorDirection).toBe('NE')
      expect('textOffsetX' in ann && ann.textOffsetX).toBe(10)
      expect('textOffsetY' in ann && ann.textOffsetY).toBe(-20)
      expect('lineStyle' in ann && ann.lineStyle).toBe('curve-left')
      expect('lineWeight' in ann && ann.lineWeight).toBe(2)
      expect('showLine' in ann && ann.showLine).toBe(true)
      expect('showCircle' in ann && ann.showCircle).toBe(true)
      expect('circleSize' in ann && ann.circleSize).toBe(6)
      expect('circleStyle' in ann && ann.circleStyle).toBe('dashed')
      expect('circleColor' in ann && ann.circleColor).toBe('#f00')
      expect('textColor' in ann && ann.textColor).toBe('#333')
      expect('textOutline' in ann && ann.textOutline).toBe(true)
      expect('maxWidth' in ann && ann.maxWidth).toBe(120)
      expect('lineTargetDistance' in ann && ann.lineTargetDistance).toBe(5)
      expect('showArrow' in ann && ann.showArrow).toBe(true)
    })

    it('parses range annotation with all properties in scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    range {
      start = 5
      end = 95
      orientation = horizontal
      startAnchor = "start"
      endAnchor = "end"
      bgColor = "#ddd"
      bgOpacity = 20
      direction = N
      textColor = "#111"
    }
  }
}`)

      const scenes = useScenes()
      const ann = scenes.scenes.value[0].annotations![0] as RangeAnnotationConfig
      expect(ann.kind).toBe('range')
      expect(ann.start).toBe(5)
      expect(ann.end).toBe(95)
      expect(ann.orientation).toBe('horizontal')
      expect(ann.startAnchor).toBe('start')
      expect(ann.endAnchor).toBe('end')
      expect(ann.bgColor).toBe('#ddd')
      expect(ann.bgOpacity).toBe(20)
      expect(ann.direction).toBe('N')
      expect(ann.textColor).toBe('#111')
    })

    it('parses free annotation with all properties in scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    note {
      text = "Full note"
      x = 10
      y = 80
      textColor = "#222"
      maxWidth = 200
      textOutline = true
    }
  }
}`)

      const scenes = useScenes()
      const ann = scenes.scenes.value[0].annotations![0] as FreeAnnotationConfig
      expect(ann.kind).toBe('free')
      expect(ann.text).toBe('Full note')
      expect(ann.x).toBe(10)
      expect(ann.y).toBe(80)
      expect(ann.textColor).toBe('#222')
      expect(ann.maxWidth).toBe(200)
      expect(ann.textOutline).toBe(true)
    })

    it('parses scene with base and scene annotations', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  annotation "Base" {
    text = "Base ann"
  }

  scene {
    annotation "SceneOnly" {
      text = "Scene ann"
    }
  }
}`)

      const config = useChartConfig()
      const scenes = useScenes()
      expect(config._base.annotations.value).toHaveLength(1)
      expect(config._base.annotations.value[0].text).toBe('Base ann')
      expect(scenes.scenes.value).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations![0].text).toBe('Scene ann')
    })

    it('scene annotations do not leak into base config', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
  scene {
    annotation "X" {
      text = "Hello"
    }
  }
}`)

      const config = useChartConfig()
      expect(config._base.annotations.value).toEqual([])

      const scenes = useScenes()
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
    })
  })

  describe('base + scene annotation merging end-to-end', () => {
    it('DSL round-trip preserves base + scene annotations', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  annotation "Japan" {
    text = "Japan note"
  }

  scene {
    annotation "India" {
      text = "India note"
    }
  }

  scene {
    highlight "China" {
      color = "#9900ef"
    }
  }
}`)

      // Serialize back to DSL
      const { generateDsl } = useDslOutput()
      const output = generateDsl()

      // Base annotation must be in the base section (before any scene block)
      const baseSection = output.split('scene {')[0]
      expect(baseSection).toContain('annotation "Japan"')

      // Scene 0 must have its own annotation
      const sceneBlocks = output.split('scene {').slice(1)
      expect(sceneBlocks[0]).toContain('annotation "India"')

      // Re-parse the output
      const result = applyDsl(output)
      expect(result.success).toBe(true)

      const config = useChartConfig()
      const scenes = useScenes()

      expect(config._base.annotations.value).toHaveLength(1)
      expect(config._base.annotations.value[0].text).toBe('Japan note')
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations![0].text).toBe('India note')
    })

    it('base annotation + scene annotation both visible at later scene', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  annotation "Japan" {
    text = "Japan note"
    showLine = true
    showArrow = true
  }

  scene {
    annotation "India" {
      text = "India note"
      showLine = true
      showArrow = true
    }
  }

  scene {
    highlight "China" {
      color = "#9900ef"
    }
  }
}`)

      const config = useChartConfig()
      const scenes = useScenes()

      // Base should have Japan annotation
      expect(config._base.annotations.value).toHaveLength(1)
      expect(config._base.annotations.value[0].text).toBe('Japan note')

      // Scene 0 should have India annotation
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations![0].text).toBe('India note')

      // Scene 1 has no annotations of its own
      expect(scenes.scenes.value[1].annotations).toBeUndefined()

      // resolveScene at scene 1 cascades scene 0's annotations
      const resolved = resolveScene(scenes.scenes.value, 1)!
      expect(resolved.annotations).toHaveLength(1)
      expect(resolved.annotations![0].text).toBe('India note')

      // Merged result (as the render does): base + cascaded scene annotations
      const base = config._base.annotations.value
      const sceneAnns = resolved.annotations ?? []
      const merged = [...base, ...sceneAnns]
      expect(merged).toHaveLength(2)
      expect(merged.map(a => a.text)).toEqual(['Japan note', 'India note'])
    })

    it('annotations remain after navigating to scene then serializing DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  annotation "Japan" {
    text = "Japan note"
  }

  scene {
    annotation "India" {
      text = "India note"
    }
  }

  scene {
    highlight "China" {
      color = "#9900ef"
    }
  }
}`)

      const config = useChartConfig()
      const scenes = useScenes()

      // Simulate navigating to scene 1
      scenes.setActive(1)

      // Verify base annotation is still accessible
      expect(config._base.annotations.value).toHaveLength(1)
      expect(config._base.annotations.value[0].text).toBe('Japan note')

      // Verify scene 0's annotation is still there
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations![0].text).toBe('India note')

      // Serialize DSL while scene 1 is active
      const { generateDsl } = useDslOutput()
      const output = generateDsl()

      // Base annotation must survive
      expect(output).toContain('annotation "Japan"')

      // Scene 0 annotation must survive
      expect(output).toContain('annotation "India"')

      // Re-parse and verify nothing was lost
      scenes.setActive(-1)
      const result = applyDsl(output)
      expect(result.success).toBe(true)

      expect(config._base.annotations.value).toHaveLength(1)
      expect(config._base.annotations.value[0].text).toBe('Japan note')
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations![0].text).toBe('India note')
    })

    it('real-world DSL: both annotations visible at scene 1 via resolveVisibleAnnotations', () => {
      const { applyDsl } = useDslSync()
      const result = applyDsl(`chart bar-horizontal {
  title = "Internet Users by Country"
  description = "Millions of users, 2024"
  source = "ITU / World Bank"

  data {
    "China" = 1050
    "India" = 900
    "United States" = 312
    "Japan" = 118
  }

  annotation "Japan" {
    text = "Japan annotation"
    showLine = true
    showArrow = true
  }

  scene {
    highlight "India" {
      color = "#9900ef"
    }

    annotation "India" {
      text = "India annotation"
      showLine = true
      showArrow = true
    }
  }

  scene {
    highlight "China" {
      color = "#9900ef"
    }
  }
}`)

      expect(result.success).toBe(true)

      const config = useChartConfig()
      const scenes = useScenes()

      // Verify parsing
      expect(config._base.annotations.value).toHaveLength(1)
      expect(config._base.annotations.value[0]).toMatchObject({ kind: 'point', target: 'Japan' })

      expect(scenes.scenes.value).toHaveLength(2)
      expect(scenes.scenes.value[0].annotations).toHaveLength(1)
      expect(scenes.scenes.value[0].annotations![0]).toMatchObject({ kind: 'point', target: 'India' })

      expect(scenes.scenes.value[1].annotations).toBeUndefined()

      // Simulate navigating to scene 1 (the last scene)
      scenes.setActive(1)

      // resolveScene should cascade scene 0's India annotation to scene 1
      const resolved = resolveScene(scenes.scenes.value, 1)!
      expect(resolved).not.toBeNull()
      expect(resolved.annotations).toHaveLength(1)
      expect(resolved.annotations![0]).toMatchObject({ kind: 'point', target: 'India' })

      // Simulate what the render function does via resolveVisibleAnnotations:
      // Both base (Japan) and cascaded scene 0 (India) annotations must be present at scene 1
      const baseAnnotations = config._base.annotations.value
      const mergedAnnotations = [...baseAnnotations, ...(resolved.annotations ?? [])]
      expect(mergedAnnotations).toHaveLength(2)
      expect(mergedAnnotations[0]).toMatchObject({ kind: 'point', target: 'Japan' })
      expect(mergedAnnotations[1]).toMatchObject({ kind: 'point', target: 'India' })
    })
  })

  describe('series overrides', () => {
    it('parses series overrides from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart line-multi {
  series "Revenue" {
    color = "#ff0000"
    lineWidth = 2
    dash = "4,2"
    interpolation = "monotoneX"
    labelMode = "direct"
    labelText = "Rev"
    valueLabels = true
    lineSymbols = true
    hidden = false
    symbolShape = "diamond"
    symbolShowOn = "all"
    symbolStyle = "hollow"
    symbolSize = 5
    symbolOpacity = 0.8
  }
}`)

      const config = useChartConfig()
      expect(config.seriesOverrides.value).toHaveLength(1)
      const s = config.seriesOverrides.value[0]
      expect(s.name).toBe('Revenue')
      expect(s.color).toBe('#ff0000')
      expect(s.lineWidth).toBe(2)
      expect(s.dash).toBe('4,2')
      expect(s.interpolation).toBe('monotoneX')
      expect(s.labelMode).toBe('direct')
      expect(s.labelText).toBe('Rev')
      expect(s.valueLabels).toBe(true)
      expect(s.lineSymbols).toBe(true)
      expect(s.hidden).toBe(false)
      expect(s.symbolShape).toBe('diamond')
      expect(s.symbolShowOn).toBe('all')
      expect(s.symbolStyle).toBe('hollow')
      expect(s.symbolSize).toBe(5)
      expect(s.symbolOpacity).toBe(0.8)
    })

    it('clears series overrides when not present', () => {
      const config = useChartConfig()
      config.seriesOverrides.value = [{ name: 'x' }]

      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
}`)

      expect(config.seriesOverrides.value).toEqual([])
    })
  })

  describe('player type', () => {
    it('parses player type from DSL', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  player = "progress-bar"
}`)

      const config = useChartConfig()
      expect(config.layout.value.playerType).toBe('progress-bar')
    })

    it('defaults to buttons when player not specified', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
}`)

      const config = useChartConfig()
      expect(config.layout.value.playerType).toBe('buttons')
    })

    it('ignores invalid player type', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  player = "invalid-type"
}`)

      const config = useChartConfig()
      expect(config.layout.value.playerType).toBe('buttons')
    })
  })

  describe('scene sort transform inheritance', () => {
    it('sort transform from scene 1 cascades to scene 2 via resolveScene', () => {
      const { applyDsl } = useDslSync()
      const result = applyDsl(`chart bar-horizontal {
  data {
    "China" = 1050
    "India" = 900
    "United States" = 312
  }

  scene {
    crosshair = true

    highlight "India" {
      color = "#00d084"
    }

    transform sort {
      columns = "value"
      direction = "ascending"
    }
  }

  scene {
    highlight "India" {
      color = "#9900ef"
    }
  }
}`)
      expect(result.success).toBe(true)

      const scenes = useScenes()
      expect(scenes.scenes.value).toHaveLength(2)

      // Scene 1 should have the sort transform
      expect(scenes.scenes.value[0].transforms).toHaveLength(1)
      expect(scenes.scenes.value[0].transforms![0].type).toBe(TransformType.Sort)
      expect(scenes.scenes.value[0].transforms![0].config.direction).toBe(SortDirection.Ascending)

      // Scene 2 should NOT have its own transforms
      expect(scenes.scenes.value[1].transforms).toBeUndefined()

      // resolveScene for Scene 2 should inherit transforms from Scene 1
      const resolved = resolveScene(scenes.scenes.value, 1)!
      expect(resolved.transforms).toBeDefined()
      expect(resolved.transforms).toHaveLength(1)
      expect(resolved.transforms![0].type).toBe(TransformType.Sort)

      // resolveSortFromTransforms should extract 'ascending'
      expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Ascending)
    })

    it('base sort is none when sort only exists as scene transform', () => {
      const { applyDsl } = useDslSync()
      applyDsl(`chart bar-horizontal {
  data {
    "A" = 10
  }

  scene {
    transform sort {
      columns = "value"
      direction = "ascending"
    }
  }
}`)

      const config = useChartConfig()
      // Base sort should be 'none' since sort is only in scene transform
      expect(config.sort.value).toBe(SortDirection.None)
    })

    it('sort transform without direction defaults to ascending and cascades', () => {
      const { applyDsl } = useDslSync()
      const result = applyDsl(`chart bar-horizontal {
  data {
    "China" = 1050
    "India" = 900
    "United States" = 312
    "Indonesia" = 213
    "Brazil" = 186
    "Russia" = 130
    "Japan" = 118
    "Nigeria" = 110
  }

  scene {
    tooltips = true
    crosshair = true

    highlight "India" {
      color = "#00d084"
    }

    transform sort {
      columns = "value"
    }
  }

  scene {
    highlight "India" {
      color = "#9900ef"
    }
  }
}`)
      expect(result.success).toBe(true)

      const scenes = useScenes()
      // Scene 1 has the sort transform (no direction property)
      expect(scenes.scenes.value[0].transforms).toHaveLength(1)
      expect(scenes.scenes.value[0].transforms![0].type).toBe(TransformType.Sort)
      expect(scenes.scenes.value[0].transforms![0].config.direction).toBeUndefined()

      // Scene 2 inherits transforms via resolveScene
      const resolved = resolveScene(scenes.scenes.value, 1)!
      expect(resolved.transforms).toHaveLength(1)

      // resolveSortFromTransforms defaults to 'ascending' when no direction
      expect(resolveSortFromTransforms(resolved)).toBe(SortDirection.Ascending)
    })
  })
})
