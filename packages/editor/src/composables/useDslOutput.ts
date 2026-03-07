import { computed, ref } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useDataTransforms } from './useDataTransforms'
import { useScenes } from './useScenes'
import { useDataTable } from './useDataTable'
import { getChartOptions } from '@blueprint-chart/lib'
import type { RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'

function serializePosition(v: number | string): string {
  if (typeof v === 'number') {
    return String(v)
  }
  const str = String(v)
  if (str.endsWith('%')) {
    return String(parseFloat(str))
  }
  // "150px" → quoted string
  return `"${str}"`
}

function serializeMaxWidth(v: number | string): string {
  if (typeof v === 'number') {
    return String(v)
  }
  const str = String(v)
  if (str.endsWith('%')) {
    return `"${
      str}"`
  }
  // "150px" → bare number
  return String(parseFloat(str))
}

export function useDslOutput() {
  const config = useChartConfig()
  const base = config._base
  const { baseOptions } = useChartTypeOptions()
  const { steps: transformSteps } = useDataTransforms()
  const { scenes } = useScenes()
  const dataTable = useDataTable()
  const compact = ref(false)

  const dsl = computed(() => {
    let output = `chart ${base.chartType.value} {\n`

    if (base.title.value) {
      output += `  title = "${base.title.value}"\n`
    }
    if (base.description.value) {
      output += `  description = "${base.description.value}"\n`
    }
    if (base.byline.value) {
      output += `  byline = "${base.byline.value}"\n`
    }
    if (base.source.value) {
      output += `  source = "${base.source.value}"\n`
    }
    if (base.sourceUrl.value) {
      output += `  sourceUrl = "${base.sourceUrl.value}"\n`
    }
    const optionDefs = getChartOptions(base.chartType.value)
    const supportedKeys = optionDefs.map(d => d.key)
    const defaultMap = new Map(optionDefs.filter(d => d.default !== undefined).map(d => [d.key, String(d.default)]))
    const opts = baseOptions.value
    for (const key of supportedKeys) {
      const val = opts[key as keyof typeof opts]
      if (val === undefined) {
        continue
      }
      if (compact.value && defaultMap.has(key) && String(val) === defaultMap.get(key)) {
        continue
      }
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

    if (base.data.value) {
      output += '\n  data {\n'
      const lines = base.data.value
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
      output += lines.map(l => `    ${l}`).join('\n')
      output += '\n  }\n'
    }

    for (const h of base.highlights.value) {
      if (!h.target) {
        continue
      }
      output += `\n  highlight "${h.target}" {\n`
      if (h.color) {
        output += `    color = "${
          h.color}"\n`
      }
      if (h.label) {
        output += `    label = "${
          h.label}"\n`
      }
      output += `  }\n`
    }

    for (const af of base.areaFills.value) {
      if (!af.from || !af.to) {
        continue
      }
      output += `\n  areafill "${af.from}" "${af.to}" {\n`
      if (af.color) {
        output += `    color = "${
          af.color}"\n`
      }
      if (af.negativeColor) {
        output += `    negativeColor = "${
          af.negativeColor}"\n`
      }
      if (af.opacity !== undefined) {
        output += `    opacity = ${
          af.opacity}\n`
      }
      if (af.interpolation) {
        output += `    interpolation = "${
          af.interpolation}"\n`
      }
      output += `  }\n`
    }

    for (const a of base.annotations.value) {
      const kind = a.kind ?? 'point'
      if (kind === 'point') {
        if (!('target' in a) || !a.target) {
          continue
        }
        output += `\n  annotation "${a.target}" {\n`
        if (a.id) {
          output += `    id = "${a.id}"\n`
        }
        if (a.text) {
          output += `    text = "${
            a.text}"\n`
        }
        if (a.textColor) {
          output += `    textColor = "${
            a.textColor}"\n`
        }
        if (a.maxWidth !== undefined) {
          output += `    maxWidth = ${
            serializeMaxWidth(a.maxWidth)}\n`
        }
        if (a.textOutline !== undefined) {
          output += `    textOutline = ${
            a.textOutline}\n`
        }
        if (a.showLine !== undefined) {
          output += `    showLine = ${
            a.showLine}\n`
        }
        if (a.anchorDirection) {
          output += `    anchorDirection = ${
            a.anchorDirection}\n`
        }
        if (a.textOffsetX !== undefined) {
          output += `    textOffsetX = ${
            a.textOffsetX}\n`
        }
        if (a.textOffsetY !== undefined) {
          output += `    textOffsetY = ${
            a.textOffsetY}\n`
        }
        if (a.lineStyle) {
          output += `    lineStyle = ${
            a.lineStyle}\n`
        }
        if (a.lineWeight !== undefined) {
          output += `    lineWeight = ${
            a.lineWeight}\n`
        }
        if (a.showArrow !== undefined) {
          output += `    showArrow = ${
            a.showArrow}\n`
        }
        if (a.lineTargetDistance !== undefined) {
          output += `    lineTargetDistance = ${
            a.lineTargetDistance}\n`
        }
        if (a.showCircle !== undefined) {
          output += `    showCircle = ${
            a.showCircle}\n`
        }
        if (a.circleSize !== undefined) {
          output += `    circleSize = ${
            a.circleSize}\n`
        }
        if (a.circleStyle) {
          output += `    circleStyle = ${
            a.circleStyle}\n`
        }
        if (a.circleColor) {
          output += `    circleColor = "${
            a.circleColor}"\n`
        }
        output += `  }\n`
      }
      else if (kind === 'range') {
        const ra = a as RangeAnnotationConfig
        output += `\n  range {\n`
        if (ra.id) {
          output += `    id = "${ra.id}"\n`
        }
        if (ra.start !== undefined) {
          output += `    start = ${typeof ra.start === 'string'
            ? `"${
              ra.start}"`
            : ra.start}\n`
        }
        if (ra.end !== undefined) {
          output += `    end = ${typeof ra.end === 'string'
            ? `"${
              ra.end}"`
            : ra.end}\n`
        }
        if (ra.orientation) {
          output += `    orientation = ${
            ra.orientation}\n`
        }
        if (ra.startAnchor && ra.startAnchor !== 'center') {
          output += `    startAnchor = ${
            ra.startAnchor}\n`
        }
        if (ra.endAnchor && ra.endAnchor !== 'center') {
          output += `    endAnchor = ${
            ra.endAnchor}\n`
        }
        if (ra.bgColor) {
          output += `    bgColor = "${
            ra.bgColor}"\n`
        }
        if (ra.bgOpacity !== undefined) {
          output += `    bgOpacity = ${
            ra.bgOpacity}\n`
        }
        if (ra.direction) {
          output += `    direction = ${
            ra.direction}\n`
        }
        if (ra.text) {
          output += `    text = "${
            ra.text}"\n`
        }
        if (ra.textColor) {
          output += `    textColor = "${
            ra.textColor}"\n`
        }
        output += `  }\n`
      }
      else if (kind === 'free') {
        const fa = a as FreeAnnotationConfig
        output += `\n  note {\n`
        if (fa.id) {
          output += `    id = "${fa.id}"\n`
        }
        if (fa.text) {
          output += `    text = "${
            fa.text}"\n`
        }
        if (fa.x !== undefined) {
          output += `    x = ${
            serializePosition(fa.x)}\n`
        }
        if (fa.y !== undefined) {
          output += `    y = ${
            serializePosition(fa.y)}\n`
        }
        if (fa.textColor) {
          output += `    textColor = "${
            fa.textColor}"\n`
        }
        if (fa.maxWidth !== undefined) {
          output += `    maxWidth = ${
            serializeMaxWidth(fa.maxWidth)}\n`
        }
        if (fa.textOutline !== undefined) {
          output += `    textOutline = ${
            fa.textOutline}\n`
        }
        output += `  }\n`
      }
    }

    for (const t of transformSteps.value) {
      output += `\n  transform ${t.type} {\n`
      for (const [k, v] of Object.entries(t.config)) {
        if (v !== undefined && v !== '') {
          output += `    ${k} = "${v}"\n`
        }
      }
      output += `  }\n`
    }

    if (base.sort.value !== 'none') {
      const cols = dataTable.displayColumns.value
      const valueCols = cols.length > 2 ? cols.slice(1) : cols.length > 1 ? [cols[1]] : [cols[0] ?? '']
      output += `\n  transform sort {\n`
      if (valueCols.length > 1) {
        output += `    columns = "${valueCols.join(',')}"\n`
        output += `    operation = sum\n`
      }
      else {
        output += `    column = "${valueCols[0]}"\n`
      }
      output += `    direction = ${base.sort.value}\n`
      output += `  }\n`
    }

    for (const s of base.seriesOverrides.value) {
      if (!s.name) {
        continue
      }
      output += `\n  series "${s.name}" {\n`
      if (s.color) {
        output += `    color = "${
          s.color}"\n`
      }
      if (s.lineWidth !== undefined) {
        output += `    lineWidth = ${
          s.lineWidth}\n`
      }
      if (s.dash) {
        output += `    dash = "${
          s.dash}"\n`
      }
      if (s.interpolation) {
        output += `    interpolation = "${
          s.interpolation}"\n`
      }
      if (s.labelMode) {
        output += `    labelMode = "${
          s.labelMode}"\n`
      }
      if (s.labelText) {
        output += `    labelText = "${
          s.labelText}"\n`
      }
      if (s.valueLabels !== undefined) {
        output += `    valueLabels = ${
          s.valueLabels}\n`
      }
      if (s.lineSymbols !== undefined) {
        output += `    lineSymbols = ${
          s.lineSymbols}\n`
      }
      if (s.hidden !== undefined) {
        output += `    hidden = ${
          s.hidden}\n`
      }
      if (s.symbolShape) {
        output += `    symbolShape = "${
          s.symbolShape}"\n`
      }
      if (s.symbolShowOn) {
        output += `    symbolShowOn = "${
          s.symbolShowOn}"\n`
      }
      if (s.symbolStyle) {
        output += `    symbolStyle = "${
          s.symbolStyle}"\n`
      }
      if (s.symbolSize !== undefined) {
        output += `    symbolSize = ${
          s.symbolSize}\n`
      }
      if (s.symbolOpacity !== undefined) {
        output += `    symbolOpacity = ${
          s.symbolOpacity}\n`
      }
      output += `  }\n`
    }

    for (const scene of scenes.value) {
      if (scene.name !== null) {
        output += `\n  scene "${scene.name}" {\n`
      }
      else {
        output += `\n  scene {\n`
      }
      if (scene.chartType) {
        output += `    type = ${scene.chartType}\n`
      }
      if (scene.properties) {
        for (const [k, v] of Object.entries(scene.properties)) {
          if (typeof v === 'string') {
            output += `    ${k} = "${v}"\n`
          }
          else {
            output += `    ${k} = ${v}\n`
          }
        }
      }
      if (scene.chartTypeOptions) {
        const sceneChartType = scene.chartType || base.chartType.value
        const sceneOptDefs = getChartOptions(sceneChartType)
        const sceneSupportedKeys = sceneOptDefs.map(d => d.key)
        for (const key of sceneSupportedKeys) {
          const val = scene.chartTypeOptions[key as keyof typeof scene.chartTypeOptions]
          if (val === undefined) {
            continue
          }
          if (key === 'colors' && Array.isArray(val) && val.length > 0) {
            output += `    colors = "${val.join(', ')}"\n`
          }
          else if (typeof val === 'boolean') {
            output += `    ${key} = ${val}\n`
          }
          else if (typeof val === 'string' && val !== '') {
            output += `    ${key} = "${val}"\n`
          }
        }
      }
      if (scene.data) {
        output += `\n    data {\n`
        const lines = scene.data.split('\n').map(l => l.trim()).filter(Boolean)
        output += lines.map(l => `      ${l}`).join('\n')
        output += `\n    }\n`
      }
      if (scene.highlights) {
        for (const h of scene.highlights) {
          if (!h.target) {
            continue
          }
          output += `\n    highlight "${h.target}" {\n`
          if (h.color) {
            output += `      color = "${h.color}"\n`
          }
          if (h.label) {
            output += `      label = "${h.label}"\n`
          }
          output += `    }\n`
        }
      }
      if (scene.areaFills) {
        for (const af of scene.areaFills) {
          if (!af.from || !af.to) {
            continue
          }
          output += `\n    areafill "${af.from}" "${af.to}" {\n`
          if (af.color) {
            output += `      color = "${af.color}"\n`
          }
          output += `    }\n`
        }
      }
      if (scene.annotations) {
        for (const a of scene.annotations) {
          const kind = a.kind ?? 'point'
          if (kind === 'point') {
            if (!('target' in a) || !a.target) {
              continue
            }
            output += `\n    annotation "${a.target}" {\n`
            if (a.id) {
              output += `      id = "${a.id}"\n`
            }
            if (a.text) {
              output += `      text = "${a.text}"\n`
            }
            if (a.textColor) {
              output += `      textColor = "${a.textColor}"\n`
            }
            if (a.maxWidth !== undefined) {
              output += `      maxWidth = ${serializeMaxWidth(a.maxWidth)}\n`
            }
            if (a.textOutline !== undefined) {
              output += `      textOutline = ${a.textOutline}\n`
            }
            if (a.showLine !== undefined) {
              output += `      showLine = ${a.showLine}\n`
            }
            if (a.anchorDirection) {
              output += `      anchorDirection = ${a.anchorDirection}\n`
            }
            if (a.textOffsetX !== undefined) {
              output += `      textOffsetX = ${a.textOffsetX}\n`
            }
            if (a.textOffsetY !== undefined) {
              output += `      textOffsetY = ${a.textOffsetY}\n`
            }
            if (a.lineStyle) {
              output += `      lineStyle = ${a.lineStyle}\n`
            }
            if (a.lineWeight !== undefined) {
              output += `      lineWeight = ${a.lineWeight}\n`
            }
            if (a.showArrow !== undefined) {
              output += `      showArrow = ${a.showArrow}\n`
            }
            if (a.lineTargetDistance !== undefined) {
              output += `      lineTargetDistance = ${a.lineTargetDistance}\n`
            }
            if (a.showCircle !== undefined) {
              output += `      showCircle = ${a.showCircle}\n`
            }
            if (a.circleSize !== undefined) {
              output += `      circleSize = ${a.circleSize}\n`
            }
            if (a.circleStyle) {
              output += `      circleStyle = ${a.circleStyle}\n`
            }
            if (a.circleColor) {
              output += `      circleColor = "${a.circleColor}"\n`
            }
            output += `    }\n`
          }
          else if (kind === 'range') {
            const ra = a as import('@blueprint-chart/lib').RangeAnnotationConfig
            output += `\n    range {\n`
            if (ra.id) {
              output += `      id = "${ra.id}"\n`
            }
            if (ra.start !== undefined) {
              output += `      start = ${typeof ra.start === 'string' ? `"${ra.start}"` : ra.start}\n`
            }
            if (ra.end !== undefined) {
              output += `      end = ${typeof ra.end === 'string' ? `"${ra.end}"` : ra.end}\n`
            }
            if (ra.orientation) {
              output += `      orientation = ${ra.orientation}\n`
            }
            if (ra.startAnchor && ra.startAnchor !== 'center') {
              output += `      startAnchor = ${ra.startAnchor}\n`
            }
            if (ra.endAnchor && ra.endAnchor !== 'center') {
              output += `      endAnchor = ${ra.endAnchor}\n`
            }
            if (ra.bgColor) {
              output += `      bgColor = "${ra.bgColor}"\n`
            }
            if (ra.bgOpacity !== undefined) {
              output += `      bgOpacity = ${ra.bgOpacity}\n`
            }
            if (ra.direction) {
              output += `      direction = ${ra.direction}\n`
            }
            if (ra.text) {
              output += `      text = "${ra.text}"\n`
            }
            if (ra.textColor) {
              output += `      textColor = "${ra.textColor}"\n`
            }
            output += `    }\n`
          }
          else if (kind === 'free') {
            const fa = a as import('@blueprint-chart/lib').FreeAnnotationConfig
            output += `\n    note {\n`
            if (fa.id) {
              output += `      id = "${fa.id}"\n`
            }
            if (fa.text) {
              output += `      text = "${fa.text}"\n`
            }
            if (fa.x !== undefined) {
              output += `      x = ${serializePosition(fa.x)}\n`
            }
            if (fa.y !== undefined) {
              output += `      y = ${serializePosition(fa.y)}\n`
            }
            if (fa.textColor) {
              output += `      textColor = "${fa.textColor}"\n`
            }
            if (fa.maxWidth !== undefined) {
              output += `      maxWidth = ${serializeMaxWidth(fa.maxWidth)}\n`
            }
            if (fa.textOutline !== undefined) {
              output += `      textOutline = ${fa.textOutline}\n`
            }
            output += `    }\n`
          }
        }
      }
      if (scene.annotationVisibility) {
        const kindMap = { point: 'annotation', range: 'range', free: 'note' } as const
        for (const v of scene.annotationVisibility) {
          output += `    ${v.action}_${kindMap[v.kind]} "${v.id}"\n`
        }
      }
      if (scene.seriesOverrides) {
        for (const s of scene.seriesOverrides) {
          if (!s.name) {
            continue
          }
          output += `\n    series "${s.name}" {\n`
          if (s.color) {
            output += `      color = "${s.color}"\n`
          }
          output += `    }\n`
        }
      }
      if (scene.transforms) {
        for (const t of scene.transforms) {
          output += `\n    transform ${t.type} {\n`
          for (const [k, v] of Object.entries(t.config)) {
            if (v !== undefined && v !== '') {
              output += `      ${k} = "${v}"\n`
            }
          }
          output += `    }\n`
        }
      }
      output += `  }\n`
    }

    output += '}\n'
    return output
  })

  return { dsl, compact }
}
