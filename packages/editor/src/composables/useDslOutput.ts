import { computed, ref } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { getChartOptions } from '@blueprint-chart/lib'
import type { ChartHighlight, ChartAnnotation, ChartAreaFill } from './useChartConfig'
import type { SeriesOverride } from '@blueprint-chart/lib'

function emitProperties(config: ReturnType<typeof useChartConfig>): string {
  let output = ''
  if (config.title.value) {
    output += `  title = "${config.title.value}"\n`
  }
  if (config.description.value) {
    output += `  description = "${config.description.value}"\n`
  }
  if (config.byline.value) {
    output += `  byline = "${config.byline.value}"\n`
  }
  if (config.source.value) {
    output += `  source = "${config.source.value}"\n`
  }
  if (config.sourceUrl.value) {
    output += `  sourceUrl = "${config.sourceUrl.value}"\n`
  }
  if (config.sort.value !== 'none') {
    output += `  sort = ${config.sort.value}\n`
  }
  return output
}

function emitTypeOptions(
  chartType: string,
  opts: Record<string, unknown>,
  compact: boolean,
): string {
  let output = ''
  const optionDefs = getChartOptions(chartType)
  const supportedKeys = optionDefs.map(d => d.key)
  const defaultMap = new Map(optionDefs.filter(d => d.default !== undefined).map(d => [d.key, String(d.default)]))
  for (const key of supportedKeys) {
    const val = opts[key as keyof typeof opts]
    if (val === undefined) {
      continue
    }
    if (compact && defaultMap.has(key) && String(val) === defaultMap.get(key)) {
      continue
    }
    output += emitSingleOption(key, val)
  }
  return output
}

function emitSingleOption(key: string, val: unknown): string {
  if (key === 'colors' && Array.isArray(val) && val.length > 0) {
    return `  colors = "${val.join(', ')}"\n`
  }
  if (typeof val === 'boolean') {
    return `  ${key} = ${val}\n`
  }
  if (typeof val === 'string' && val !== '') {
    return `  ${key} = "${val}"\n`
  }
  return ''
}

function emitDataBlock(data: string): string {
  if (!data) {
    return ''
  }
  let output = '\n  data {\n'
  const lines = data.split('\n').map(l => l.trim()).filter(Boolean)
  output += lines.map(l => `    ${l}`).join('\n')
  output += '\n  }\n'
  return output
}

function emitHighlights(highlights: ChartHighlight[]): string {
  let output = ''
  for (const h of highlights) {
    if (!h.target) {
      continue
    }
    output += `\n  highlight "${h.target}" {\n`
    if (h.color) {
      output += `    color = "${h.color}"\n`
    }
    if (h.label) {
      output += `    label = "${h.label}"\n`
    }
    output += `  }\n`
  }
  return output
}

function emitAreaFills(areaFills: ChartAreaFill[]): string {
  let output = ''
  for (const af of areaFills) {
    if (!af.from || !af.to) {
      continue
    }
    output += `\n  areafill "${af.from}" "${af.to}" {\n`
    if (af.color) {
      output += `    color = "${af.color}"\n`
    }
    if (af.negativeColor) {
      output += `    negativeColor = "${af.negativeColor}"\n`
    }
    if (af.opacity !== undefined) {
      output += `    opacity = ${af.opacity}\n`
    }
    if (af.interpolation) {
      output += `    interpolation = "${af.interpolation}"\n`
    }
    output += `  }\n`
  }
  return output
}

function emitAnnotations(annotations: ChartAnnotation[]): string {
  let output = ''
  for (const a of annotations) {
    if (!a.target) {
      continue
    }
    output += `\n  annotation "${a.target}" {\n`
    if (a.text) {
      output += `    text = "${a.text}"\n`
    }
    if (a.dx !== undefined) {
      output += `    dx = ${a.dx}\n`
    }
    if (a.dy !== undefined) {
      output += `    dy = ${a.dy}\n`
    }
    if (a.showArrow !== undefined) {
      output += `    showArrow = ${a.showArrow}\n`
    }
    output += `  }\n`
  }
  return output
}

function emitSeriesOverrideProps(s: SeriesOverride): string {
  let output = ''
  if (s.color) {
    output += `    color = "${s.color}"\n`
  }
  if (s.lineWidth !== undefined) {
    output += `    lineWidth = ${s.lineWidth}\n`
  }
  if (s.dash) {
    output += `    dash = "${s.dash}"\n`
  }
  if (s.interpolation) {
    output += `    interpolation = "${s.interpolation}"\n`
  }
  if (s.labelMode) {
    output += `    labelMode = "${s.labelMode}"\n`
  }
  if (s.labelText) {
    output += `    labelText = "${s.labelText}"\n`
  }
  return output
}

function emitSeriesOverrideBooleans(s: SeriesOverride): string {
  let output = ''
  if (s.valueLabels !== undefined) {
    output += `    valueLabels = ${s.valueLabels}\n`
  }
  if (s.lineSymbols !== undefined) {
    output += `    lineSymbols = ${s.lineSymbols}\n`
  }
  if (s.hidden !== undefined) {
    output += `    hidden = ${s.hidden}\n`
  }
  return output
}

function emitSeriesOverrideSymbols(s: SeriesOverride): string {
  let output = ''
  if (s.symbolShape) {
    output += `    symbolShape = "${s.symbolShape}"\n`
  }
  if (s.symbolShowOn) {
    output += `    symbolShowOn = "${s.symbolShowOn}"\n`
  }
  if (s.symbolStyle) {
    output += `    symbolStyle = "${s.symbolStyle}"\n`
  }
  if (s.symbolSize !== undefined) {
    output += `    symbolSize = ${s.symbolSize}\n`
  }
  if (s.symbolOpacity !== undefined) {
    output += `    symbolOpacity = ${s.symbolOpacity}\n`
  }
  return output
}

function emitSeriesOverrides(overrides: SeriesOverride[]): string {
  let output = ''
  for (const s of overrides) {
    if (!s.name) {
      continue
    }
    output += `\n  series "${s.name}" {\n`
    output += emitSeriesOverrideProps(s)
    output += emitSeriesOverrideBooleans(s)
    output += emitSeriesOverrideSymbols(s)
    output += `  }\n`
  }
  return output
}

export function useDslOutput() {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const compact = ref(false)

  const dsl = computed(() => {
    let output = `chart ${config.chartType.value} {\n`
    output += emitProperties(config)
    output += emitTypeOptions(config.chartType.value, currentOptions.value, compact.value)
    output += emitDataBlock(config.data.value)
    output += emitHighlights(config.highlights.value)
    output += emitAreaFills(config.areaFills.value)
    output += emitAnnotations(config.annotations.value)
    output += emitSeriesOverrides(config.seriesOverrides.value)
    output += '}\n'
    return output
  })

  return { dsl, compact }
}
