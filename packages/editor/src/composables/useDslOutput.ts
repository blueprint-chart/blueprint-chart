import { computed, ref } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { getChartOptions } from '@blueprint-chart/lib'
import type { RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'

function serializePosition(v: number | string): string {
  if (typeof v === 'number') { return String(v) }
  const str = String(v)
  if (str.endsWith('%')) { return String(parseFloat(str)) }
  // "150px" → quoted string
  return `"${str}"`
}

function serializeMaxWidth(v: number | string): string {
  if (typeof v === 'number') { return String(v) }
  const str = String(v)
  if (str.endsWith('%')) { return `"${str}"` }
  // "150px" → bare number
  return String(parseFloat(str))
}

export function useDslOutput() {
  const config = useChartConfig()
  const { currentOptions } = useChartTypeOptions()
  const compact = ref(false)

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

    const optionDefs = getChartOptions(config.chartType.value)
    const supportedKeys = optionDefs.map(d => d.key)
    const defaultMap = new Map(optionDefs.filter(d => d.default !== undefined).map(d => [d.key, String(d.default)]))
    const opts = currentOptions.value
    for (const key of supportedKeys) {
      const val = opts[key as keyof typeof opts]
      if (val === undefined) { continue }
      if (compact.value && defaultMap.has(key) && String(val) === defaultMap.get(key)) { continue }
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
      if (!h.target) { continue }
      output += `\n  highlight "${h.target}" {\n`
      if (h.color) { output += `    color = "${h.color}"\n` }
      if (h.label) { output += `    label = "${h.label}"\n` }
      output += `  }\n`
    }

    for (const af of config.areaFills.value) {
      if (!af.from || !af.to) { continue }
      output += `\n  areafill "${af.from}" "${af.to}" {\n`
      if (af.color) { output += `    color = "${af.color}"\n` }
      if (af.negativeColor) { output += `    negativeColor = "${af.negativeColor}"\n` }
      if (af.opacity !== undefined) { output += `    opacity = ${af.opacity}\n` }
      if (af.interpolation) { output += `    interpolation = "${af.interpolation}"\n` }
      output += `  }\n`
    }

    for (const a of config.annotations.value) {
      const kind = a.kind ?? 'point'
      if (kind === 'point') {
        if (!('target' in a) || !a.target) { continue }
        output += `\n  annotation "${a.target}" {\n`
        if (a.text) { output += `    text = "${a.text}"\n` }
        if (a.textColor) { output += `    textColor = "${a.textColor}"\n` }
        if (a.maxWidth !== undefined) { output += `    maxWidth = ${serializeMaxWidth(a.maxWidth)}\n` }
        if (a.textOutline !== undefined) { output += `    textOutline = ${a.textOutline}\n` }
        if (a.showLine !== undefined) { output += `    showLine = ${a.showLine}\n` }
        if (a.anchorDirection) { output += `    anchorDirection = ${a.anchorDirection}\n` }
        if (a.textOffsetX !== undefined) { output += `    textOffsetX = ${a.textOffsetX}\n` }
        if (a.textOffsetY !== undefined) { output += `    textOffsetY = ${a.textOffsetY}\n` }
        if (a.lineStyle) { output += `    lineStyle = ${a.lineStyle}\n` }
        if (a.lineWeight !== undefined) { output += `    lineWeight = ${a.lineWeight}\n` }
        if (a.showArrow !== undefined) { output += `    showArrow = ${a.showArrow}\n` }
        if (a.lineTargetDistance !== undefined) { output += `    lineTargetDistance = ${a.lineTargetDistance}\n` }
        if (a.showCircle !== undefined) { output += `    showCircle = ${a.showCircle}\n` }
        if (a.circleSize !== undefined) { output += `    circleSize = ${a.circleSize}\n` }
        if (a.circleStyle) { output += `    circleStyle = ${a.circleStyle}\n` }
        if (a.circleColor) { output += `    circleColor = "${a.circleColor}"\n` }
        output += `  }\n`
      }
      else if (kind === 'range') {
        const ra = a as RangeAnnotationConfig
        output += `\n  range {\n`
        if (ra.start !== undefined) { output += `    start = ${typeof ra.start === 'string' ? `"${ra.start}"` : ra.start}\n` }
        if (ra.end !== undefined) { output += `    end = ${typeof ra.end === 'string' ? `"${ra.end}"` : ra.end}\n` }
        if (ra.orientation) { output += `    orientation = ${ra.orientation}\n` }
        if (ra.startAnchor && ra.startAnchor !== 'center') { output += `    startAnchor = ${ra.startAnchor}\n` }
        if (ra.endAnchor && ra.endAnchor !== 'center') { output += `    endAnchor = ${ra.endAnchor}\n` }
        if (ra.bgColor) { output += `    bgColor = "${ra.bgColor}"\n` }
        if (ra.bgOpacity !== undefined) { output += `    bgOpacity = ${ra.bgOpacity}\n` }
        if (ra.direction) { output += `    direction = ${ra.direction}\n` }
        if (ra.text) { output += `    text = "${ra.text}"\n` }
        if (ra.textColor) { output += `    textColor = "${ra.textColor}"\n` }
        output += `  }\n`
      }
      else if (kind === 'free') {
        const fa = a as FreeAnnotationConfig
        output += `\n  note {\n`
        if (fa.text) { output += `    text = "${fa.text}"\n` }
        if (fa.x !== undefined) { output += `    x = ${serializePosition(fa.x)}\n` }
        if (fa.y !== undefined) { output += `    y = ${serializePosition(fa.y)}\n` }
        if (fa.textColor) { output += `    textColor = "${fa.textColor}"\n` }
        if (fa.maxWidth !== undefined) { output += `    maxWidth = ${serializeMaxWidth(fa.maxWidth)}\n` }
        if (fa.textOutline !== undefined) { output += `    textOutline = ${fa.textOutline}\n` }
        output += `  }\n`
      }
    }

    for (const s of config.seriesOverrides.value) {
      if (!s.name) { continue }
      output += `\n  series "${s.name}" {\n`
      if (s.color) { output += `    color = "${s.color}"\n` }
      if (s.lineWidth !== undefined) { output += `    lineWidth = ${s.lineWidth}\n` }
      if (s.dash) { output += `    dash = "${s.dash}"\n` }
      if (s.interpolation) { output += `    interpolation = "${s.interpolation}"\n` }
      if (s.labelMode) { output += `    labelMode = "${s.labelMode}"\n` }
      if (s.labelText) { output += `    labelText = "${s.labelText}"\n` }
      if (s.valueLabels !== undefined) { output += `    valueLabels = ${s.valueLabels}\n` }
      if (s.lineSymbols !== undefined) { output += `    lineSymbols = ${s.lineSymbols}\n` }
      if (s.hidden !== undefined) { output += `    hidden = ${s.hidden}\n` }
      if (s.symbolShape) { output += `    symbolShape = "${s.symbolShape}"\n` }
      if (s.symbolShowOn) { output += `    symbolShowOn = "${s.symbolShowOn}"\n` }
      if (s.symbolStyle) { output += `    symbolStyle = "${s.symbolStyle}"\n` }
      if (s.symbolSize !== undefined) { output += `    symbolSize = ${s.symbolSize}\n` }
      if (s.symbolOpacity !== undefined) { output += `    symbolOpacity = ${s.symbolOpacity}\n` }
      output += `  }\n`
    }

    output += '}\n'
    return output
  })

  return { dsl, compact }
}
