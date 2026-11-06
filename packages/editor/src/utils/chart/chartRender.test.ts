import { SortDirection } from '@blueprint-chart/lib'
import { layoutDefaults } from '@/composables/useChartConfig'
import { buildChartRender, type RenderSnapshot } from './chartRender'

const emptySnapshot: RenderSnapshot = {
  scenes: [],
  activeIndex: -1,
  chartType: 'bar-vertical',
  text: { title: '', description: '', byline: '', note: '', source: '', sourceUrl: '' },
  layout: layoutDefaults,
  sort: SortDirection.None,
  data: '',
  selectedColumn: '',
  colorizes: [],
  areaFills: [],
  seriesOverrides: [],
  baseHighlights: [],
  baseAnnotations: [],
  currentOptions: {},
  optionOverrides: {},
  table: { columns: [], rows: [], columnTypes: [] },
  steps: [],
  chartTheme: 'blueprint',
}

describe('buildChartRender', () => {
  it('returns empty when the data has no labels', () => {
    expect(buildChartRender(emptySnapshot)).toEqual({ kind: 'empty' })
  })
})
