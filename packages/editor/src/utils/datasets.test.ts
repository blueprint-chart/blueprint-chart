import { describe, expect, it } from 'vitest'
import { dataEntriesToString, parse } from '@blueprint-chart/lib'
import { collectDatasets, groupDatasets } from './datasets'
import type { StoredChart } from './datasets'

const DATA = `  data {
    "Brazil" = 37.4
    "Vietnam" = 27.5
    "Colombia" = 12.76
  }`

const SORT = `  transform sort {
    column = "value"
    direction = descending
  }`

function bpc(options: { type?: string, title?: string, data?: string | null, extra?: string } = {}) {
  const { type = 'bar', title = 'Coffee', data = DATA, extra = '' } = options
  return `chart ${type} {\n  title = "${title}"\n\n${data ?? ''}\n${extra}\n}`
}

function stored(id: string, dsl: string, meta: Record<string, unknown> = { schema: 2, savedAt: '2026-11-01T00:00:00Z' }): StoredChart {
  return { id, dsl, meta }
}

describe('collectDatasets', () => {
  it('groups two charts with the same data and steps into one dataset', () => {
    const result = collectDatasets([
      stored('old', bpc({ extra: SORT }), { schema: 2, savedAt: '2026-11-01T00:00:00Z' }),
      stored('new', bpc({ extra: SORT }), { schema: 2, savedAt: '2026-11-02T00:00:00Z' }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].charts.map(c => c.id)).toEqual(['new', 'old'])
  })

  it('splits the same data with different steps into two datasets', () => {
    const result = collectDatasets([
      stored('a', bpc({ extra: SORT })),
      stored('b', bpc()),
    ])
    expect(result).toHaveLength(2)
  })

  it('takes name, chartType and source from the newest chart', () => {
    const delimited = (label: string) => ({ schema: 2, sourceFormat: 'delimited', rawInput: `a\tb\n${label}`, sourceLabel: label })
    const result = collectDatasets([
      stored('bar', bpc({ type: 'bar', title: 'Old bar' }), { ...delimited('old.csv'), savedAt: '2026-11-01T00:00:00Z' }),
      stored('line', bpc({ type: 'line', title: 'New line' }), { ...delimited('new.csv'), savedAt: '2026-11-02T00:00:00Z' }),
    ])
    expect(result[0].chartType).toBe('line')
    expect(result[0].charts[0].title).toBe('New line')
    expect(result[0].source?.sourceLabel).toBe('new.csv')
  })

  it('ignores steps of charts saved before schema v2', () => {
    const result = collectDatasets([stored('a', bpc({ extra: SORT }), { schema: 1 })])
    expect(result[0].steps).toEqual([])
    expect(parse(result[0].dsl).transforms).toHaveLength(0)
  })

  it('groups a pre-v2 chart with a v2 chart that has no steps', () => {
    const result = collectDatasets([
      stored('v1', bpc({ extra: SORT }), { schema: 1, savedAt: '2026-11-01T00:00:00Z' }),
      stored('v2', bpc(), { schema: 2, savedAt: '2026-11-02T00:00:00Z' }),
    ])
    expect(result).toHaveLength(1)
  })

  it('reads chart-level steps as stringified config', () => {
    const result = collectDatasets([stored('a', bpc({ extra: SORT }))])
    expect(result[0].steps).toEqual([{ type: 'sort', config: { column: 'value', direction: 'descending' } }])
  })

  it('skips unparseable, legacy JSON, data-less and corrupt-meta charts', () => {
    const result = collectDatasets([
      stored('a', 'not bpc {'),
      stored('b', '{"chartConfig":{}}'),
      stored('c', bpc({ data: null })),
      stored('d', bpc(), null as unknown as Record<string, unknown>),
      stored('ok', bpc()),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].charts.map(c => c.id)).toEqual(['ok'])
  })

  it('keeps a chart whose meta is empty', () => {
    const result = collectDatasets([stored('a', bpc(), {})])
    expect(result[0].charts[0].savedAt).toBeNull()
    expect(result[0].steps).toEqual([])
  })

  it('keeps charts without savedAt, sorted last', () => {
    const result = collectDatasets([
      stored('none', bpc({ data: DATA.replace('37.4', '1') }), { schema: 2 }),
      stored('dated', bpc()),
    ])
    expect(result).toHaveLength(2)
    expect(result[1].charts[0].savedAt).toBeNull()
  })

  it('ignores scene transforms', () => {
    const scene = `  scene "Zoom" {\n    transform sort {\n      column = "value"\n      direction = ascending\n    }\n  }`
    const result = collectDatasets([stored('a', bpc({ extra: `${SORT}\n${scene}` }))])
    expect(result[0].steps).toHaveLength(1)
    expect(result[0].steps[0].config.direction).toBe('descending')
  })

  it('counts rows and columns of the source table', () => {
    const result = collectDatasets([stored('a', bpc())])
    expect(result[0].rowCount).toBe(3)
    expect(result[0].columns).toEqual(['label', 'value'])
  })

  it('builds a stripped dsl that round-trips', () => {
    const extra = `  highlight "Brazil"\n${SORT}\n  scene "Zoom" {\n    title = "x"\n  }`
    const [dataset] = collectDatasets([stored('a', bpc({ extra }))])
    const ast = parse(dataset.dsl)
    expect(ast.chartType).toBe('bar')
    expect(dataEntriesToString(ast.data!)).toBe(dataset.data)
    expect(ast.transforms).toHaveLength(dataset.steps.length)
    expect(ast.scenes).toEqual([])
    expect(ast.annotations).toEqual([])
    expect(ast.properties).toEqual([])
  })

  it('reads the pasted source only when sourceFormat is delimited', () => {
    const base = { schema: 2, rawInput: 'a\tb\n1\t2', sourceLabel: 'file.csv' }
    const delimited = collectDatasets([stored('a', bpc(), { ...base, sourceFormat: 'delimited' })])
    const other = collectDatasets([stored('a', bpc(), { ...base, sourceFormat: 'json' })])
    expect(delimited[0].source).toEqual({ rawInput: 'a\tb\n1\t2', sourceLabel: 'file.csv' })
    expect(other[0].source).toBeNull()
  })

  it('returns no source for pre-v2 charts', () => {
    const meta = { schema: 1, sourceFormat: 'delimited', rawInput: 'a\tb\n1\t2' }
    expect(collectDatasets([stored('a', bpc(), meta)])[0].source).toBeNull()
  })

  it('falls back to an empty source label', () => {
    const meta = { schema: 2, sourceFormat: 'delimited', rawInput: 'a\tb\n1\t2' }
    expect(collectDatasets([stored('a', bpc(), meta)])[0].source?.sourceLabel).toBe('')
  })
})

describe('groupDatasets', () => {
  it('groups pipelines that share the same raw data, newest first', () => {
    const datasets = collectDatasets([
      stored('sorted', bpc({ extra: SORT }), { schema: 2, savedAt: '2026-11-01T00:00:00Z' }),
      stored('raw', bpc(), { schema: 2, savedAt: '2026-11-03T00:00:00Z' }),
      stored('other', bpc({ data: '  data {\n    "A" = 1\n  }' }), { schema: 2, savedAt: '2026-11-02T00:00:00Z' }),
    ])
    const groups = groupDatasets(datasets)
    expect(groups.map(g => g.variants.map(v => v.charts[0].id))).toEqual([['raw', 'sorted'], ['other']])
    expect(groups[0].key).toBe(datasets[0].data)
  })
})
