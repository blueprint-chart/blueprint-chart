import { describe, it, expect } from 'vitest'
import { ChartParseError, PngBrowserUnsupportedError, MissingNodeRenderDepsError } from './errors'

describe('render errors', () => {
  it('are Error subclasses with stable names', () => {
    for (const E of [ChartParseError, PngBrowserUnsupportedError, MissingNodeRenderDepsError]) {
      const e = new E('boom')
      expect(e).toBeInstanceOf(Error)
      expect(e.name).toBe(E.name)
      expect(e.message).toBe('boom')
    }
  })
})
