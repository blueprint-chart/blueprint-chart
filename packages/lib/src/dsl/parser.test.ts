import { describe, expect, it } from 'vitest'
import { parse } from './parser'

const SIMPLE_CHART = `chart horizontal-bar {
  title = "Couverture médiatique"
  sort = descending

  data {
    "20 Minutes" = 61.11%
    "BFMTV"      = 53.85%
    "Guardian"   = 44.44%
    "LeMonde"    = 75.00%
  }

  highlight "Guardian" {
    color = "#e53e3e"
    label = "Leader"
  }
}`

const CHART_WITH_SCENES = `chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending

  data {
    "20 Minutes" = 61%
    "BFMTV"      = 53%
    "Guardian"   = 44%
    "LeMonde"    = 75%
  }

  scene "Le leader" {
    sort = descending

    highlight "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }

  scene "Le moins bon" {
    sort = ascending

    highlight "Guardian" {
      color = "#45a"
      label = "Le pire"
    }
  }

  scene "Année suivante" {
    title = "Couverture médiatique en 2026"

    data {
      "20 Minutes" = 51%
      "BFMTV"      = 73%
      "Guardian"   = 84%
      "LeMonde"    = 25%
    }
  }
}`

describe('parser', () => {
  describe('simple chart', () => {
    it('parses the chart type', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.type).toBe('chart')
      expect(ast.chartType).toBe('horizontal-bar')
    })

    it('parses chart properties', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.properties).toHaveLength(2)
      expect(ast.properties[0]).toEqual({
        type: 'property',
        key: 'title',
        value: 'Couverture médiatique',
        isPercentage: false,
      })
      expect(ast.properties[1]).toEqual({
        type: 'property',
        key: 'sort',
        value: 'descending',
        isPercentage: false,
      })
    })

    it('parses data block', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.data).not.toBeNull()
      expect(ast.data!.entries).toHaveLength(4)
      expect(ast.data!.entries[0]).toEqual({
        type: 'property',
        key: '20 Minutes',
        value: 61.11,
        isPercentage: true,
      })
      expect(ast.data!.entries[3]).toEqual({
        type: 'property',
        key: 'LeMonde',
        value: 75,
        isPercentage: true,
      })
    })

    it('parses highlight block', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.highlights).toHaveLength(1)
      expect(ast.highlights[0].target).toBe('Guardian')
      expect(ast.highlights[0].properties).toHaveLength(2)
      expect(ast.highlights[0].properties[0]).toEqual({
        type: 'property',
        key: 'color',
        value: '#e53e3e',
        isPercentage: false,
      })
    })

    it('has no scenes', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.scenes).toHaveLength(0)
    })
  })

  describe('chart with scenes', () => {
    it('parses three scenes', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes).toHaveLength(3)
    })

    it('parses scene names', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].name).toBe('Le leader')
      expect(ast.scenes[1].name).toBe('Le moins bon')
      expect(ast.scenes[2].name).toBe('Année suivante')
    })

    it('parses scene properties', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].properties).toEqual([
        { type: 'property', key: 'sort', value: 'descending', isPercentage: false },
      ])
    })

    it('parses highlights inside scenes', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].highlights).toHaveLength(1)
      expect(ast.scenes[0].highlights[0].target).toBe('LeMonde')
      expect(ast.scenes[1].highlights).toHaveLength(1)
      expect(ast.scenes[1].highlights[0].target).toBe('Guardian')
    })

    it('parses data inside scenes', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[2].data).not.toBeNull()
      expect(ast.scenes[2].data!.entries).toHaveLength(4)
      expect(ast.scenes[2].data!.entries[0]).toEqual({
        type: 'property',
        key: '20 Minutes',
        value: 51,
        isPercentage: true,
      })
    })

    it('has no data in scenes without data block', () => {
      const ast = parse(CHART_WITH_SCENES)
      expect(ast.scenes[0].data).toBeNull()
    })

    it('parses scene with no name', () => {
      const ast = parse('chart bar {\n  scene {\n    title = "unnamed"\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].name).toBeNull()
      expect(ast.scenes[0].properties).toHaveLength(1)
    })

    it('parses scene with series', () => {
      const ast = parse('chart line {\n  scene "S1" {\n    series "Revenue" {\n      color = "#f00"\n    }\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].series).toHaveLength(1)
      expect(ast.scenes[0].series[0].name).toBe('Revenue')
    })

    it('parses scene with transforms', () => {
      const ast = parse('chart line {\n  scene "S1" {\n    transform cumulative {\n      enabled = true\n    }\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].transforms).toHaveLength(1)
      expect(ast.scenes[0].transforms[0].transformType).toBe('cumulative')
    })

    it('accepts backward-compatible "step" keyword', () => {
      const ast = parse('chart bar {\n  step "Old" {\n    title = "compat"\n  }\n}')
      expect(ast.scenes).toHaveLength(1)
      expect(ast.scenes[0].type).toBe('scene')
      expect(ast.scenes[0].name).toBe('Old')
    })
  })

  describe('error handling', () => {
    it('throws on missing chart keyword', () => {
      expect(() => parse('foo {}')).toThrow(/Expected "chart"/)
    })

    it('throws on missing opening brace', () => {
      expect(() => parse('chart bar }')).toThrow(/Expected "\{"/)
    })

    it('throws on missing closing brace', () => {
      expect(() => parse('chart bar { title = "x"')).toThrow(/Expected/)
    })

    it('throws on missing equals in property', () => {
      expect(() => parse('chart bar { title "x" }')).toThrow(/Expected "="/)
    })

    it('throws on invalid property value', () => {
      expect(() => parse('chart bar { title = { } }')).toThrow(/Expected/)
    })

    it('throws on missing highlight target', () => {
      expect(() => parse('chart bar { highlight { } }')).toThrow(/Expected/)
    })

    it('includes line and column in error', () => {
      try {
        parse('chart bar {\n  title "x"\n}')
        expect.fail('Should have thrown')
      }
      catch (e) {
        expect((e as Error).message).toMatch(/2:\d+/)
      }
    })
  })

  describe('tabular/TSV data syntax', () => {
    it('parses tab-separated data entries', () => {
      const ast = parse('chart bar {\n  data {\n    Apple\t42\n    Banana\t58\n  }\n}')
      expect(ast.data).not.toBeNull()
      expect(ast.data!.entries).toHaveLength(2)
      expect(ast.data!.entries[0]).toEqual({
        type: 'property',
        key: 'Apple',
        value: 42,
        isPercentage: false,
      })
      expect(ast.data!.entries[1]).toEqual({
        type: 'property',
        key: 'Banana',
        value: 58,
        isPercentage: false,
      })
    })

    it('parses tab-separated percentage values', () => {
      const ast = parse('chart bar {\n  data {\n    Sales\t75%\n  }\n}')
      expect(ast.data!.entries[0]).toEqual({
        type: 'property',
        key: 'Sales',
        value: 75,
        isPercentage: true,
      })
    })

    it('parses tab-separated labels with spaces', () => {
      const ast = parse('chart bar {\n  data {\n    New York\t100\n    Los Angeles\t80\n  }\n}')
      expect(ast.data!.entries[0].key).toBe('New York')
      expect(ast.data!.entries[1].key).toBe('Los Angeles')
    })

    it('parses tab-separated string values', () => {
      const ast = parse('chart bar {\n  data {\n    Item\t"hello world"\n  }\n}')
      expect(ast.data!.entries[0]).toEqual({
        type: 'property',
        key: 'Item',
        value: 'hello world',
        isPercentage: false,
      })
    })

    it('mixes tabular and standard data entries', () => {
      const ast = parse('chart bar {\n  data {\n    "Quoted" = 10\n    Unquoted\t20\n  }\n}')
      expect(ast.data!.entries).toHaveLength(2)
      expect(ast.data!.entries[0].key).toBe('Quoted')
      expect(ast.data!.entries[0].value).toBe(10)
      expect(ast.data!.entries[1].key).toBe('Unquoted')
      expect(ast.data!.entries[1].value).toBe(20)
    })
  })

  describe('edge cases', () => {
    it('parses chart with no properties or blocks', () => {
      const ast = parse('chart bar {}')
      expect(ast.chartType).toBe('bar')
      expect(ast.properties).toHaveLength(0)
      expect(ast.data).toBeNull()
      expect(ast.highlights).toHaveLength(0)
      expect(ast.scenes).toHaveLength(0)
    })

    it('parses integer percentage values', () => {
      const ast = parse('chart bar { data { "A" = 50% } }')
      expect(ast.data!.entries[0].value).toBe(50)
      expect(ast.data!.entries[0].isPercentage).toBe(true)
    })

    it('parses non-percentage numbers', () => {
      const ast = parse('chart bar { width = 100 }')
      expect(ast.properties[0].value).toBe(100)
      expect(ast.properties[0].isPercentage).toBe(false)
    })

    it('parses string property values', () => {
      const ast = parse('chart bar { title = "Hello World" }')
      expect(ast.properties[0].value).toBe('Hello World')
    })

    it('parses multiple highlights', () => {
      const input = `chart bar {
        highlight "A" { color = "#f00" }
        highlight "B" { color = "#0f0" }
      }`
      const ast = parse(input)
      expect(ast.highlights).toHaveLength(2)
    })
  })
})
