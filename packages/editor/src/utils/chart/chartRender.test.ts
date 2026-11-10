import { SortDirection } from '@blueprint-chart/lib'
import { layoutDefaults } from '@/composables/useChartConfig'
import { buildChartRender, snapshotFromState, type RenderSnapshot } from './chartRender'
import { parseChartState } from './chartState'

const emptySnapshot: RenderSnapshot = {
  scenes: [],
  activeIndex: -1,
  chartType: 'bar-vertical',
  text: { title: '', description: '', altText: '', byline: '', note: '', source: '', sourceUrl: '' },
  layout: layoutDefaults,
  sort: SortDirection.None,
  data: '',
  selectedColumn: '',
  colorizes: [],
  areaFills: [],
  overlays: [],
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

  it('passes the getTheData flag from the DSL to the frame', () => {
    const state = parseChartState('chart bar-vertical {\n  getTheData = true\n  data {\n    "a" = 1\n  }\n}')
    const render = buildChartRender(snapshotFromState(state))
    expect(render.kind === 'chart' && render.definition.frame?.getTheData).toBe(true)
  })
})
