import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from '../dsl/parser'
import { validateChart } from '../dsl/validate'
import { getChart, getChartOptions } from '../charts/registry'
import { listPalettes } from '../charts/palettes'

const SAMPLES_DIR = join(__dirname)
const bpcFiles = readdirSync(SAMPLES_DIR).filter(f => f.endsWith('.bpc'))

const paletteNames = new Set(listPalettes().map(p => p.name))

// Frame-level and layout properties accepted by all chart types
const FRAME_KEYS = new Set([
  'title', 'description', 'byline', 'note',
  'source', 'sourceUrl',
  'sort', 'theme',
  // Layout properties
  'sizing', 'fixedWidth', 'maxWidth',
  'heightMode', 'fixedHeight', 'aspectRatio',
  'padding', 'transparentBackground',
  'player', 'playerPosition',
])

describe('sample .bpc files', () => {
  it('discovers at least one .bpc file', () => {
    expect(bpcFiles.length).toBeGreaterThan(0)
  })

  for (const file of bpcFiles) {
    describe(file, () => {
      const content = readFileSync(join(SAMPLES_DIR, file), 'utf-8')
      const ast = parse(content)

      it('parses without error', () => {
        expect(ast.type).toBe('chart')
      })

      it('passes validateChart with no errors or warnings', () => {
        const result = validateChart(ast)
        const describeIssue = (i: { code: string, path: string, message: string }) => `${i.code} ${i.path}: ${i.message}`
        expect(result.errors.map(describeIssue)).toEqual([])
        expect(result.warnings.map(describeIssue)).toEqual([])
      })

      it('has a registered chart type', () => {
        const renderer = getChart(ast.chartType)
        expect(renderer, `unknown chart type "${ast.chartType}"`).toBeDefined()
      })

      it('uses only valid property keys', () => {
        const optionKeys = new Set(getChartOptions(ast.chartType).map(o => o.key))
        const invalid: string[] = []

        for (const prop of ast.properties) {
          if (!FRAME_KEYS.has(prop.key) && !optionKeys.has(prop.key)) {
            invalid.push(prop.key)
          }
        }

        expect(invalid, `invalid keys: ${invalid.join(', ')}`).toEqual([])
      })

      it('has a declarative title (≥ 30 chars)', () => {
        const title = ast.properties.find(p => p.key === 'title')
        expect(title, 'missing "title" property').toBeDefined()
        const value = String(title!.value)
        expect(
          value.length,
          `title too short (${value.length} chars): "${value}" — use a declarative takeaway`,
        ).toBeGreaterThanOrEqual(30)
      })

      it('has a source and sourceUrl', () => {
        const source = ast.properties.find(p => p.key === 'source')
        expect(source, 'missing "source" property').toBeDefined()

        const FICTIONAL_SAMPLES = new Set([
          'quarterly-stacked-columns.bpc',
        ])

        if (!FICTIONAL_SAMPLES.has(file)) {
          const sourceUrl = ast.properties.find(p => p.key === 'sourceUrl')
          expect(sourceUrl, 'missing "sourceUrl" property').toBeDefined()
        }
      })

      it('uses a valid colorPalette (if specified)', () => {
        const paletteProp = ast.properties.find(p => p.key === 'colorPalette')
        if (!paletteProp) {
          return
        }

        const value = String(paletteProp.value)
        expect(paletteNames.has(value), `unknown palette "${value}"`).toBe(true)
      })
    })
  }
})
