import { parse } from './dsl/parser'
import type { ChartNode, PropertyNode } from './dsl/types'

import letterFrequencyBpc from './samples/letter-frequency.bpc?raw'
import co2EmissionsBpc from './samples/co2-emissions.bpc?raw'
import spokenLanguagesBpc from './samples/spoken-languages.bpc?raw'
import lifeExpectancyBpc from './samples/life-expectancy.bpc?raw'
import quarterlyRevenueBpc from './samples/quarterly-revenue.bpc?raw'
import medalCountBpc from './samples/medal-count.bpc?raw'
import temperatureAnomalyBpc from './samples/temperature-anomaly.bpc?raw'
import inflationRateBpc from './samples/inflation-rate.bpc?raw'
import unemploymentRatesBpc from './samples/unemployment-rates.bpc?raw'
import renewableEnergyBpc from './samples/renewable-energy.bpc?raw'
import smartphoneMarketBpc from './samples/smartphone-market.bpc?raw'
import energySourcesBpc from './samples/energy-sources.bpc?raw'
import worldPopulationBpc from './samples/world-population.bpc?raw'

export interface ChartSample {
  id: string
  title: string
  description: string
  chartType: string
  tsvData: string
  serializedData: string
  dsl: string
}

function getProp(ast: ChartNode, key: string): string {
  const prop = ast.properties.find((p: PropertyNode) => p.key === key)
  return prop ? String(prop.value) : ''
}

function extractTsv(ast: ChartNode): string {
  if (!ast.data) return ''
  const entries = ast.data.entries
  const seriesEntry = entries.find((e: PropertyNode) => e.key === '_series')

  if (seriesEntry) {
    const seriesNames = String(seriesEntry.value).split(',')
    const header = ['category', ...seriesNames].join('\t')
    const rows = entries
      .filter((e: PropertyNode) => e.key !== '_series')
      .map((e: PropertyNode) => {
        const values = String(e.value).split(',')
        return [e.key, ...values].join('\t')
      })
    return [header, ...rows].join('\n')
  }

  const header = ['label', 'value'].join('\t')
  const rows = entries.map((e: PropertyNode) => [e.key, String(e.value)].join('\t'))
  return [header, ...rows].join('\n')
}

function extractSerialized(ast: ChartNode): string {
  if (!ast.data) return ''
  const entries = ast.data.entries
  const seriesEntry = entries.find((e: PropertyNode) => e.key === '_series')

  if (seriesEntry) {
    const header = `_series = "${String(seriesEntry.value)}"`
    const rows = entries
      .filter((e: PropertyNode) => e.key !== '_series')
      .map((e: PropertyNode) => `"${e.key}" = "${String(e.value)}"`)
    return [header, ...rows].join('\n')
  }

  return entries
    .map((e: PropertyNode) => `"${e.key}" = ${String(e.value)}`)
    .join('\n')
}

function buildSample(id: string, dsl: string): ChartSample {
  const ast = parse(dsl)
  return {
    id,
    title: getProp(ast, 'title'),
    description: getProp(ast, 'description'),
    chartType: ast.chartType,
    tsvData: extractTsv(ast),
    serializedData: extractSerialized(ast),
    dsl,
  }
}

export const samples: ChartSample[] = [
  // Bar Vertical
  buildSample('letter-frequency', letterFrequencyBpc),
  buildSample('co2-emissions', co2EmissionsBpc),
  // Bar Horizontal
  buildSample('spoken-languages', spokenLanguagesBpc),
  buildSample('life-expectancy', lifeExpectancyBpc),
  // Bar Multi
  buildSample('quarterly-revenue', quarterlyRevenueBpc),
  buildSample('medal-count', medalCountBpc),
  // Line
  buildSample('temperature-anomaly', temperatureAnomalyBpc),
  buildSample('inflation-rate', inflationRateBpc),
  // Line Multi
  buildSample('unemployment-rates', unemploymentRatesBpc),
  buildSample('renewable-energy', renewableEnergyBpc),
  // Donut
  buildSample('smartphone-market', smartphoneMarketBpc),
  buildSample('energy-sources', energySourcesBpc),
  // Pie
  buildSample('world-population', worldPopulationBpc),
]
