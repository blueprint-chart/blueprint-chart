import { describe, it, expect, beforeEach } from 'vitest'
import { generateId, useChartSession } from './useChartSession'
import { useChartConfig } from './useChartConfig'
import { useDataTable } from './useDataTable'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useWizard } from './useWizard'

describe('generateId', () => {
  it('returns an 11-character string', () => {
    expect(generateId()).toHaveLength(11)
  })

  it('contains only alphanumeric characters', () => {
    expect(generateId()).toMatch(/^[a-zA-Z0-9]{11}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()))
    expect(ids.size).toBe(50)
  })
})

function resetAll() {
  localStorage.clear()
  useChartConfig().reset()
  useDataTable().reset()
  useChartTypeOptions().reset()
  useWizard().reset()
}

beforeEach(() => {
  resetAll()
})

describe('useChartSession config round-trip', () => {
  it('preserves chart config', () => {
    const session = useChartSession()
    session.newChart()
    const config = useChartConfig()
    config.title.value = 'Test Title'
    config.chartType.value = 'donut'
    session.save()
    const id = session.sessionId.value
    config.reset()
    expect(config.title.value).toBe('')
    expect(session.load(id)).toBe(true)
    expect(config.title.value).toBe('Test Title')
    expect(config.chartType.value).toBe('donut')
  })
})

describe('useChartSession data table round-trip', () => {
  it('preserves data table', () => {
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
})

describe('useChartSession wizard round-trip', () => {
  it('preserves wizard state', () => {
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
})

describe('useChartSession options round-trip', () => {
  it('preserves chart type options', () => {
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
})

describe('useChartSession load edge cases', () => {
  it('load returns false for unknown ID', () => {
    expect(useChartSession().load('nonexistent1')).toBe(false)
  })

  it('loadChart returns false when ID not found', () => {
    expect(useChartSession().loadChart('missing1234')).toBe(false)
  })

  it('loadChart returns true for existing chart', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    expect(session.loadChart(session.sessionId.value)).toBe(true)
  })
})

describe('useChartSession newChart', () => {
  it('resets state and generates new ID', () => {
    const session = useChartSession()
    session.newChart()
    const firstId = session.sessionId.value
    useChartConfig().title.value = 'Dirty'
    session.newChart()
    expect(session.sessionId.value).not.toBe(firstId)
    expect(useChartConfig().title.value).toBe('')
  })
})

describe('useChartSession save metadata', () => {
  it('save includes savedAt timestamp', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    const raw = localStorage.getItem(`blueprint-chart:${session.sessionId.value}`)
    const payload = JSON.parse(raw!)
    expect(payload.savedAt).toBeDefined()
    expect(new Date(payload.savedAt).getTime()).not.toBeNaN()
  })
})

function seedTestCharts() {
  const mk = (type: string, title: string, savedAt: string) => JSON.stringify({
    chartConfig: { chartType: type, title, description: '', byline: '', source: '', sourceUrl: '', sort: 'none', data: [], highlights: [] },
    dataTable: { columns: [], rows: [], rawInput: '' },
    chartTypeOptions: {},
    wizard: { currentIndex: 0, furthestIndex: 0 },
    savedAt,
  })
  localStorage.setItem('blueprint-chart:firstId0001', mk('line', 'First', '2025-01-01T00:00:00.000Z'))
  localStorage.setItem('blueprint-chart:secondId001', mk('donut', 'Second', '2025-06-01T00:00:00.000Z'))
}

describe('useChartSession listSavedCharts', () => {
  it('returns saved charts sorted by most recent', () => {
    localStorage.clear()
    seedTestCharts()
    const charts = useChartSession().listSavedCharts()
    expect(charts).toHaveLength(2)
    expect(charts[0].id).toBe('secondId001')
    expect(charts[0].title).toBe('Second')
    expect(charts[0].chartType).toBe('donut')
    expect(charts[1].id).toBe('firstId0001')
  })

  it('ignores non-blueprint keys', () => {
    localStorage.setItem('other-key', 'value')
    localStorage.setItem('another:thing', '{}')
    const charts = useChartSession().listSavedCharts()
    for (const chart of charts) {
      expect(localStorage.getItem(`blueprint-chart:${chart.id}`)).not.toBeNull()
    }
    expect(charts.find(c => c.id === 'other-key')).toBeUndefined()
  })
})

describe('useChartSession deleteChart', () => {
  it('removes chart from localStorage', () => {
    const session = useChartSession()
    session.newChart()
    session.save()
    const id = session.sessionId.value
    expect(localStorage.getItem(`blueprint-chart:${id}`)).not.toBeNull()
    session.deleteChart(id)
    expect(localStorage.getItem(`blueprint-chart:${id}`)).toBeNull()
  })
})
