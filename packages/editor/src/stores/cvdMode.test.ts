import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCvdModeStore as useCvdMode } from './cvdMode'

describe('useCvdMode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defaults to empty string', () => {
    const store = useCvdMode()
    expect(store.cvdMode).toBe('')
  })

  it('allows setting cvdMode', () => {
    const store = useCvdMode()
    store.cvdMode = 'protanopia'
    expect(store.cvdMode).toBe('protanopia')
  })

  it('is a singleton across calls', () => {
    const a = useCvdMode()
    const b = useCvdMode()
    a.cvdMode = 'deuteranopia'
    expect(b.cvdMode).toBe('deuteranopia')
  })
})
