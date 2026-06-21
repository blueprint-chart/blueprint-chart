import { describe, test, expect } from 'vitest'
import { computePurge } from './purge'

describe('computePurge', () => {
  test('canPurge true and returns minimized text when defaults are present', () => {
    const result = computePurge('chart bar-vertical {\n  valueLabels = true\n  data {\n    "A" = 1\n  }\n}')
    expect(result.canPurge).toBe(true)
    expect(result.text).not.toBeNull()
    expect(result.text).not.toContain('valueLabels')
  })

  test('canPurge false when nothing is redundant', () => {
    const result = computePurge('chart bar-vertical {\n  valueLabels = false\n  data {\n    "A" = 1\n  }\n}')
    expect(result.canPurge).toBe(false)
  })

  test('canPurge false and text null on invalid DSL', () => {
    const result = computePurge('chart bar-vertical {{{ not valid')
    expect(result.canPurge).toBe(false)
    expect(result.text).toBeNull()
  })
})
