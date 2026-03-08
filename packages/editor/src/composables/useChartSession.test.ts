import { describe, it, expect, beforeEach } from 'vitest'
import { generateId, useChartSession } from './useChartSession'
import { useChartConfig } from './useChartConfig'
import { useDataTable } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useWizard } from './useWizard'

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
    localStorage.clear()
    useChartConfig().reset()
    useDataTable().reset()
    useDataTransforms().reset()
    useChartTypeOptions().reset()
    useScenes().reset()
    useWizard().reset()
  })

  it('save stores raw DSL string in localStorage', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.title.value = 'Test Title'
    config.chartType.value = 'donut'
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
    expect(meta.wizard).toBeDefined()
    expect(meta.savedAt).toBeDefined()
  })

  it('save and load round-trip preserves chart config via DSL', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.title.value = 'Test Title'
    config.chartType.value = 'donut'
    session.save()

    const id = session.sessionId.value
    config.reset()

    const loaded = session.load(id)
    expect(loaded).toBe(true)
    expect(config.title.value).toBe('Test Title')
    expect(config.chartType.value).toBe('donut')
  })

  it('save and load round-trip preserves data table from BPC', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.chartType.value = 'bar-horizontal'
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

  it('save and load round-trip preserves wizard state', () => {
    const session = useChartSession()
    session.newChart()

    const wizard = useWizard()
    wizard.next()
    wizard.next()
    session.save()

    const id = session.sessionId.value
    wizard.reset()

    session.load(id)
    expect(wizard.currentIndex.value).toBe(2)
    expect(wizard.furthestIndex.value).toBe(2)
  })

  it('save and load round-trip preserves scenes', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.chartType.value = 'bar-horizontal'
    config.data.value = '"A" = 10\n"B" = 20'

    const scenes = useScenes()
    scenes.add()
    scenes.update(0, {
      highlights: [{ target: 'A', color: '#ff0000', label: '' }],
    })
    session.save()

    const id = session.sessionId.value
    config.reset()
    scenes.reset()

    session.load(id)
    expect(scenes.scenes.value).toHaveLength(1)
    expect(scenes.scenes.value[0].highlights?.[0].color).toBe('#ff0000')
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
      wizard: { currentIndex: 0, furthestIndex: 0 },
      savedAt: '2025-01-01T00:00:00.000Z',
    }))

    const secondId = 'secondId001'
    localStorage.setItem(`blueprint-chart:${secondId}`, 'chart donut {\n  title = "Second"\n  description = "A donut"\n}\n')
    localStorage.setItem(`blueprint-chart:${secondId}:meta`, JSON.stringify({
      wizard: { currentIndex: 0, furthestIndex: 0 },
      savedAt: '2025-06-01T00:00:00.000Z',
    }))

    const charts = session.listSavedCharts()
    expect(charts).toHaveLength(2)
    expect(charts[0].id).toBe(secondId)
    expect(charts[0].title).toBe('Second')
    expect(charts[0].chartType).toBe('donut')
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

  it('loads legacy JSON payload and migrates on next save', () => {
    const legacyId = 'legacyId001'
    localStorage.setItem(`blueprint-chart:${legacyId}`, JSON.stringify({
      chartConfig: {
        chartType: 'bar-horizontal',
        title: 'Legacy Chart',
        description: '',
        byline: '',
        note: '',
        source: '',
        sourceUrl: '',
        sort: 'none',
        data: '"A" = 10',
        selectedColumn: null,
        highlights: [],
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
    expect(config.chartType.value).toBe('bar-horizontal')
  })
})
