import { describe, it, expect, beforeEach } from 'vitest'
import type { RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useDslSync } from './useDslSync'
import { useChartTypeOptions } from './useChartTypeOptions'

describe('useDslSync', () => {
  beforeEach(() => {
    useChartConfig().reset()
    useChartTypeOptions().reset()
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
    expect(config.chartType.value).toBe('bar-horizontal')
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
    expect(config.sort.value).toBe('ascending')
  })

  it('resets sort to none when not present', () => {
    const config = useChartConfig()
    config.sort.value = 'descending'

    const { applyDsl } = useDslSync()
    applyDsl(`chart bar-vertical {
}
`)

    expect(config.sort.value).toBe('none')
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

  it('applies highlights', () => {
    const { applyDsl } = useDslSync()
    applyDsl(`chart bar-vertical {
  highlight "Q3" {
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
    expect(config.highlights.value).toHaveLength(1)
    expect(config.highlights.value[0].target).toBe('Q3')
    expect(config.highlights.value[0].color).toBe('#ff0000')
    expect(config.highlights.value[0].label).toBe('Peak')
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
  areafill "SeriesA" "SeriesB" {
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

    it('clears annotations when not present', () => {
      const config = useChartConfig()
      config.annotations.value = [{ kind: 'point', target: 'x', text: 'y' }]

      const { applyDsl } = useDslSync()
      applyDsl(`chart line {
}`)

      expect(config.annotations.value).toEqual([])
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
})
