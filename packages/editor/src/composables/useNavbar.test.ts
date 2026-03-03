import { describe, it, expect, beforeEach } from 'vitest'
import { useNavbar } from './useNavbar'

describe('useNavbar', () => {
  beforeEach(() => {
    useNavbar().reset()
  })

  it('defaults to home mode', () => {
    const { mode } = useNavbar()
    expect(mode.value).toBe('home')
  })

  it('setMode changes mode', () => {
    const { mode, setMode } = useNavbar()
    setMode('wizard')
    expect(mode.value).toBe('wizard')
  })

  it('reset returns to home mode', () => {
    const { mode, setMode, reset } = useNavbar()
    setMode('wizard')
    reset()
    expect(mode.value).toBe('home')
  })

  it('is a singleton across calls', () => {
    const a = useNavbar()
    const b = useNavbar()
    a.setMode('wizard')
    expect(b.mode.value).toBe('wizard')
  })
})
