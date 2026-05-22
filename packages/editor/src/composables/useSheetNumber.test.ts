import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSheetNumber } from './useSheetNumber'
import { useChartSession } from '@/stores/chartSession'

describe('useSheetNumber', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('returns "S-———" while the chart has no sheet number', () => {
    const session = useChartSession()
    session.prepareNew()
    const { sheetNumber, isDraft } = useSheetNumber()
    expect(sheetNumber.value).toBe('S-———')
    expect(isDraft.value).toBe(true)
  })

  it('returns "S-014" when the underlying number is "014"', () => {
    const session = useChartSession()
    session.prepareNew()
    session.createSession()
    // Pretend a previous chart got S-013:
    localStorage.setItem('blueprint-chart:prev:meta', JSON.stringify({ sheetNumber: '013' }))
    session.assignSheetNumber()
    const { sheetNumber, isDraft } = useSheetNumber()
    expect(sheetNumber.value).toBe('S-014')
    expect(isDraft.value).toBe(false)
  })

  it('reactively updates when the store changes', () => {
    const session = useChartSession()
    session.prepareNew()
    const { sheetNumber } = useSheetNumber()
    expect(sheetNumber.value).toBe('S-———')
    session.createSession()
    session.assignSheetNumber()
    expect(sheetNumber.value).toBe('S-001')
  })
})
