import { parseData } from '../charts/parse-data'
import { chartDataToTable, parseBpcData, serializeTableData } from './table'

describe('parseBpcData', () => {
  it('keeps a row whose label is empty, like parseData does', () => {
    const result = parseBpcData('"" = 5\n"B" = 9')
    expect(result.rows).toEqual([['', '5'], ['B', '9']])
  })

  it('keeps an empty label in the series format', () => {
    const result = parseBpcData('series = "X","Y"\n"" = 1,2\n"B" = 3,4')
    expect(result.rows).toEqual([['', '1', '2'], ['B', '3', '4']])
  })
})

describe('chartDataToTable', () => {
  it('keeps text cells when rebuilding a table from chart data', () => {
    const data = parseData('series = "GDP","Continent"\n"France" = 44000, "Europe"')
    expect(chartDataToTable(data).rows).toEqual([['France', '44000', 'Europe']])
  })

  it('leaves numeric-only chart data unchanged', () => {
    const data = parseData('series = "A","B"\n"x" = 1, 2')
    expect(chartDataToTable(data).rows).toEqual([['x', '1', '2']])
  })

  it('serializes a text cell back as a quoted string', () => {
    expect(serializeTableData(['label', 'GDP', 'Continent'], [['France', '44000', 'Europe']]))
      .toContain('"France" = 44000,"Europe"')
  })
})
