import type { ColumnType } from './types'

export interface RecommendFixture {
  id: string
  columnTypes: ColumnType[]
  rowCount: number
  goal: string
  expectedType: string
  // `true` = a documented hard case allowed to miss (see the design's residual risks).
  allowedMiss?: boolean
}

export const RECOMMEND_FIXTURES: RecommendFixture[] = [
  { id: 'browser-market', columnTypes: ['string', 'number'], rowCount: 4, goal: 'each wealth group as a share of the global total', expectedType: 'donut', allowedMiss: true },
  { id: 'co2-emissions', columnTypes: ['string', 'number'], rowCount: 6, goal: 'compare annual CO2 emissions across countries', expectedType: 'bar-vertical' },
  { id: 'coffee-production', columnTypes: ['string', 'number'], rowCount: 8, goal: 'compare coffee production by country', expectedType: 'bar-vertical' },
  { id: 'election-polls', columnTypes: ['string', 'number'], rowCount: 6, goal: 'the polling lead for each party with its margin of error', expectedType: 'bar-split' },
  { id: 'energy-mix-stacked-area', columnTypes: ['date', 'number', 'number', 'number'], rowCount: 20, goal: 'the energy mix composition over time', expectedType: 'area-stacked' },
  { id: 'farm-compass', columnTypes: ['date', 'number', 'number', 'number'], rowCount: 12, goal: 'how the land-use mix changed over time', expectedType: 'area-stacked' },
  { id: 'letter-frequency', columnTypes: ['string', 'number'], rowCount: 26, goal: 'compare how often each letter appears', expectedType: 'bar-vertical' },
  { id: 'medal-count', columnTypes: ['string', 'number', 'number', 'number'], rowCount: 10, goal: 'compare gold, silver and bronze medals across countries', expectedType: 'bar-multi' },
  { id: 'population-stacked-bar', columnTypes: ['string', 'number', 'number', 'number'], rowCount: 6, goal: 'each age group as a share of the total per country', expectedType: 'bar-stacked' },
  { id: 'quarterly-revenue', columnTypes: ['date', 'number', 'number', 'number', 'number'], rowCount: 5, goal: 'compare electric car sales across regions over time', expectedType: 'line-multi' },
  { id: 'quarterly-stacked-columns', columnTypes: ['string', 'number', 'number', 'number'], rowCount: 8, goal: 'the revenue mix composition by quarter', expectedType: 'column-stacked' },
  { id: 'renewable-capacity', columnTypes: ['string', 'number', 'number'], rowCount: 6, goal: 'compare installed renewable capacity by source across regions', expectedType: 'bar-grouped', allowedMiss: true },
  { id: 'spoken-languages', columnTypes: ['string', 'number'], rowCount: 12, goal: 'the most-spoken languages ranked by native speakers', expectedType: 'bar-horizontal' },
  { id: 'stock-price-area', columnTypes: ['date', 'number'], rowCount: 12, goal: 'how the stock climbed through the year', expectedType: 'area', allowedMiss: true },
  { id: 'temperature-anomaly', columnTypes: ['date', 'number'], rowCount: 40, goal: 'the global temperature anomaly trend over time', expectedType: 'line' },
  { id: 'unemployment-rates', columnTypes: ['date', 'number', 'number', 'number', 'number'], rowCount: 5, goal: 'compare how the top 1% income concentration diverged across countries over time', expectedType: 'line-multi' },
  { id: 'world-population', columnTypes: ['string', 'number'], rowCount: 5, goal: 'each continent as a share of world population', expectedType: 'pie' },
]
