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

const CHART_WITH_STEPS = `chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending

  data {
    "20 Minutes" = 61%
    "BFMTV"      = 53%
    "Guardian"   = 44%
    "LeMonde"    = 75%
  }

  step "Le leader" {
    sort = descending

    highlight "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }

  step "Le moins bon" {
    sort = ascending

    highlight "Guardian" {
      color = "#45a"
      label = "Le pire"
    }
  }

  step "Année suivante" {
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

    it('has no steps', () => {
      const ast = parse(SIMPLE_CHART)
      expect(ast.steps).toHaveLength(0)
    })
  })

  describe('chart with steps', () => {
    it('parses three steps', () => {
      const ast = parse(CHART_WITH_STEPS)
      expect(ast.steps).toHaveLength(3)
    })

    it('parses step names', () => {
      const ast = parse(CHART_WITH_STEPS)
      expect(ast.steps[0].name).toBe('Le leader')
      expect(ast.steps[1].name).toBe('Le moins bon')
      expect(ast.steps[2].name).toBe('Année suivante')
    })

    it('parses step properties', () => {
      const ast = parse(CHART_WITH_STEPS)
      expect(ast.steps[0].properties).toEqual([
        { type: 'property', key: 'sort', value: 'descending', isPercentage: false },
      ])
    })

    it('parses highlights inside steps', () => {
      const ast = parse(CHART_WITH_STEPS)
      expect(ast.steps[0].highlights).toHaveLength(1)
      expect(ast.steps[0].highlights[0].target).toBe('LeMonde')
      expect(ast.steps[1].highlights).toHaveLength(1)
      expect(ast.steps[1].highlights[0].target).toBe('Guardian')
    })

    it('parses data inside steps', () => {
      const ast = parse(CHART_WITH_STEPS)
      expect(ast.steps[2].data).not.toBeNull()
      expect(ast.steps[2].data!.entries).toHaveLength(4)
      expect(ast.steps[2].data!.entries[0]).toEqual({
        type: 'property',
        key: '20 Minutes',
        value: 51,
        isPercentage: true,
      })
    })

    it('has no data in steps without data block', () => {
      const ast = parse(CHART_WITH_STEPS)
      expect(ast.steps[0].data).toBeNull()
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

    it('throws on missing step name', () => {
      expect(() => parse('chart bar { step { } }')).toThrow(/Expected/)
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
      expect(ast.steps).toHaveLength(0)
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
