import { describe, it, expect } from 'vitest'
import { buildColorOverrides } from './colorize'

describe('buildColorOverrides', () => {
  it('returns an empty map for undefined/empty', () => {
    expect(buildColorOverrides(undefined).size).toBe(0)
    expect(buildColorOverrides([]).size).toBe(0)
  })
  it('maps each target to its colour', () => {
    const m = buildColorOverrides([{ target: 'A', color: '#ff0000' }, { target: 'B', color: '#00ff00' }])
    expect(m.get('A')).toBe('#ff0000')
    expect(m.get('B')).toBe('#00ff00')
    expect(m.get('C')).toBeUndefined()
  })
})
