import { parse } from './dsl/parser'
import type { ChartNode, PropertyNode } from './dsl/types'

import letterFrequencyBpc from './samples/letter-frequency.bpc?raw'
import co2EmissionsBpc from './samples/co2-emissions.bpc?raw'
import co2EmissionsStoryBpc from './samples/co2-emissions-story.bpc?raw'
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
import coffeeProductionBpc from './samples/coffee-production.bpc?raw'
import tallestBuildingsBpc from './samples/tallest-buildings.bpc?raw'
import fastestAnimalsBpc from './samples/fastest-animals.bpc?raw'
import internetUsersBpc from './samples/internet-users.bpc?raw'
import evSalesBpc from './samples/ev-sales.bpc?raw'
import streamingRevenueBpc from './samples/streaming-revenue.bpc?raw'
import seaLevelRiseBpc from './samples/sea-level-rise.bpc?raw'
import bitcoinPriceBpc from './samples/bitcoin-price.bpc?raw'
import gdpGrowthBpc from './samples/gdp-growth.bpc?raw'
import socialMediaUsersBpc from './samples/social-media-users.bpc?raw'
import browserMarketBpc from './samples/browser-market.bpc?raw'
import dietCompositionBpc from './samples/diet-composition.bpc?raw'
import federalBudgetBpc from './samples/federal-budget.bpc?raw'
import waterUsageBpc from './samples/water-usage.bpc?raw'
import programmingLanguagesBpc from './samples/programming-languages.bpc?raw'
import stockPriceAreaBpc from './samples/stock-price-area.bpc?raw'
import energyMixStackedAreaBpc from './samples/energy-mix-stacked-area.bpc?raw'
import quarterlyStackedColumnsBpc from './samples/quarterly-stacked-columns.bpc?raw'
import populationStackedBarBpc from './samples/population-stacked-bar.bpc?raw'
import farmCompassBpc from './samples/farm-compass.bpc?raw'
import electionPollsBpc from './samples/election-polls.bpc?raw'
import cityClimateBpc from './samples/city-climate.bpc?raw'
import pisaScoresBpc from './samples/pisa-scores.bpc?raw'
import renewableCapacityBpc from './samples/renewable-capacity.bpc?raw'

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
  if (!ast.data) {
    return ''
  }
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
  if (!ast.data) {
    return ''
  }
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
  buildSample('co2-emissions-story', co2EmissionsStoryBpc),
  buildSample('coffee-production', coffeeProductionBpc),
  buildSample('tallest-buildings', tallestBuildingsBpc),
  // Bar Horizontal
  buildSample('spoken-languages', spokenLanguagesBpc),
  buildSample('life-expectancy', lifeExpectancyBpc),
  buildSample('fastest-animals', fastestAnimalsBpc),
  buildSample('internet-users', internetUsersBpc),
  // Bar Multi
  buildSample('quarterly-revenue', quarterlyRevenueBpc),
  buildSample('medal-count', medalCountBpc),
  buildSample('ev-sales', evSalesBpc),
  buildSample('streaming-revenue', streamingRevenueBpc),
  // Line
  buildSample('temperature-anomaly', temperatureAnomalyBpc),
  buildSample('inflation-rate', inflationRateBpc),
  buildSample('sea-level-rise', seaLevelRiseBpc),
  buildSample('bitcoin-price', bitcoinPriceBpc),
  // Line Multi
  buildSample('unemployment-rates', unemploymentRatesBpc),
  buildSample('renewable-energy', renewableEnergyBpc),
  buildSample('gdp-growth', gdpGrowthBpc),
  buildSample('social-media-users', socialMediaUsersBpc),
  // Donut
  buildSample('smartphone-market', smartphoneMarketBpc),
  buildSample('energy-sources', energySourcesBpc),
  buildSample('browser-market', browserMarketBpc),
  buildSample('diet-composition', dietCompositionBpc),
  // Pie
  buildSample('world-population', worldPopulationBpc),
  buildSample('federal-budget', federalBudgetBpc),
  buildSample('water-usage', waterUsageBpc),
  buildSample('programming-languages', programmingLanguagesBpc),
  // Area
  buildSample('stock-price-area', stockPriceAreaBpc),
  // Area Stacked
  buildSample('energy-mix-stacked-area', energyMixStackedAreaBpc),
  // Column Stacked
  buildSample('quarterly-stacked-columns', quarterlyStackedColumnsBpc),
  // Bar Stacked
  buildSample('population-stacked-bar', populationStackedBarBpc),
  // Bar Split
  buildSample('election-polls', electionPollsBpc),
  buildSample('city-climate', cityClimateBpc),
  buildSample('pisa-scores', pisaScoresBpc),
  // Bar Grouped
  buildSample('renewable-capacity', renewableCapacityBpc),
  // Story (multi-scene)
  buildSample('farm-compass', farmCompassBpc),
]
