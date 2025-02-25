import { describe, it, expect, beforeEach } from 'vitest'
import { useDataTable } from './useDataTable'

describe('useDataTable', () => {
  beforeEach(() => {
    useDataTable().reset()
  })

  it('starts empty', () => {
    const { columns, rows, rawInput } = useDataTable()
    expect(columns.value).toEqual([])
    expect(rows.value).toEqual([])
    expect(rawInput.value).toBe('')
  })

  it('loads parsed data', () => {
    const { loadParsed, columns, rows } = useDataTable()
    loadParsed({
      columns: ['Name', 'Value'],
      rows: [['Apples', '42'], ['Bananas', '58']],
    })
    expect(columns.value).toEqual(['Name', 'Value'])
    expect(rows.value.length).toBe(2)
  })

  it('renames a column', () => {
    const { loadParsed, renameColumn, columns } = useDataTable()
    loadParsed({ columns: ['A', 'B'], rows: [] })
    renameColumn(0, 'Label')
    expect(columns.value[0]).toBe('Label')
  })

  it('ignores rename for out-of-bounds index', () => {
    const { loadParsed, renameColumn, columns } = useDataTable()
    loadParsed({ columns: ['A'], rows: [] })
    renameColumn(5, 'X')
    expect(columns.value).toEqual(['A'])
  })

  it('updates a cell', () => {
    const { loadParsed, updateCell, rows } = useDataTable()
    loadParsed({ columns: ['A', 'B'], rows: [['1', '2']] })
    updateCell(0, 1, '99')
    expect(rows.value[0][1]).toBe('99')
  })

  it('deletes a row', () => {
    const { loadParsed, deleteRow, rows } = useDataTable()
    loadParsed({ columns: ['A'], rows: [['1'], ['2'], ['3']] })
    deleteRow(1)
    expect(rows.value).toEqual([['1'], ['3']])
  })

  it('serializes to DSL format', () => {
    const { loadParsed, serialize } = useDataTable()
    loadParsed({
      columns: ['Label', 'Value'],
      rows: [['Apples', '42%'], ['Bananas', '58%']],
    })
    const result = serialize()
    expect(result).toBe('"Apples" = 42%\n"Bananas" = 58%')
  })

  it('resets state', () => {
    const dt = useDataTable()
    dt.rawInput.value = 'hello'
    dt.loadParsed({ columns: ['A'], rows: [['1']] })
    dt.reset()
    expect(dt.columns.value).toEqual([])
    expect(dt.rows.value).toEqual([])
    expect(dt.rawInput.value).toBe('')
  })

  it('serializes multi-series data with _series header', () => {
    const { loadParsed, serialize } = useDataTable()
    loadParsed({
      columns: ['Date', 'Chrome', 'IE', 'Firefox'],
      rows: [
        ['2009-01', '1.37', '64.97', '26.85'],
        ['2009-02', '1.5', '63.98', '27.66'],
      ],
      columnTypes: ['date', 'number', 'number', 'number'],
    })
    const result = serialize()
    expect(result).toContain('_series = "Chrome,IE,Firefox"')
    expect(result).toContain('"2009-01" = "1.37,64.97,26.85"')
    expect(result).toContain('"2009-02" = "1.5,63.98,27.66"')
  })

  it('serializes two-column data without _series header', () => {
    const { loadParsed, serialize } = useDataTable()
    loadParsed({
      columns: ['Name', 'Value'],
      rows: [['Apples', '42']],
      columnTypes: ['string', 'number'],
    })
    const result = serialize()
    expect(result).toBe('"Apples" = 42')
    expect(result).not.toContain('_series')
  })
})
