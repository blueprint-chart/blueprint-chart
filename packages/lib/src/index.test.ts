import { describe, it, expect } from 'vitest'
import { buildSrcdoc } from './index'

describe('lib entry', () => {
  it('re-exports buildSrcdoc for consumers that build the embed iframe', () => {
    const html = buildSrcdoc('chart bar { data { "A" = 10 } }', 'https://example.test/lib.iife.js')
    expect(html).toContain('<script src="https://example.test/lib.iife.js">')
    expect(html).toContain('BlueprintChart.renderBpc')
  })
})
