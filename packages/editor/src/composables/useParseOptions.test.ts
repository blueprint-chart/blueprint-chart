import { describe, it, expect, beforeEach } from 'vitest'
import { useParseOptions } from './useParseOptions'

describe('useParseOptions', () => {
  beforeEach(() => {
    useParseOptions().reset()
  })

  it('has correct defaults', () => {
    const { firstRowIsHeader, delimiter, decimalSeparator, treatEmptyAsNull, trimWhitespace } = useParseOptions()
    expect(firstRowIsHeader.value).toBe(true)
    expect(delimiter.value).toBe('auto')
    expect(decimalSeparator.value).toBe('.')
    expect(treatEmptyAsNull.value).toBe(true)
    expect(trimWhitespace.value).toBe(true)
  })

  it('updates an option', () => {
    const { delimiter, setOption } = useParseOptions()
    setOption('delimiter', ',')
    expect(delimiter.value).toBe(',')
  })

  it('updates boolean option', () => {
    const { firstRowIsHeader, setOption } = useParseOptions()
    setOption('firstRowIsHeader', false)
    expect(firstRowIsHeader.value).toBe(false)
  })

  it('resets to defaults', () => {
    const opts = useParseOptions()
    opts.setOption('delimiter', ';')
    opts.setOption('firstRowIsHeader', false)
    opts.reset()
    expect(opts.delimiter.value).toBe('auto')
    expect(opts.firstRowIsHeader.value).toBe(true)
  })

  it('is a singleton', () => {
    const a = useParseOptions()
    const b = useParseOptions()
    a.setOption('delimiter', '\t')
    expect(b.delimiter.value).toBe('\t')
  })
})
