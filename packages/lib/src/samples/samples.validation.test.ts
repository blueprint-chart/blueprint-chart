import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from '../dsl/parser'
import { getChart, getChartOptions } from '../charts/registry'
import { listPalettes } from '../charts/palettes'

const SAMPLES_DIR = join(__dirname)
const bpcFiles = readdirSync(SAMPLES_DIR).filter(f => f.endsWith('.bpc'))

const paletteNames = new Set(listPalettes().map(p => p.name))

// Frame-level properties accepted by all chart types
const FRAME_KEYS = new Set([
  'title', 'description', 'byline', 'note',
  'source', 'sourceUrl',
  'sort', 'sizing', 'aspectRatio', 'showCredit',
])

function validatePropertyKeys(ast: ReturnType<typeof parse>): string[] {
  const optionKeys = new Set(getChartOptions(ast.chartType).map(o => o.key))
  const invalid: string[] = []

  for (const prop of ast.properties) {
    if (!FRAME_KEYS.has(prop.key) && !optionKeys.has(prop.key)) {
      invalid.push(prop.key)
    }
  }

  return invalid
}

function assertParsesWithRegisteredType(content: string): void {
  const ast = parse(content)
  expect(ast.type).toBe('chart')
  const renderer = getChart(ast.chartType)
  expect(renderer, `unknown chart type "${ast.chartType}"`).toBeDefined()
}

function assertValidKeys(content: string): void {
  const ast = parse(content)
  const invalid = validatePropertyKeys(ast)
  expect(invalid, `invalid keys: ${invalid.join(', ')}`).toEqual([])
}

function assertValidPalette(content: string): void {
  const ast = parse(content)
  const paletteProp = ast.properties.find(p => p.key === 'colorPalette')
  if (!paletteProp) {
    return
  }

  const value = String(paletteProp.value)
  expect(paletteNames.has(value), `unknown palette "${value}"`).toBe(true)
}

describe('sample .bpc file discovery', () => {
  it('discovers at least one .bpc file', () => {
    expect(bpcFiles.length).toBeGreaterThan(0)
  })
})

for (const file of bpcFiles) {
  describe(`sample ${file}`, () => {
    const content = readFileSync(join(SAMPLES_DIR, file), 'utf-8')

    it('parses and has a registered chart type', () => {
      assertParsesWithRegisteredType(content)
    })

    it('uses only valid property keys', () => {
      assertValidKeys(content)
    })

    it('uses a valid colorPalette (if specified)', () => {
      assertValidPalette(content)
    })
  })
}
