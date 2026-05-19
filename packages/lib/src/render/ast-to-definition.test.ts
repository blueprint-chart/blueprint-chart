import { describe, it, expect } from 'vitest'
import { parse } from '../dsl/parser'
import { astToDefinition } from './ast-to-definition'
import { ChartType } from '../enums'

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
})
