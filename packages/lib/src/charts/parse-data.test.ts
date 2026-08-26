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
