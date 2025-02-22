import type { Token } from './lexer'
import { tokenize } from './lexer'
import type { ChartNode, DataNode, HighlightNode, PropertyNode, StepNode } from './types'

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private current(): Token {
    return this.tokens[this.pos]
  }

  private expect(type: string, value?: string): Token {
    const token = this.current()
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      const expected = value ? `${type} '${value}'` : type
      throw new SyntaxError(
        `Expected ${expected} but got ${token.type} '${token.value}' at ${token.line}:${token.column}`,
      )
    }
    this.pos++
    return token
  }

  private match(type: string, value?: string): boolean {
    const token = this.current()
    return token.type === type && (value === undefined || token.value === value)
  }

  parseChart(): ChartNode {
    this.expect('keyword', 'chart')
    const chartType = this.expect('identifier').value
    this.expect('lbrace')

    const properties: PropertyNode[] = []
    let data: DataNode | null = null
    const highlights: HighlightNode[] = []
    const steps: StepNode[] = []

    while (!this.match('rbrace')) {
      if (this.match('keyword', 'data')) {
        data = this.parseData()
      }
      else if (this.match('keyword', 'highlight')) {
        highlights.push(this.parseHighlight())
      }
      else if (this.match('keyword', 'step')) {
        steps.push(this.parseStep())
      }
      else {
        properties.push(this.parseProperty())
      }
    }

    this.expect('rbrace')
    return { type: 'chart', chartType, properties, data, highlights, steps }
  }

  parseData(): DataNode {
    this.expect('keyword', 'data')
    this.expect('lbrace')

    const entries: PropertyNode[] = []
    while (!this.match('rbrace')) {
      entries.push(this.parseProperty())
    }

    this.expect('rbrace')
    return { type: 'data', entries }
  }

  parseHighlight(): HighlightNode {
    this.expect('keyword', 'highlight')
    const target = this.expect('string').value
    this.expect('lbrace')

    const properties: PropertyNode[] = []
    while (!this.match('rbrace')) {
      properties.push(this.parseProperty())
    }

    this.expect('rbrace')
    return { type: 'highlight', target, properties }
  }

  parseStep(): StepNode {
    this.expect('keyword', 'step')
    const name = this.expect('string').value
    this.expect('lbrace')

    const properties: PropertyNode[] = []
    let data: DataNode | null = null
    const highlights: HighlightNode[] = []

    while (!this.match('rbrace')) {
      if (this.match('keyword', 'data')) {
        data = this.parseData()
      }
      else if (this.match('keyword', 'highlight')) {
        highlights.push(this.parseHighlight())
      }
      else {
        properties.push(this.parseProperty())
      }
    }

    this.expect('rbrace')
    return { type: 'step', name, properties, data, highlights }
  }

  parseProperty(): PropertyNode {
    const keyToken = this.current()
    let key: string

    if (keyToken.type === 'string') {
      key = keyToken.value
      this.pos++
    }
    else if (keyToken.type === 'identifier' || keyToken.type === 'keyword') {
      key = keyToken.value
      this.pos++
    }
    else {
      throw new SyntaxError(
        `Expected property key but got ${keyToken.type} '${keyToken.value}' at ${keyToken.line}:${keyToken.column}`,
      )
    }

    this.expect('equals')

    const valueToken = this.current()
    let value: string | number
    let isPercentage = false

    if (valueToken.type === 'string') {
      value = valueToken.value
      this.pos++
    }
    else if (valueToken.type === 'number') {
      value = Number.parseFloat(valueToken.value)
      this.pos++
      if (this.match('percent')) {
        isPercentage = true
        this.pos++
      }
    }
    else if (valueToken.type === 'identifier') {
      value = valueToken.value
      this.pos++
    }
    else {
      throw new SyntaxError(
        `Expected property value but got ${valueToken.type} '${valueToken.value}' at ${valueToken.line}:${valueToken.column}`,
      )
    }

    return { type: 'property', key, value, isPercentage }
  }
}

export function parse(input: string): ChartNode {
  const tokens = tokenize(input)
  const parser = new Parser(tokens)
  return parser.parseChart()
}
