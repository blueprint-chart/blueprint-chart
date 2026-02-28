import { describe, it, expect, beforeEach } from 'vitest'
import { generateId, useChartSession } from './useChartSession'
import { useChartConfig } from './useChartConfig'
import { useDataTable } from './useDataTable'
import { useChartTypeOptions } from './useChartTypeOptions'
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
    useChartTypeOptions().reset()
    useWizard().reset()
  })

  it('save and load round-trip preserves chart config', () => {
    const session = useChartSession()
    session.newChart()

    const config = useChartConfig()
    config.title.value = 'Test Title'
    config.chartType.value = 'donut'
    session.save()

    const id = session.sessionId.value

    // Reset and reload
    config.reset()
    expect(config.title.value).toBe('')

    const loaded = session.load(id)
    expect(loaded).toBe(true)
    expect(config.title.value).toBe('Test Title')
    expect(config.chartType.value).toBe('donut')
  })

  it('save and load round-trip preserves data table', () => {
    const session = useChartSession()
    session.newChart()

    const table = useDataTable()
    table.hydrate({ columns: ['Name', 'Value'], rows: [['A', '1']], rawInput: 'A,1' })
    session.save()

    const id = session.sessionId.value
    table.reset()

    session.load(id)
    expect(table.columns.value).toEqual(['Name', 'Value'])
    expect(table.rows.value).toEqual([['A', '1']])
    expect(table.rawInput.value).toBe('A,1')
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

  it('save and load round-trip preserves chart type options', () => {
    const session = useChartSession()
    session.newChart()

    const options = useChartTypeOptions()
    options.setOption('legend', true)
    session.save()

    const id = session.sessionId.value
    options.reset()

    session.load(id)
    expect(options.store['bar-vertical']).toBeDefined()
    expect(options.store['bar-vertical']?.legend).toBe(true)
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

  it('save includes savedAt timestamp', () => {
    const session = useChartSession()
    session.newChart()
    session.save()

    const raw = localStorage.getItem(`blueprint-chart:${session.sessionId.value}`)
    const payload = JSON.parse(raw!)
    expect(payload.savedAt).toBeDefined()
    expect(new Date(payload.savedAt).getTime()).not.toBeNaN()
  })

  it('listSavedCharts returns saved charts sorted by most recent', () => {
    localStorage.clear()
    const session = useChartSession()

    const firstId = 'firstId0001'
    localStorage.setItem(`blueprint-chart:${firstId}`, JSON.stringify({
      chartConfig: { chartType: 'line', title: 'First', description: '', byline: '', source: '', sourceUrl: '', sort: 'none', data: [], highlights: [] },
      dataTable: { columns: [], rows: [], rawInput: '' },
      chartTypeOptions: {},
      wizard: { currentIndex: 0, furthestIndex: 0 },
      savedAt: '2025-01-01T00:00:00.000Z',
    }))
    const secondId = 'secondId001'
    localStorage.setItem(`blueprint-chart:${secondId}`, JSON.stringify({
      chartConfig: { chartType: 'donut', title: 'Second', description: '', byline: '', source: '', sourceUrl: '', sort: 'none', data: [], highlights: [] },
      dataTable: { columns: [], rows: [], rawInput: '' },
      chartTypeOptions: {},
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

  it('deleteChart removes chart from localStorage', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    const id = session.sessionId.value

    expect(localStorage.getItem(`blueprint-chart:${id}`)).not.toBeNull()
    session.deleteChart(id)
    expect(localStorage.getItem(`blueprint-chart:${id}`)).toBeNull()
  })
})
