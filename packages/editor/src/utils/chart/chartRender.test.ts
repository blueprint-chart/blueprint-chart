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

  it('drops a base overlay with no repeat from a scene', () => {
    const data = 'series = "A","B"\n"x" = 1,2'
    const scenes = [{ id: 's0', name: null }]
    const render = buildChartRender({ ...emptySnapshot, data, scenes, activeIndex: 0, overlays: [{ columns: ['B'] }] })
    expect(render.kind === 'chart' && render.definition.overlays).toEqual([])
  })

  it('draws the selected column as the bar of a single-series chart with overlays', () => {
    const data = 'series = "A","B","C"\n"x" = 1,2,3'
    const render = buildChartRender({ ...emptySnapshot, data, selectedColumn: 'B', overlays: [{ columns: ['C'] }] })
    const names = render.kind === 'chart' ? render.definition.data.series?.map(column => column.name) : []
    expect(names).toEqual(['B', 'A', 'C'])
  })
})
