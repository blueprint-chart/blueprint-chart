import { describe, it, expect, beforeEach } from 'vitest'
import { useChartConfig } from './useChartConfig'
import { useDslSync } from './useDslSync'
import { useChartTypeOptions } from './useChartTypeOptions'

function resetState() {
  useChartConfig().reset()
  useChartTypeOptions().reset()
}

beforeEach(() => {
  resetState()
})

describe('useDslSync basic parsing', () => {
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
    assertBasicDsl()
  })
})

describe('useDslSync sort', () => {
  it('applies sort value', () => {
    useDslSync().applyDsl('chart bar-vertical {\n  sort = ascending\n}\n')
    expect(useChartConfig().sort.value).toBe('ascending')
  })

  it('resets sort to none when not present', () => {
    useChartConfig().sort.value = 'descending'
    useDslSync().applyDsl('chart bar-vertical {\n}\n')
    expect(useChartConfig().sort.value).toBe('none')
  })
})

describe('useDslSync field clearing', () => {
  it('clears fields not present in DSL', () => {
    const config = useChartConfig()
    config.title.value = 'Old title'
    config.byline.value = 'Old byline'
    useDslSync().applyDsl('chart line {\n  title = "New title"\n}\n')
    expect(config.title.value).toBe('New title')
    expect(config.byline.value).toBe('')
  })

  it('returns error on invalid DSL', () => {
    const result = useDslSync().applyDsl('this is not valid dsl')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('useDslSync data values', () => {
  it('handles percentage values in data', () => {
    useDslSync().applyDsl('chart donut {\n  data {\n    "Slice A" = 40%\n    "Slice B" = 60%\n  }\n}\n')
    const config = useChartConfig()
    expect(config.data.value).toContain('"Slice A" = 40%')
    expect(config.data.value).toContain('"Slice B" = 60%')
  })
})

describe('useDslSync highlights', () => {
  it('applies highlights', () => {
    useDslSync().applyDsl(`chart bar-vertical {
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
})

describe('useDslSync boolean keys', () => {
  it('parses valueLabels', () => {
    useDslSync().applyDsl('chart bar-vertical {\n  valueLabels = true\n}')
    expect(useChartTypeOptions().currentOptions.value.valueLabels).toBe(true)
  })

  it('parses tooltips', () => {
    useDslSync().applyDsl('chart line {\n  tooltips = true\n}')
    expect(useChartTypeOptions().currentOptions.value.tooltips).toBe(true)
  })

  it('parses crosshair', () => {
    useDslSync().applyDsl('chart line {\n  crosshair = true\n}')
    expect(useChartTypeOptions().currentOptions.value.crosshair).toBe(true)
  })

  it('parses lineSymbols', () => {
    useDslSync().applyDsl('chart line {\n  lineSymbols = true\n}')
    expect(useChartTypeOptions().currentOptions.value.lineSymbols).toBe(true)
  })
})

describe('useDslSync string keys', () => {
  it('parses valueLabelPosition', () => {
    useDslSync().applyDsl('chart bar-vertical {\n  valueLabelPosition = "inside"\n}')
    expect(useChartTypeOptions().currentOptions.value.valueLabelPosition).toBe('inside')
  })

  it('parses crosshairDirection', () => {
    useDslSync().applyDsl('chart line {\n  crosshairDirection = "vertical"\n}')
    expect(useChartTypeOptions().currentOptions.value.crosshairDirection).toBe('vertical')
  })

  it('parses lineSymbolShape', () => {
    useDslSync().applyDsl('chart line {\n  lineSymbolShape = "diamond"\n}')
    expect(useChartTypeOptions().currentOptions.value.lineSymbolShape).toBe('diamond')
  })

  it('parses verticalScaleType', () => {
    useDslSync().applyDsl('chart line {\n  verticalScaleType = "log"\n}')
    expect(useChartTypeOptions().currentOptions.value.verticalScaleType).toBe('log')
  })
})

describe('useDslSync number keys', () => {
  it('parses lineSymbolSize as string', () => {
    useDslSync().applyDsl('chart line {\n  lineSymbolSize = "5"\n}')
    expect(useChartTypeOptions().currentOptions.value.lineSymbolSize).toBe('5')
  })

  it('parses verticalRangeMin', () => {
    useDslSync().applyDsl('chart line {\n  verticalRangeMin = "0"\n}')
    expect(useChartTypeOptions().currentOptions.value.verticalRangeMin).toBe('0')
  })

  it('parses verticalRangeMax', () => {
    useDslSync().applyDsl('chart line {\n  verticalRangeMax = "100"\n}')
    expect(useChartTypeOptions().currentOptions.value.verticalRangeMax).toBe('100')
  })

  it('parses lineSymbolOpacity as string', () => {
    useDslSync().applyDsl('chart line {\n  lineSymbolOpacity = "0.5"\n}')
    expect(useChartTypeOptions().currentOptions.value.lineSymbolOpacity).toBe('0.5')
  })
})

describe('useDslSync area fills', () => {
  it('parses area fills from DSL', () => {
    useDslSync().applyDsl(`chart line {
  areafill "SeriesA" "SeriesB" {
    color = "#ff0000"
    negativeColor = "#0000ff"
    opacity = 0.5
    interpolation = "monotoneX"
  }
}`)
    assertAreaFill()
  })

  it('clears area fills when not present', () => {
    useChartConfig().areaFills.value = [{ from: 'a', to: 'b' }]
    useDslSync().applyDsl('chart line {\n}')
    expect(useChartConfig().areaFills.value).toEqual([])
  })
})

describe('useDslSync annotations', () => {
  it('parses annotations from DSL', () => {
    useDslSync().applyDsl(`chart line {
  annotation "2024-Q1" {
    text = "Peak"
    dx = 10
    dy = 20
    showArrow = true
  }
}`)
    assertAnnotation()
  })

  it('clears annotations when not present', () => {
    useChartConfig().annotations.value = [{ target: 'x', text: 'y' }]
    useDslSync().applyDsl('chart line {\n}')
    expect(useChartConfig().annotations.value).toEqual([])
  })
})

describe('useDslSync series overrides', () => {
  it('parses series overrides from DSL', () => {
    useDslSync().applyDsl(buildSeriesOverrideDsl())
    assertSeriesOverride()
  })

  it('clears series overrides when not present', () => {
    useChartConfig().seriesOverrides.value = [{ name: 'x' }]
    useDslSync().applyDsl('chart line {\n}')
    expect(useChartConfig().seriesOverrides.value).toEqual([])
  })
})

function assertBasicDsl() {
  const config = useChartConfig()
  expect(config.chartType.value).toBe('bar-horizontal')
  expect(config.title.value).toBe('Revenue')
  expect(config.description.value).toBe('Quarterly revenue')
  expect(config.source.value).toBe('Finance dept')
  expect(config.data.value).toContain('"Q1" = 100')
  expect(config.data.value).toContain('"Q2" = 200')
}

function assertAreaFill() {
  const af = useChartConfig().areaFills.value
  expect(af).toHaveLength(1)
  expect(af[0].from).toBe('SeriesA')
  expect(af[0].to).toBe('SeriesB')
  expect(af[0].color).toBe('#ff0000')
  expect(af[0].negativeColor).toBe('#0000ff')
  expect(af[0].opacity).toBe(0.5)
  expect(af[0].interpolation).toBe('monotoneX')
}

function assertAnnotation() {
  const a = useChartConfig().annotations.value
  expect(a).toHaveLength(1)
  expect(a[0].target).toBe('2024-Q1')
  expect(a[0].text).toBe('Peak')
  expect(a[0].dx).toBe(10)
  expect(a[0].dy).toBe(20)
  expect(a[0].showArrow).toBe(true)
}

function buildSeriesOverrideDsl(): string {
  return `chart line-multi {
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
}`
}

function assertSeriesOverride() {
  const s = useChartConfig().seriesOverrides.value
  expect(s).toHaveLength(1)
  expect(s[0].name).toBe('Revenue')
  expect(s[0].color).toBe('#ff0000')
  expect(s[0].lineWidth).toBe(2)
  expect(s[0].dash).toBe('4,2')
  expect(s[0].interpolation).toBe('monotoneX')
  expect(s[0].labelMode).toBe('direct')
  expect(s[0].labelText).toBe('Rev')
  expect(s[0].valueLabels).toBe(true)
  expect(s[0].lineSymbols).toBe(true)
  expect(s[0].hidden).toBe(false)
  expect(s[0].symbolShape).toBe('diamond')
  expect(s[0].symbolShowOn).toBe('all')
  expect(s[0].symbolStyle).toBe('hollow')
  expect(s[0].symbolSize).toBe(5)
  expect(s[0].symbolOpacity).toBe(0.8)
}
