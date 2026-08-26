import { parseBpcData } from './table'

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
