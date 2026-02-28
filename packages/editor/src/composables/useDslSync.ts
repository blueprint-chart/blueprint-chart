import { parse, propertyMap, extractChartTypeOptions, dataEntriesToString } from '@blueprint-chart/lib'
import type { SeriesOverride } from '@blueprint-chart/lib'
import { useChartConfig } from './useChartConfig'
import { useChartTypeOptions, type ChartTypeOptions } from './useChartTypeOptions'

type PropMap = ReturnType<typeof propertyMap>

function applyBasicProperties(config: ReturnType<typeof useChartConfig>, propMap: PropMap) {
  config.title.value = String(propMap.get('title') ?? '')
  config.description.value = String(propMap.get('description') ?? '')
  config.byline.value = String(propMap.get('byline') ?? '')
  config.source.value = String(propMap.get('source') ?? '')
  config.sourceUrl.value = String(propMap.get('sourceUrl') ?? '')
}

function applySort(config: ReturnType<typeof useChartConfig>, propMap: PropMap) {
  const sort = propMap.get('sort')
  if (sort === 'ascending' || sort === 'descending') {
    config.sort.value = sort
  }
  else {
    config.sort.value = 'none'
  }
}

function applyHighlights(
  config: ReturnType<typeof useChartConfig>,
  highlights: Array<{ target: string, properties: Array<{ key: string, value: unknown }> }> | undefined,
) {
  if (!highlights) {
    config.highlights.value = []
    return
  }
  config.highlights.value = highlights.map((h) => {
    const hProps = propertyMap(h.properties)
    return {
      target: h.target,
      color: String(hProps.get('color') ?? ''),
      label: String(hProps.get('label') ?? ''),
    }
  })
}

function applyAreaFills(
  config: ReturnType<typeof useChartConfig>,
  areaFills: Array<{ from: string, to: string, properties: Array<{ key: string, value: unknown }> }> | undefined,
) {
  if (!areaFills) {
    config.areaFills.value = []
    return
  }
  config.areaFills.value = areaFills.map((af) => {
    const afProps = propertyMap(af.properties)
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

function applyAnnotations(
  config: ReturnType<typeof useChartConfig>,
  annotations: Array<{ target: string, properties: Array<{ key: string, value: unknown }> }> | undefined,
) {
  if (!annotations) {
    config.annotations.value = []
    return
  }
  config.annotations.value = annotations.map((a) => {
    const aProps = propertyMap(a.properties)
    return {
      target: a.target,
      text: String(aProps.get('text') ?? ''),
      dx: aProps.has('dx') ? Number(aProps.get('dx')) : undefined,
      dy: aProps.has('dy') ? Number(aProps.get('dy')) : undefined,
      showArrow: aProps.has('showArrow') ? (aProps.get('showArrow') === 'true' || aProps.get('showArrow') === true) : undefined,
    }
  })
}

function parseSeriesOverrideProps(sProps: PropMap): Partial<SeriesOverride> {
  const result: Partial<SeriesOverride> = {}
  if (sProps.has('color')) {
    result.color = String(sProps.get('color'))
  }
  if (sProps.has('lineWidth')) {
    result.lineWidth = Number(sProps.get('lineWidth'))
  }
  if (sProps.has('dash')) {
    result.dash = String(sProps.get('dash'))
  }
  if (sProps.has('interpolation')) {
    result.interpolation = String(sProps.get('interpolation'))
  }
  if (sProps.has('labelMode')) {
    result.labelMode = String(sProps.get('labelMode'))
  }
  if (sProps.has('labelText')) {
    result.labelText = String(sProps.get('labelText'))
  }
  return result
}

function parseSeriesOverrideBooleans(sProps: PropMap): Partial<SeriesOverride> {
  const result: Partial<SeriesOverride> = {}
  if (sProps.has('valueLabels')) {
    result.valueLabels = sProps.get('valueLabels') === 'true' || sProps.get('valueLabels') === true
  }
  if (sProps.has('lineSymbols')) {
    result.lineSymbols = sProps.get('lineSymbols') === 'true' || sProps.get('lineSymbols') === true
  }
  if (sProps.has('hidden')) {
    result.hidden = sProps.get('hidden') === 'true' || sProps.get('hidden') === true
  }
  return result
}

function parseSeriesOverrideSymbols(sProps: PropMap): Partial<SeriesOverride> {
  const result: Partial<SeriesOverride> = {}
  if (sProps.has('symbolShape')) {
    result.symbolShape = String(sProps.get('symbolShape'))
  }
  if (sProps.has('symbolShowOn')) {
    result.symbolShowOn = String(sProps.get('symbolShowOn'))
  }
  if (sProps.has('symbolStyle')) {
    result.symbolStyle = String(sProps.get('symbolStyle'))
  }
  if (sProps.has('symbolSize')) {
    result.symbolSize = Number(sProps.get('symbolSize'))
  }
  if (sProps.has('symbolOpacity')) {
    result.symbolOpacity = Number(sProps.get('symbolOpacity'))
  }
  return result
}

function applySeriesOverrides(
  config: ReturnType<typeof useChartConfig>,
  series: Array<{ name: string, properties: Array<{ key: string, value: unknown }> }> | undefined,
) {
  if (!series) {
    config.seriesOverrides.value = []
    return
  }
  config.seriesOverrides.value = series.map((s) => {
    const sProps = propertyMap(s.properties)
    return {
      name: s.name,
      ...parseSeriesOverrideProps(sProps),
      ...parseSeriesOverrideBooleans(sProps),
      ...parseSeriesOverrideSymbols(sProps),
    }
  })
}

export function useDslSync() {
  const config = useChartConfig()
  const { store } = useChartTypeOptions()

  function applyDsl(dslString: string): { success: boolean, error?: string } {
    try {
      const ast = parse(dslString)
      config.chartType.value = ast.chartType
      const propMap = propertyMap(ast.properties)
      applyBasicProperties(config, propMap)
      applySort(config, propMap)
      config.data.value = ast.data ? dataEntriesToString(ast.data) : ''
      store[ast.chartType] = extractChartTypeOptions(ast.chartType, ast.properties) as Partial<ChartTypeOptions>
      applyHighlights(config, ast.highlights)
      applyAreaFills(config, ast.areaFills)
      applyAnnotations(config, ast.annotations)
      applySeriesOverrides(config, ast.series)
      return { success: true }
    }
    catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  return { applyDsl }
}
