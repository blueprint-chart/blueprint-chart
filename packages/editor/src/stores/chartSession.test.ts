import { ChartType } from '@blueprint-chart/lib'
import { generateId, useChartSession, summarizeDsl, storageKey, metaKey } from './chartSession'
import { serializeTableData } from '@/stores/dataTable'
import { useDslOutput } from '@/composables/useDslOutput'
import { TransformType } from '@/enums'
import { useChartConfig } from '@/stores/chartConfig'
import { useDataTable } from '@/stores/dataTable'
import { useDataTransforms } from '@/stores/dataTransforms'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'

describe('generateId', () => {
  it('returns an 11-character string', () => {
    const id = generateId()
    expect(id).toHaveLength(11)
  })

  it('contains only alphanumeric characters', () => {
    const id = generateId()
    expect(id).toMatch(/^[a-zA-Z0-9]{11}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()))
    expect(ids.size).toBe(50)
  })
})

describe('useChartSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    useChartConfig().reset()
    useDataTable().reset()
    useDataTransforms().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
  })

  it('save stores raw DSL string in localStorage', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.title.value = 'Test Title'
    config.chartType.value = ChartType.Donut
    session.save()

    const raw = localStorage.getItem(`blueprint-chart:${session.sessionId.value}`)
    expect(raw).toContain('chart donut')
    expect(raw).toContain('title = "Test Title"')
    // Should be raw DSL, not JSON
    expect(raw!.trimStart().startsWith('chart')).toBe(true)
  })

  it('save stores metadata in separate :meta key', () => {
    const session = useChartSession()
    session.newChart()
    session.save()

    const metaRaw = localStorage.getItem(`blueprint-chart:${session.sessionId.value}:meta`)
    expect(metaRaw).not.toBeNull()
    const meta = JSON.parse(metaRaw!)
    expect(meta.savedAt).toBeDefined()
  })

  it('save and load round-trip preserves chart config via DSL', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.title.value = 'Test Title'
    config.chartType.value = ChartType.Donut
    session.save()

    const id = session.sessionId.value
    config.reset()

    const loaded = session.load(id)
    expect(loaded).toBe(true)
    expect(config.title.value).toBe('Test Title')
    expect(config.chartType.value).toBe(ChartType.Donut)
  })

  it('save and load round-trip preserves data table from BPC', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.chartType.value = ChartType.BarHorizontal
    config.data.value = '"A" = 10\n"B" = 20'
    session.save()

    const id = session.sessionId.value
    const table = useDataTable()
    table.reset()
    config.reset()

    session.load(id)
    expect(table.columns.value).toEqual(['label', 'value'])
    expect(table.rows.value[0]).toEqual(['A', '10'])
  })

  it('save and load round-trip preserves scenes', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.chartType.value = ChartType.BarHorizontal
    config.data.value = '"A" = 10\n"B" = 20'

    const scenes = useScenes()
    scenes.add()
    scenes.update(0, {
      colorizes: [{ target: 'A', color: '#ff0000', label: '' }],
    })
    session.save()

    const id = session.sessionId.value
    config.reset()
    scenes.reset()

    session.load(id)
    expect(scenes.scenes.value).toHaveLength(1)
    expect(scenes.scenes.value[0].colorizes?.[0].color).toBe('#ff0000')
  })

  it('load returns false for unknown ID', () => {
    const session = useChartSession()
    expect(session.load('nonexistent1')).toBe(false)
  })

  it('newChart resets state and generates new ID', () => {
    const session = useChartSession()
    session.newChart()
    const firstId = session.sessionId.value

    const config = useChartConfig()
    config.title.value = 'Dirty'

    session.newChart()
    expect(session.sessionId.value).not.toBe(firstId)
    expect(config.title.value).toBe('')
  })

  it('loadChart returns false when ID not found', () => {
    const session = useChartSession()
    expect(session.loadChart('missing1234')).toBe(false)
  })

  it('loadChart returns true for existing chart', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    const id = session.sessionId.value

    expect(session.loadChart(id)).toBe(true)
  })

  it('save includes savedAt timestamp in meta', () => {
    const session = useChartSession()
    session.newChart()
    session.save()

    const metaRaw = localStorage.getItem(`blueprint-chart:${session.sessionId.value}:meta`)
    const meta = JSON.parse(metaRaw!)
    expect(meta.savedAt).toBeDefined()
    expect(new Date(meta.savedAt).getTime()).not.toBeNaN()
  })

  it('listSavedCharts returns saved charts sorted by most recent', () => {
    localStorage.clear()
    const session = useChartSession()

    const firstId = 'firstId0001'
    localStorage.setItem(`blueprint-chart:${firstId}`, 'chart line {\n  title = "First"\n}\n')
    localStorage.setItem(`blueprint-chart:${firstId}:meta`, JSON.stringify({
      savedAt: '2025-01-01T00:00:00.000Z',
    }))

    const secondId = 'secondId001'
    localStorage.setItem(`blueprint-chart:${secondId}`, 'chart donut {\n  title = "Second"\n  description = "A donut"\n}\n')
    localStorage.setItem(`blueprint-chart:${secondId}:meta`, JSON.stringify({
      savedAt: '2025-06-01T00:00:00.000Z',
    }))

    const charts = session.listSavedCharts()
    expect(charts).toHaveLength(2)
    expect(charts[0].id).toBe(secondId)
    expect(charts[0].title).toBe('Second')
    expect(charts[0].chartType).toBe(ChartType.Donut)
    expect(charts[1].id).toBe(firstId)
    expect(charts[1].title).toBe('First')
  })

  it('listSavedCharts ignores non-blueprint keys', () => {
    localStorage.setItem('other-key', 'value')
    localStorage.setItem('another:thing', '{}')
    const session = useChartSession()
    const charts = session.listSavedCharts()
    for (const chart of charts) {
      expect(localStorage.getItem(`blueprint-chart:${chart.id}`)).not.toBeNull()
    }
    expect(charts.find(c => c.id === 'other-key')).toBeUndefined()
  })

  it('listSavedCharts ignores the reserved cloud-index key', () => {
    localStorage.clear()
    // The cloud index is app state under the chart namespace, not a chart.
    localStorage.setItem('blueprint-chart:cloud-index', JSON.stringify(['realId0001']))
    const realId = 'realId0001'
    localStorage.setItem(`blueprint-chart:${realId}`, 'chart line {\n  title = "Real"\n}\n')
    const session = useChartSession()
    const charts = session.listSavedCharts()
    expect(charts.find(c => c.id === 'cloud-index')).toBeUndefined()
    expect(charts.map(c => c.id)).toEqual([realId])
  })

  it('deleteChart removes both DSL and meta keys', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    const id = session.sessionId.value

    expect(localStorage.getItem(`blueprint-chart:${id}`)).not.toBeNull()
    expect(localStorage.getItem(`blueprint-chart:${id}:meta`)).not.toBeNull()
    session.deleteChart(id)
    expect(localStorage.getItem(`blueprint-chart:${id}`)).toBeNull()
    expect(localStorage.getItem(`blueprint-chart:${id}:meta`)).toBeNull()
  })

  it('lastSavedAt starts as null for a fresh store', () => {
    const session = useChartSession()
    expect(session.lastSavedAt.value).toBeNull()
  })

  it('lastSavedAt is a non-empty ISO timestamp after save()', () => {
    const session = useChartSession()
    session.newChart()
    session.save()

    expect(session.lastSavedAt.value).not.toBeNull()
    expect(typeof session.lastSavedAt.value).toBe('string')
    expect(session.lastSavedAt.value!.length).toBeGreaterThan(0)
    expect(new Date(session.lastSavedAt.value!).getTime()).not.toBeNaN()
  })

  it('lastSavedAt resets to null after prepareNew()', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    expect(session.lastSavedAt.value).not.toBeNull()

    session.prepareNew()
    expect(session.lastSavedAt.value).toBeNull()
  })

  it('loads legacy JSON payload and migrates on next save', () => {
    const legacyId = 'legacyId001'
    localStorage.setItem(`blueprint-chart:${legacyId}`, JSON.stringify({
      chartConfig: {
        chartType: ChartType.BarHorizontal,
        title: 'Legacy Chart',
        description: '',
        byline: '',
        note: '',
        source: '',
        sourceUrl: '',
        sort: 'none',
        data: '"A" = 10',
        selectedColumn: null,
        colorizes: [],
        areaFills: [],
        annotations: [],
        seriesOverrides: [],
        layout: { playerType: 'minimal-arrows', playerPosition: 'center' },
      },
      dataTable: { columns: ['label', 'value'], rows: [['A', '10']], rawInput: '"A" = 10' },
      chartTypeOptions: {},
      wizard: { currentIndex: 1, furthestIndex: 1 },
      savedAt: '2025-01-01T00:00:00.000Z',
    }))

    const session = useChartSession()
    const loaded = session.load(legacyId)
    expect(loaded).toBe(true)

    const config = useChartConfig()
    expect(config.title.value).toBe('Legacy Chart')
    expect(config.chartType.value).toBe(ChartType.BarHorizontal)
  })
})

describe('sheet number allocation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes a sheetId on prepareNew()', () => {
    const session = useChartSession()
    session.prepareNew()
    expect(session.sheetId.value).toMatch(/^[0-9a-f-]{36}$/i)
    expect(session.sheetNumber.value).toBeNull()
  })

  it('assigns sheetNumber 001 on the first chart', () => {
    const session = useChartSession()
    session.prepareNew()
    session.createSession()
    session.assignSheetNumber()
    expect(session.sheetNumber.value).toBe('001')
  })

  it('increments to 002 for the second chart in the catalog', () => {
    const a = useChartSession()
    a.prepareNew()
    a.createSession()
    a.assignSheetNumber()

    a.prepareNew()
    a.createSession()
    a.assignSheetNumber()
    expect(a.sheetNumber.value).toBe('002')
  })

  it('persists sheetNumber + sheetId across loadChart()', () => {
    const session = useChartSession()
    session.prepareNew()
    const id = session.createSession()
    session.assignSheetNumber()
    const originalId = session.sheetId.value
    session.sheetNumber.value = null
    session.sheetId.value = ''

    session.loadChart(id)
    expect(session.sheetNumber.value).toBe('001')
    expect(session.sheetId.value).toBe(originalId)
  })
})

describe('summarizeDsl', () => {
  it('extracts title, description, chartType, scene and row counts from DSL', () => {
    const dsl = [
      'chart bar-vertical',
      'title = "Quarterly Revenue"',
      'description = "By region"',
      'allowDarkMode = false',
      'data {',
      '  A = 1',
      '  B = 2',
      '  C = 3',
      '}',
      'scene "Intro" {}',
      'scene "Detail" {}',
    ].join('\n')
    expect(summarizeDsl(dsl)).toEqual({
      title: 'Quarterly Revenue',
      description: 'By region',
      chartType: 'bar-vertical',
      sceneCount: 2,
      rowCount: 3,
      allowDarkMode: false,
    })
  })

  it('defaults sensibly for a minimal DSL', () => {
    expect(summarizeDsl('chart line')).toEqual({
      title: '',
      description: '',
      chartType: 'line',
      sceneCount: 0,
      rowCount: 0,
      allowDarkMode: true,
    })
  })
})

// A pre-branch writer stored the pipeline's OUTPUT in the data block and kept
// the transform blocks beside it. Replayed here by writing the data block the
// way the old `dataTable.serialize()` did: from the display view.
describe('legacy documents written before the data block held source data', () => {
  const ID = 'legacyChart'

  function writeLegacyDocument(): string {
    setActivePinia(createPinia())
    const config = useChartConfig()
    const dataTable = useDataTable()
    const transforms = useDataTransforms()
    config.reset()
    dataTable.reset()
    transforms.reset()
    useChartTypeOptions().reset()
    useScenes().reset()

    config.chartType.value = ChartType.BarVertical
    dataTable.loadParsed({
      columns: ['label', 'value'],
      rows: [['A', '100'], ['B', '50']],
      columnTypes: ['string', 'number'],
    })
    transforms.addStep(TransformType.Parse, { column: 'value', operation: 'log' })
    config._base.data.value = serializeTableData(dataTable.displayColumns.value, dataTable.displayRows.value)

    const dsl = useDslOutput().generateDsl()
    localStorage.setItem(storageKey(ID), dsl)
    localStorage.setItem(metaKey(ID), JSON.stringify({ savedAt: new Date().toISOString() }))
    return dsl
  }

  /** What the preview and the wizard thumbnails feed to the renderer. */
  function renderedData(): string {
    const dataTable = useDataTable()
    return dataTable.serializeTransformed() ?? useChartConfig().data.value
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('renders exactly what it rendered before the branch, with no second application', () => {
    const legacyDsl = writeLegacyDocument()
    expect(legacyDsl).toContain('"A" = 4.605170185988092')
    expect(legacyDsl).toContain('transform parse {')

    setActivePinia(createPinia())
    expect(useChartSession().loadChart(ID)).toBe(true)

    expect(renderedData()).toBe('"A" = 4.605170185988092\n"B" = 3.912023005428146')
    expect(useDataTransforms().steps.value).toEqual([])
  })

  it('saving puts it on the new footing: same data, no stale steps, stamped', () => {
    writeLegacyDocument()

    setActivePinia(createPinia())
    const session = useChartSession()
    session.loadChart(ID)
    session.save()

    const saved = localStorage.getItem(storageKey(ID)) ?? ''
    expect(saved).toContain('"A" = 4.605170185988092')
    expect(saved).not.toContain('transform parse {')
    expect(JSON.parse(localStorage.getItem(metaKey(ID)) ?? '{}').schema).toBe(2)

    setActivePinia(createPinia())
    useChartSession().loadChart(ID)
    expect(renderedData()).toBe('"A" = 4.605170185988092\n"B" = 3.912023005428146')
  })

  it('a v2 document keeps its pipeline and applies it', () => {
    const legacyDsl = writeLegacyDocument()
    localStorage.setItem(metaKey(ID), JSON.stringify({ schema: 2, savedAt: new Date().toISOString() }))

    setActivePinia(createPinia())
    useChartSession().loadChart(ID)

    expect(useDataTransforms().steps.value).toHaveLength(1)
    expect(renderedData()).not.toBe(legacyDsl)
    expect(renderedData()).toContain('"A" = 1.5271796258079011')
  })
})

describe('a chart deleted while another tab still holds it', () => {
  const ID = 'staleTabIdA'
  const DSL = 'chart donut {\n  title = "Open in the stale tab"\n  data {\n    "A" = 1\n  }\n}\n'

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    useChartConfig().reset()
    useDataTable().reset()
    useDataTransforms().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
  })

  it('is not resurrected by the stale tab next autosave', () => {
    const session = useChartSession()
    localStorage.setItem(storageKey(ID), DSL)
    expect(session.loadChart(ID)).toBe(true)

    // Stands in for the confirmed delete in the other tab.
    session.deleteChart(ID)

    useChartConfig().title.value = 'Edited after the delete'
    session.save()

    expect(localStorage.getItem(storageKey(ID))).toBeNull()
    expect(localStorage.getItem(metaKey(ID))).toBeNull()
    expect(session.listSavedCharts()).toEqual([])
  })

  it('tells the tab its chart was removed elsewhere', () => {
    const session = useChartSession()
    localStorage.setItem(storageKey(ID), DSL)
    session.loadChart(ID)
    expect(session.deletedElsewhere.value).toBe(false)

    session.deleteChart(ID)
    session.save()

    expect(session.deletedElsewhere.value).toBe(true)
  })

  it('still writes the first save of a session that was never persisted', () => {
    const session = useChartSession()
    session.newChart()
    session.save()

    expect(localStorage.getItem(storageKey(session.sessionId.value))).not.toBeNull()
    expect(session.deletedElsewhere.value).toBe(false)
  })
})

describe('a malformed :meta sidecar', () => {
  const ID = 'badMetaIdAA'
  const DSL = 'chart donut {\n  title = "Intact"\n  data {\n    "A" = 1\n  }\n}\n'

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    useChartConfig().reset()
    useDataTable().reset()
    useDataTransforms().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
    localStorage.setItem(storageKey(ID), DSL)
    localStorage.setItem(metaKey(ID), '{not json')
  })

  it('keeps the chart listed in My Charts', () => {
    const charts = useChartSession().listSavedCharts()
    expect(charts.map(c => c.id)).toEqual([ID])
    expect(charts[0].title).toBe('Intact')
    expect(charts[0].savedAt).toBeNull()
  })

  it('still opens the chart', () => {
    const session = useChartSession()
    expect(session.loadChart(ID)).toBe(true)
    expect(useChartConfig().title.value).toBe('Intact')
    expect(session.sessionId.value).toBe(ID)
  })

  it('reads as unstamped provenance, so the data block is adopted as stored', () => {
    const withSteps = 'chart bar-vertical {\n  data {\n    "A" = 100\n  }\n\n  transform parse {\n    column = "value"\n    operation = "log"\n  }\n}\n'
    localStorage.setItem(storageKey(ID), withSteps)

    expect(useChartSession().loadChart(ID)).toBe(true)
    expect(useDataTransforms().steps.value).toEqual([])
    expect(useChartConfig().data.value).toContain('"A" = 100')
  })
})
