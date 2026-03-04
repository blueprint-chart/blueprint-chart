import { describe, expect, it } from 'vitest'
import { tokenize } from './lexer'
import type { TokenType } from './lexer'

describe('lexer', () => {
  it('tokenizes empty input', () => {
    const tokens = tokenize('')
    expect(tokens).toHaveLength(1)
    expect(tokens[0].type).toBe('eof')
  })

  it('tokenizes whitespace-only input', () => {
    const tokens = tokenize('   \n   ')
    expect(tokens).toHaveLength(1)
    expect(tokens[0].type).toBe('eof')
  })

  it('tokenizes whitespace with tabs', () => {
    const tokens = tokenize('   \n\t  ')
    expect(tokens).toHaveLength(2)
    expect(tokens[0].type).toBe('tab')
    expect(tokens[1].type).toBe('eof')
  })

  it('tokenizes braces and equals', () => {
    const tokens = tokenize('{ = }')
    expect(tokens.map(t => t.type)).toEqual(['lbrace', 'equals', 'rbrace', 'eof'])
  })

  it('tokenizes keywords', () => {
    const tokens = tokenize('chart data highlight scene step')
    expect(tokens.map(t => [t.type, t.value])).toEqual([
      ['keyword', 'chart'],
      ['keyword', 'data'],
      ['keyword', 'highlight'],
      ['keyword', 'scene'],
      ['keyword', 'step'],
      ['eof', ''],
    ])
  })

  it('tokenizes identifiers', () => {
    const tokens = tokenize('horizontal-bar descending #e53e3e')
    expect(tokens.map(t => [t.type, t.value])).toEqual([
      ['identifier', 'horizontal-bar'],
      ['identifier', 'descending'],
      ['identifier', '#e53e3e'],
      ['eof', ''],
    ])
  })

  it('tokenizes strings with unicode', () => {
    const tokens = tokenize('"Année suivante"')
    expect(tokens[0]).toMatchObject({ type: 'string', value: 'Année suivante' })
  })

  it('tokenizes strings with escaped quotes', () => {
    const tokens = tokenize('"say \\"hello\\""')
    expect(tokens[0]).toMatchObject({ type: 'string', value: 'say "hello"' })
  })

  it('tokenizes numbers and percent', () => {
    const tokens = tokenize('61.11%')
    expect(tokens.map(t => [t.type, t.value])).toEqual([
      ['number', '61.11'],
      ['percent', '%'],
      ['eof', ''],
    ])
  })

  it('tokenizes integer numbers', () => {
    const tokens = tokenize('42')
    expect(tokens[0]).toMatchObject({ type: 'number', value: '42' })
  })

  it('tracks line and column', () => {
    const tokens = tokenize('chart\n  data')
    expect(tokens[0]).toMatchObject({ line: 1, column: 1 })
    expect(tokens[1]).toMatchObject({ line: 2, column: 3 })
  })

  it('throws on unterminated string', () => {
    expect(() => tokenize('"hello')).toThrow(/Unterminated string/)
  })

  it('throws on unexpected character', () => {
    expect(() => tokenize('!')).toThrow(/Unexpected character/)
  })

  it('tokenizes simple chart DSL', () => {
    const input = `chart horizontal-bar {
  title = "Couverture médiatique"
  sort = descending

  data {
    "20 Minutes" = 61.11%
    "BFMTV"      = 53.85%
  }

  highlight "Guardian" {
    color = "#e53e3e"
    label = "Leader"
  }
}`
    const tokens = tokenize(input)
    const types = tokens.map(t => t.type)
    expect(types[0]).toBe('keyword') // chart
    expect(types[1]).toBe('identifier') // horizontal-bar
    expect(types[2]).toBe('lbrace')
    expect(types[types.length - 1]).toBe('eof')
    expect(types.filter(t => t === 'string').length).toBeGreaterThan(0)
    expect(types.filter(t => t === 'number').length).toBeGreaterThan(0)
    expect(types.filter(t => t === 'percent').length).toBeGreaterThan(0)
  })

  it('tokenizes chart with scenes', () => {
    const input = `chart horizontal-bar {
  title = "Couverture médiatique en 2025"
  sort = descending

  data {
    "20 Minutes" = 61%
    "BFMTV"      = 53%
  }

  scene "Le leader" {
    sort = descending

    highlight "LeMonde" {
      color = "#e53e3e"
      label = "Leader"
    }
  }

  scene "Année suivante" {
    title = "Couverture médiatique en 2026"

    data {
      "20 Minutes" = 51%
      "BFMTV"      = 73%
    }
  }
}`
    const tokens = tokenize(input)
    const keywords = tokens.filter(t => t.type === 'keyword')
    const keywordValues = keywords.map(t => t.value)
    expect(keywordValues).toContain('chart')
    expect(keywordValues).toContain('data')
    expect(keywordValues).toContain('scene')
    expect(keywordValues).toContain('highlight')
    expect(keywordValues.filter(v => v === 'scene')).toHaveLength(2)
  })

  it('tokenizes backward-compatible step keyword', () => {
    const tokens = tokenize('step')
    expect(tokens[0]).toMatchObject({ type: 'keyword', value: 'step' })
  })

  it('tokenizes tab characters as tab tokens', () => {
    const tokens = tokenize('Apple\t42')
    expect(tokens.map(t => [t.type, t.value])).toEqual([
      ['identifier', 'Apple'],
      ['tab', '\t'],
      ['number', '42'],
      ['eof', ''],
    ])
  })

  it('tokenizes tabular data block content', () => {
    const input = 'data {\n\tSales\t75\n}'
    const tokens = tokenize(input)
    const types = tokens.map(t => t.type)
    expect(types).toContain('tab')
    const tabTokens = tokens.filter(t => t.type === 'tab')
    expect(tabTokens).toHaveLength(2)
  })

  it('handles escaped backslash in strings', () => {
    const tokens = tokenize('"path\\\\file"')
    expect(tokens[0].value).toBe('path\\file')
  })

  it('returns correct token types for percent values', () => {
    const tokens = tokenize('75.00%')
    const types: TokenType[] = tokens.map(t => t.type)
    expect(types).toEqual(['number', 'percent', 'eof'])
  })
})
