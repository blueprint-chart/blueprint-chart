import { computed } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { getChartOptions } from '@blueprint-chart/lib'

export function useDslOutput() {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()

  const dsl = computed(() => {
    let output = `chart ${config.chartType.value} {\n`

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

    const supportedKeys = getChartOptions(config.chartType.value).map(d => d.key)
    const opts = currentOptions.value
    for (const key of supportedKeys) {
      const val = opts[key as keyof typeof opts]
      if (val === undefined) continue
      if (key === 'colors' && Array.isArray(val) && val.length > 0) {
        output += `  colors = "${val.join(', ')}"\n`
      }
      else if (typeof val === 'boolean') {
        output += `  ${key} = ${val}\n`
      }
      else if (typeof val === 'string' && val !== '') {
        output += `  ${key} = "${val}"\n`
      }
    }

    if (config.data.value) {
      output += '\n  data {\n'
      const lines = config.data.value
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
      output += lines.map(l => `    ${l}`).join('\n')
      output += '\n  }\n'
    }

    for (const h of config.highlights.value) {
      if (!h.target) continue
      output += `\n  highlight "${h.target}" {\n`
      if (h.color) output += `    color = "${h.color}"\n`
      if (h.label) output += `    label = "${h.label}"\n`
      output += `  }\n`
    }

    for (const af of config.areaFills.value) {
      if (!af.from || !af.to) continue
      output += `\n  areafill "${af.from}" "${af.to}" {\n`
      if (af.color) output += `    color = "${af.color}"\n`
      if (af.negativeColor) output += `    negativeColor = "${af.negativeColor}"\n`
      if (af.opacity !== undefined) output += `    opacity = ${af.opacity}\n`
      if (af.interpolation) output += `    interpolation = "${af.interpolation}"\n`
      output += `  }\n`
    }

    for (const a of config.annotations.value) {
      if (!a.target) continue
      output += `\n  annotation "${a.target}" {\n`
      if (a.text) output += `    text = "${a.text}"\n`
      if (a.dx !== undefined) output += `    dx = ${a.dx}\n`
      if (a.dy !== undefined) output += `    dy = ${a.dy}\n`
      if (a.showArrow !== undefined) output += `    showArrow = ${a.showArrow}\n`
      output += `  }\n`
    }

    for (const s of config.seriesOverrides.value) {
      if (!s.name) continue
      output += `\n  series "${s.name}" {\n`
      if (s.color) output += `    color = "${s.color}"\n`
      if (s.lineWidth !== undefined) output += `    lineWidth = ${s.lineWidth}\n`
      if (s.dash) output += `    dash = "${s.dash}"\n`
      if (s.interpolation) output += `    interpolation = "${s.interpolation}"\n`
      if (s.labelMode) output += `    labelMode = "${s.labelMode}"\n`
      if (s.labelText) output += `    labelText = "${s.labelText}"\n`
      if (s.valueLabels !== undefined) output += `    valueLabels = ${s.valueLabels}\n`
      if (s.lineSymbols !== undefined) output += `    lineSymbols = ${s.lineSymbols}\n`
      if (s.hidden !== undefined) output += `    hidden = ${s.hidden}\n`
      if (s.symbolShape) output += `    symbolShape = "${s.symbolShape}"\n`
      if (s.symbolShowOn) output += `    symbolShowOn = "${s.symbolShowOn}"\n`
      if (s.symbolStyle) output += `    symbolStyle = "${s.symbolStyle}"\n`
      if (s.symbolSize !== undefined) output += `    symbolSize = ${s.symbolSize}\n`
      if (s.symbolOpacity !== undefined) output += `    symbolOpacity = ${s.symbolOpacity}\n`
      output += `  }\n`
    }

    output += '}\n'
    return output
  })

  return { dsl }
}
