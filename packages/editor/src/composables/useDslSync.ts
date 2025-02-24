import { parse, getChartOptions } from '@blueprint-chart/lib'
import type { SeriesOverride } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions, type ChartTypeOptionKey } from './useChartTypeOptions'

const BOOLEAN_KEYS: (keyof ChartTypeOptions)[] = ['legend', 'showVerticalAxis', 'showHorizontalAxis', 'showVerticalTicks', 'showHorizontalTicks', 'valueLabels', 'tooltips', 'crosshair', 'lineSymbols', 'displayAsPercentage', 'showTotal', 'showLabels', 'showValues']
const STRING_KEYS: (keyof ChartTypeOptions)[] = ['verticalGridStyle', 'horizontalGridStyle', 'verticalNumberFormat', 'horizontalNumberFormat', 'verticalLabelPosition', 'horizontalLabelPosition', 'verticalAxisDirection', 'colorPalette', 'interpolation', 'legendPosition', 'legendAnchor', 'directLabelling', 'directLabelAnchor', 'valueLabelPosition', 'crosshairDirection', 'crosshairStyle', 'crosshairColor', 'lineSymbolShape', 'lineSymbolShowOn', 'lineSymbolStyle', 'verticalScaleType', 'horizontalScaleType', 'sliceGroupLabel']
const NUMBER_KEYS: (keyof ChartTypeOptions)[] = ['lineSymbolSize', 'lineSymbolOpacity', 'verticalRangeMin', 'verticalRangeMax', 'horizontalRangeMin', 'horizontalRangeMax', 'sliceMax']

export function useDslSync() {
  const config = useChartConfig()
  const { store } = useChartTypeOptions()

  function applyDsl(dslString: string): { success: boolean, error?: string } {
    try {
      const ast = parse(dslString)

      config.chartType.value = ast.chartType

      const propMap = new Map(ast.properties.map(p => [p.key, p.value]))

      config.title.value = String(propMap.get('title') ?? '')
      config.description.value = String(propMap.get('description') ?? '')
      config.byline.value = String(propMap.get('byline') ?? '')
      config.source.value = String(propMap.get('source') ?? '')
      config.sourceUrl.value = String(propMap.get('sourceUrl') ?? '')

      const sort = propMap.get('sort')
      if (sort === 'ascending' || sort === 'descending') {
        config.sort.value = sort
      }
      else {
        config.sort.value = 'none'
      }

      if (ast.data) {
        config.data.value = ast.data.entries
          .map((e) => {
            const val = e.isPercentage ? `${e.value}%` : String(e.value)
            // Preserve _series metadata and quoted multi-values as-is
            if (e.key === '_series') {
              return `_series = "${val}"`
            }
            if (typeof e.value === 'string' && e.value.includes(',')) {
              return `"${e.key}" = "${val}"`
            }
            return `"${e.key}" = ${val}`
          })
          .join('\n')
      }
      else {
        config.data.value = ''
      }

      // Parse chart type options
      const typeOpts: Partial<ChartTypeOptions> = {}
      const supported = getChartOptions(ast.chartType).map(d => d.key as ChartTypeOptionKey)

      const colorsRaw = propMap.get('colors')
      if (colorsRaw !== undefined && supported.includes('colors')) {
        typeOpts.colors = String(colorsRaw).split(',').map(s => s.trim()).filter(Boolean)
      }

      for (const key of BOOLEAN_KEYS) {
        const raw = propMap.get(key)
        if (raw !== undefined && supported.includes(key)) {
          (typeOpts[key] as boolean) = raw === 'true' || raw === true
        }
      }

      for (const key of STRING_KEYS) {
        const raw = propMap.get(key)
        if (raw !== undefined && supported.includes(key)) {
          (typeOpts[key] as string) = String(raw)
        }
      }

      for (const key of NUMBER_KEYS) {
        const raw = propMap.get(key)
        if (raw !== undefined && supported.includes(key)) {
          (typeOpts[key] as string) = String(raw)
        }
      }

      store[ast.chartType] = typeOpts

      if (ast.highlights) {
        config.highlights.value = ast.highlights.map((h) => {
          const hProps = new Map(h.properties.map(p => [p.key, p.value]))
          return {
            target: h.target,
            color: String(hProps.get('color') ?? ''),
            label: String(hProps.get('label') ?? ''),
          }
        })
      }
      else {
        config.highlights.value = []
      }

      if (ast.areaFills) {
        config.areaFills.value = ast.areaFills.map((af) => {
          const afProps = new Map(af.properties.map(p => [p.key, p.value]))
          return {
            from: af.from,
            to: af.to,
            color: afProps.has('color') ? String(afProps.get('color')) : undefined,
            negativeColor: afProps.has('negativeColor') ? String(afProps.get('negativeColor')) : undefined,
            opacity: afProps.has('opacity') ? Number(afProps.get('opacity')) : undefined,
            interpolation: afProps.has('interpolation') ? String(afProps.get('interpolation')) : undefined,
          }
        })
      }
      else {
        config.areaFills.value = []
      }

      if (ast.annotations) {
        config.annotations.value = ast.annotations.map((a) => {
          const aProps = new Map(a.properties.map(p => [p.key, p.value]))
          return {
            target: a.target,
            text: String(aProps.get('text') ?? ''),
            dx: aProps.has('dx') ? Number(aProps.get('dx')) : undefined,
            dy: aProps.has('dy') ? Number(aProps.get('dy')) : undefined,
            showArrow: aProps.has('showArrow') ? (aProps.get('showArrow') === 'true' || aProps.get('showArrow') === true) : undefined,
          }
        })
      }
      else {
        config.annotations.value = []
      }

      if (ast.series) {
        config.seriesOverrides.value = ast.series.map((s) => {
          const sProps = new Map(s.properties.map(p => [p.key, p.value]))
          const override: SeriesOverride = { name: s.name }
          if (sProps.has('color')) override.color = String(sProps.get('color'))
          if (sProps.has('lineWidth')) override.lineWidth = Number(sProps.get('lineWidth'))
          if (sProps.has('dash')) override.dash = String(sProps.get('dash'))
          if (sProps.has('interpolation')) override.interpolation = String(sProps.get('interpolation'))
          if (sProps.has('labelMode')) override.labelMode = String(sProps.get('labelMode'))
          if (sProps.has('labelText')) override.labelText = String(sProps.get('labelText'))
          if (sProps.has('valueLabels')) override.valueLabels = sProps.get('valueLabels') === 'true' || sProps.get('valueLabels') === true
          if (sProps.has('lineSymbols')) override.lineSymbols = sProps.get('lineSymbols') === 'true' || sProps.get('lineSymbols') === true
          if (sProps.has('hidden')) override.hidden = sProps.get('hidden') === 'true' || sProps.get('hidden') === true
          if (sProps.has('symbolShape')) override.symbolShape = String(sProps.get('symbolShape'))
          if (sProps.has('symbolShowOn')) override.symbolShowOn = String(sProps.get('symbolShowOn'))
          if (sProps.has('symbolStyle')) override.symbolStyle = String(sProps.get('symbolStyle'))
          if (sProps.has('symbolSize')) override.symbolSize = Number(sProps.get('symbolSize'))
          if (sProps.has('symbolOpacity')) override.symbolOpacity = Number(sProps.get('symbolOpacity'))
          return override
        })
      }
      else {
        config.seriesOverrides.value = []
      }

      return { success: true }
    }
    catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { applyDsl }
}
