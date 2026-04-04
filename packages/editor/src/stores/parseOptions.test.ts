import { useParseOptionsStore as useParseOptions } from './parseOptions'

describe('useParseOptions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct defaults', () => {
    const store = useParseOptions()
    const { firstRowIsHeader, delimiter, decimalSeparator, treatEmptyAsNull, trimWhitespace } = storeToRefs(store)
    expect(firstRowIsHeader.value).toBe(true)
    expect(delimiter.value).toBe('auto')
    expect(decimalSeparator.value).toBe('.')
    expect(treatEmptyAsNull.value).toBe(true)
    expect(trimWhitespace.value).toBe(true)
  })

  it('updates an option', () => {
    const store = useParseOptions()
    const { delimiter } = storeToRefs(store)
    store.setOption('delimiter', ',')
    expect(delimiter.value).toBe(',')
  })

  it('updates boolean option', () => {
    const store = useParseOptions()
    const { firstRowIsHeader } = storeToRefs(store)
    store.setOption('firstRowIsHeader', false)
    expect(firstRowIsHeader.value).toBe(false)
  })

  it('resets to defaults', () => {
    const store = useParseOptions()
    const { delimiter, firstRowIsHeader } = storeToRefs(store)
    store.setOption('delimiter', ';')
    store.setOption('firstRowIsHeader', false)
    store.reset()
    expect(delimiter.value).toBe('auto')
    expect(firstRowIsHeader.value).toBe(true)
  })

  it('is a singleton', () => {
    const a = useParseOptions()
    const b = useParseOptions()
    a.setOption('delimiter', '\t')
    expect(b.delimiter).toBe('\t')
  })
})
