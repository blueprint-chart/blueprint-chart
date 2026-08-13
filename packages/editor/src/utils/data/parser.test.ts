import { isNumberValue, detectColumnTypes } from './parser'

describe('isNumberValue', () => {
  it('accepts plain numbers', () => {
    expect(isNumberValue('42')).toBe(true)
    expect(isNumberValue('3.14')).toBe(true)
    expect(isNumberValue('-7')).toBe(true)
  })

  it('accepts numbers grouped by spaces', () => {
    expect(isNumberValue('8 978')).toBe(true)
    expect(isNumberValue('1 559 275')).toBe(true)
    expect(isNumberValue('8\u00A0978')).toBe(true)
    expect(isNumberValue('8\u202F978')).toBe(true)
  })

  it('accepts numbers carrying currency, percentage or comma formatting', () => {
    expect(isNumberValue('$1,234.50')).toBe(true)
    expect(isNumberValue('75%')).toBe(true)
  })

  it('rejects text and empty values', () => {
    expect(isNumberValue('North 1')).toBe(false)
    expect(isNumberValue('abc')).toBe(false)
    expect(isNumberValue('')).toBe(false)
  })
})

describe('detectColumnTypes', () => {
  it('types a space-grouped column as numeric', () => {
    const rows = [['Jan', '8 978'], ['Feb', '1 559 275']]
    expect(detectColumnTypes(['month', 'amount'], rows)).toEqual(['string', 'number'])
  })
})
