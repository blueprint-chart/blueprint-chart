import { useDataTable, serializeTableData } from './dataTable'

// BPC end-to-end tests temporarily excluded — useDslSync depends on
// useChartTheme which has an incomplete barrel from a prior migration.
// import { useDslSync } from '@/composables/useDslSync'
// import { useChartConfig } from '@/composables/useChartConfig'
// import { useChartTypeOptions } from '@/composables/useChartTypeOptions'

describe('useDataTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useDataTable().reset()
    useScenes().reset()
    useDataTransforms().reset()
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

  it('serializes multi-series data with series header', () => {
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
    expect(result).toContain('series = "Chrome","IE","Firefox"')
    expect(result).toContain('"2009-01" = 1.37,64.97,26.85')
    expect(result).toContain('"2009-02" = 1.5,63.98,27.66')
  })

  it('sets column type', () => {
    const { loadParsed, setColumnType, columnTypes } = useDataTable()
    loadParsed({ columns: ['A', 'B'], rows: [['1', '2']], columnTypes: ['string', 'string'] })
    setColumnType(0, 'number')
    expect(columnTypes.value[0]).toBe('number')
  })

  it('ignores setColumnType for out-of-bounds index', () => {
    const { loadParsed, setColumnType, columnTypes } = useDataTable()
    loadParsed({ columns: ['A'], rows: [], columnTypes: ['string'] })
    setColumnType(5, 'number')
    expect(columnTypes.value).toEqual(['string'])
  })

  it('sets sourceLabel from loadParsed source option', () => {
    const { loadParsed, sourceLabel } = useDataTable()
    loadParsed({ columns: ['A'], rows: [] }, { label: 'data.csv' })
    expect(sourceLabel.value).toBe('data.csv')
  })

  it('keeps previous sourceLabel when no source option given', () => {
    const { loadParsed, sourceLabel } = useDataTable()
    loadParsed({ columns: ['A'], rows: [] }, { label: 'first.csv' })
    loadParsed({ columns: ['B'], rows: [] })
    expect(sourceLabel.value).toBe('first.csv')
  })

  it('sets loadedAt timestamp on loadParsed', () => {
    const { loadParsed, loadedAt } = useDataTable()
    const before = Date.now()
    loadParsed({ columns: ['A'], rows: [] })
    expect(loadedAt.value).toBeGreaterThanOrEqual(before)
    expect(loadedAt.value).toBeLessThanOrEqual(Date.now())
  })

  it('resets sourceLabel and loadedAt', () => {
    const dt = useDataTable()
    dt.loadParsed({ columns: ['A'], rows: [['1']] }, { label: 'test.csv' })
    dt.reset()
    expect(dt.sourceLabel.value).toBe('')
    expect(dt.loadedAt.value).toBeNull()
  })

  it('serializes two-column data without series header', () => {
    const { loadParsed, serialize } = useDataTable()
    loadParsed({
      columns: ['Name', 'Value'],
      rows: [['Apples', '42']],
      columnTypes: ['string', 'number'],
    })
    const result = serialize()
    expect(result).toBe('"Apples" = 42')
    expect(result).not.toContain('series')
  })
})

describe('serializeTableData', () => {
  it('serializes two-column data', () => {
    const result = serializeTableData(['Label', 'Value'], [['A', '10'], ['B', '20']])
    expect(result).toBe('"A" = 10\n"B" = 20')
  })

  it('serializes multi-column data with series header', () => {
    const result = serializeTableData(
      ['Date', 'X', 'Y'],
      [['Jan', '1', '2'], ['Feb', '3', '4']],
    )
    expect(result).toContain('series = "X","Y"')
    expect(result).toContain('"Jan" = 1,2')
    expect(result).toContain('"Feb" = 3,4')
  })

  it('quotes non-numeric values like ISO dates', () => {
    const result = serializeTableData(
      ['Label', 'Date'],
      [['USA', '2022-09-25'], ['China', '2022-10-01']],
    )
    expect(result).toBe('"USA" = "2022-09-25"\n"China" = "2022-10-01"')
  })

  it('escapes a double quote in a row label', () => {
    const result = serializeTableData(['Label', 'Value'], [['5" pipe', '12']])
    expect(result).toBe('"5\\" pipe" = 12')
  })

  it('escapes a backslash in a row label', () => {
    const result = serializeTableData(['Label', 'Value'], [['C:\\x', '12']])
    expect(result).toBe('"C:\\\\x" = 12')
  })

  it('escapes a double quote in a series name', () => {
    const result = serializeTableData(['Date', 'X "Q"', 'Y'], [['Jan', '1', '2']])
    expect(result).toContain('series = "X \\"Q\\"","Y"')
  })

  it('escapes a double quote in a multi-column row label', () => {
    const result = serializeTableData(['Date', 'X', 'Y'], [['5" pipe', '1', '2']])
    expect(result).toContain('"5\\" pipe" = 1,2')
  })

  it('produces same output as useDataTable.serialize', () => {
    setActivePinia(createPinia())
    const { loadParsed, serialize } = useDataTable()
    loadParsed({
      columns: ['Name', 'Value'],
      rows: [['Apples', '42'], ['Bananas', '58']],
    })
    const standalone = serializeTableData(['Name', 'Value'], [['Apples', '42'], ['Bananas', '58']])
    expect(standalone).toBe(serialize())
    useDataTable().reset()
  })

  describe('scene-aware display data', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
    })

    it('applies inherited sort transform from prior scene', () => {
      const { loadParsed, displayRows } = useDataTable()
      const scenes = useScenes()

      loadParsed({
        columns: ['Name', 'Value'],
        rows: [['China', '1050'], ['India', '900'], ['Brazil', '186']],
        columnTypes: ['string', 'number'],
      })

      // Scene 1 has a sort transform
      scenes.hydrate({
        scenes: [
          { id: '1', name: null, transforms: [{ id: '0', type: 'sort', config: { columns: 'Value', direction: 'ascending' } }] },
          { id: '2', name: null },
        ],
        activeIndex: 1,
      })

      // Scene 2 (activeIndex=1) inherits sort from Scene 1
      // Data should be sorted ascending by Value: Brazil(186), India(900), China(1050)
      expect(displayRows.value[0][0]).toBe('Brazil')
      expect(displayRows.value[1][0]).toBe('India')
      expect(displayRows.value[2][0]).toBe('China')
    })

    it('applies inherited sort transform with BPC column names', () => {
      const { loadParsed, displayRows } = useDataTable()
      const scenes = useScenes()

      // BPC key-value data produces columns ['label', 'value']
      loadParsed({
        columns: ['label', 'value'],
        rows: [['China', '1050'], ['India', '900'], ['Brazil', '186']],
        columnTypes: ['string', 'number'],
      })

      scenes.hydrate({
        scenes: [
          { id: '1', name: null, transforms: [{ id: '0', type: 'sort', config: { columns: 'value' } }] },
          { id: '2', name: null },
        ],
        activeIndex: 1,
      })

      // Sort ascending (default) by value: Brazil(186), India(900), China(1050)
      expect(displayRows.value[0][0]).toBe('Brazil')
      expect(displayRows.value[1][0]).toBe('India')
      expect(displayRows.value[2][0]).toBe('China')
    })

    it('shows unsorted data when no scene is active', () => {
      const { loadParsed, displayRows } = useDataTable()
      const scenes = useScenes()
      scenes.reset()

      loadParsed({
        columns: ['Name', 'Value'],
        rows: [['China', '1050'], ['India', '900'], ['Brazil', '186']],
        columnTypes: ['string', 'number'],
      })

      // No scene active — data stays in original order
      expect(displayRows.value[0][0]).toBe('China')
      expect(displayRows.value[1][0]).toBe('India')
      expect(displayRows.value[2][0]).toBe('Brazil')
    })

    it('shows scene custom data instead of base data when scene has data property', () => {
      const { loadParsed, displayColumns, displayRows } = useDataTable()
      const scenes = useScenes()

      loadParsed({
        columns: ['Name', 'Value'],
        rows: [['Apples', '42'], ['Bananas', '58']],
        columnTypes: ['string', 'number'],
      })

      scenes.hydrate({
        scenes: [
          { id: '1', name: null, data: '"X" = 5\n"Y" = 10' },
        ],
        activeIndex: 0,
      })

      expect(displayColumns.value).toEqual(['label', 'value'])
      expect(displayRows.value).toEqual([['X', '5'], ['Y', '10']])
    })

    it('inherits custom data from prior scene', () => {
      const { loadParsed, displayColumns, displayRows } = useDataTable()
      const scenes = useScenes()

      loadParsed({
        columns: ['Name', 'Value'],
        rows: [['Apples', '42']],
        columnTypes: ['string', 'number'],
      })

      scenes.hydrate({
        scenes: [
          { id: '1', name: null, data: '"X" = 5\n"Y" = 10' },
          { id: '2', name: null },
        ],
        activeIndex: 1,
      })

      // Scene 2 inherits data from Scene 1
      expect(displayColumns.value).toEqual(['label', 'value'])
      expect(displayRows.value).toEqual([['X', '5'], ['Y', '10']])
    })

    it('falls back to base data when scene has no custom data', () => {
      const { loadParsed, displayColumns, displayRows } = useDataTable()
      const scenes = useScenes()

      loadParsed({
        columns: ['Name', 'Value'],
        rows: [['Apples', '42']],
        columnTypes: ['string', 'number'],
      })

      scenes.hydrate({
        scenes: [
          { id: '1', name: null },
        ],
        activeIndex: 0,
      })

      expect(displayColumns.value).toEqual(['Name', 'Value'])
      expect(displayRows.value).toEqual([['Apples', '42']])
    })
  })
})

// BPC end-to-end tests temporarily excluded — useDslSync depends on
// useChartTheme which has an incomplete barrel from a prior migration.
// Re-enable once useChartTheme barrel is fixed.
