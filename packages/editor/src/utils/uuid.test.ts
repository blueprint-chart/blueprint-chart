import { afterEach, describe, expect, it, vi } from 'vitest'
import { randomUUID } from './uuid'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('randomUUID', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a v4 UUID', () => {
    expect(randomUUID()).toMatch(UUID_V4)
  })

  it('works outside a secure context, where crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })
    const ids = new Set(Array.from({ length: 100 }, randomUUID))
    expect([...ids].every(id => UUID_V4.test(id))).toBe(true)
    expect(ids.size).toBe(100)
  })
})
