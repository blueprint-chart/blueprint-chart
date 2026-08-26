import { describe, it, expect } from 'vitest'
import { parseData } from './parse-data'

describe('parseData escaped labels', () => {
  it('keeps a row whose label contains an escaped double quote', () => {
    const raw = `"he said \\"hi\\"" = 10\n"plain" = 20`
    const data = parseData(raw)
    expect(data.labels).toEqual(['he said "hi"', 'plain'])
    expect(data.values).toEqual([10, 20])
  })

  it('keeps a row whose label contains an escaped newline', () => {
    const raw = `"two\\nlines" = 10\n"plain" = 20`
    const data = parseData(raw)
    expect(data.labels).toEqual(['two\nlines', 'plain'])
    expect(data.values).toEqual([10, 20])
  })

  it('keeps a row whose label contains an escaped backslash', () => {
    const raw = `"C:\\\\x" = 10`
    const data = parseData(raw)
    expect(data.labels).toEqual(['C:\\x'])
    expect(data.values).toEqual([10])
  })

  it('keeps an escaped label in a multi-series row', () => {
    const raw = `series = "A","B"\n"5\\" pipe" = 10,20`
    const data = parseData(raw)
    expect(data.labels).toEqual(['5" pipe'])
    expect(data.series![0].values).toEqual([10])
    expect(data.series![1].values).toEqual([20])
  })
})

describe('parseData series header', () => {
  it('does not split a series name on an inner comma', () => {
    const data = parseData('series = "Paris, France","Lyon"\n"x" = 1,2\n"y" = 3,4')
    expect(data.series!.map(s => s.name)).toEqual(['Paris, France', 'Lyon'])
    expect(data.series![0].values).toEqual([1, 3])
    expect(data.series![1].values).toEqual([2, 4])
  })

  it('reads a series name containing an escaped quote', () => {
    const data = parseData('series = "X \\"Q\\"","Y"\n"a" = 1,2')
    expect(data.series!.map(s => s.name)).toEqual(['X "Q"', 'Y'])
  })
})
