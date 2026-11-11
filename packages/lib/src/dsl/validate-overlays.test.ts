import { describe, expect, it, vi } from 'vitest'
import { validateChart } from './validate'
import { extractChartTypeOptions } from './converter'
import { parse } from './parser'

vi.mock('./converter', async (importOriginal) => {
  const original = await importOriginal<typeof import('./converter')>()
  return { ...original, extractChartTypeOptions: vi.fn(original.extractChartTypeOptions) }
})

describe('validateOverlays', () => {
  it('folds each scene once instead of re-resolving every scene from scratch', () => {
    const sceneCount = 40
    const scenes = Array.from({ length: sceneCount }, (_, i) => `  scene "s${i}" {\n    overlay "T" {}\n  }\n`).join('')
    const ast = parse(`chart bar-vertical {\n  overlay "T" {}\n  data {\n    series = "V","T"\n    "A" = 1,2\n  }\n${scenes}}`)
    vi.mocked(extractChartTypeOptions).mockClear()
    validateChart(ast)
    expect(vi.mocked(extractChartTypeOptions).mock.calls.length).toBeLessThan(sceneCount * 4)
  })
})
