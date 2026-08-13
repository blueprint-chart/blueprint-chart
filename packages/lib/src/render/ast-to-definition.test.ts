import { describe, it, expect, vi } from 'vitest'
import { parse } from '../dsl/parser'
import { astToDefinition, __resetTransformWarnings } from './ast-to-definition'
import { ChartType, SortMode } from '../enums'

describe('astToDefinition', () => {
  it('converts a minimal BPC to a ChartDefinition', () => {
    const ast = parse(`chart bar-vertical {
  data {
    "a" = 1
    "b" = 2
  }
}`)
    const def = astToDefinition(ast)
    expect(def.chartType).toBe(ChartType.BarVertical)
    expect(def.data.labels).toEqual(['a', 'b'])
    expect(def.data.values).toEqual([1, 2])
    expect(def.scenes).toEqual([])
  })

  it('preserves scenes, colorizes, highlights, annotations', () => {
    const ast = parse(`chart line {
  data { "x" = 1 }
  colorize "x" { color = "#f00" }
  highlight "x"
  scene { highlight "x" }
}`)
    const def = astToDefinition(ast)
    expect(def.colorizes?.length).toBe(1)
    expect(def.highlights?.length).toBe(1)
    expect(def.scenes?.length).toBe(1)
  })

  it('extracts frame fields from properties', () => {
    const ast = parse(`chart bar-vertical {
  title = "My Chart"
  description = "A description"
  data { "a" = 1 }
}`)
    const def = astToDefinition(ast)
    expect(def.frame?.title).toBe('My Chart')
    expect(def.frame?.description).toBe('A description')
  })

  // S9: sortMode property is hoisted to ChartDefinition.sortMode
  it('hoists sortMode from properties onto the definition', () => {
    const ast = parse(`chart bar-multi {
  sortMode = "total"
  data { "a" = "1,2" }
}`)
    const def = astToDefinition(ast)
    expect(def.sortMode).toBe(SortMode.Total)
  })

  // S2/S9: a `transform sort` directive at chart level populates sortMode
  it('translates `transform sort` at chart level into sortMode = total', () => {
    const ast = parse(`chart bar-multi {
  data { "a" = "1,2" }
  transform sort {
    column = "value"
    direction = descending
  }
}`)
    const def = astToDefinition(ast)
    expect(def.sortMode).toBe(SortMode.Total)
  })

  // S2/S9: unknown transform types log a single console.warn
  it('warns exactly once per unknown chart-level transform type', () => {
    __resetTransformWarnings()
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const ast = parse(`chart line {
  data { "a" = 1 }
  transform rolling-average {
    window = 7
  }
}`)
    astToDefinition(ast)
    astToDefinition(ast)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('rolling-average')
    spy.mockRestore()
  })

  // Space-grouped numbers reach parseData still quoted, because
  // dataEntriesToString re-quotes any value that is not a bare number.
  it('reads data values whose digits are grouped by no-break spaces', () => {
    const ast = parse(`chart line {
  data {
    "2021-03-01" = "8\u202F978"
    "2021-06-01" = "53\u202F817"
    "2021-07-01" = "1\u202F559\u202F275"
    "2022-01-01" = "10\u202F000"
    "2024-07-01" = "6\u202F120\u202F163"
    "2026-07-01" = "289\u202F685"
  }
}`)
    const def = astToDefinition(ast)
    expect(def.data.values).toEqual([8978, 53817, 1559275, 10000, 6120163, 289685])
  })
})
