export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'percent'
  | 'lbrace'
  | 'rbrace'
  | 'equals'
  | 'tab'
  | 'identifier'
  | 'eof'

const KEYWORDS = new Set(['chart', 'data', 'highlight', 'step'])

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let pos = 0
  let line = 1
  let column = 1

  function advance(count = 1): void {
    for (let i = 0; i < count; i++) {
      if (input[pos] === '\n') {
        line++
        column = 1
      }
      else {
        column++
      }
      pos++
    }
  }

  function peek(): string {
    return input[pos] ?? ''
  }

  function skipWhitespace(): void {
    while (pos < input.length && /[ \n\r]/.test(input[pos])) {
      advance()
    }
  }

  function readString(): Token {
    const startLine = line
    const startColumn = column
    advance() // skip opening quote
    let value = ''
    while (pos < input.length && input[pos] !== '"') {
      if (input[pos] === '\\') {
        advance()
        if (pos >= input.length) {
          throw new SyntaxError(`Unterminated string at ${startLine}:${startColumn}`)
        }
        const escaped = input[pos]
        if (escaped === '"') {
          value += '"'
        }
        else if (escaped === '\\') {
          value += '\\'
        }
        else if (escaped === 'n') {
          value += '\n'
        }
        else if (escaped === 't') {
          value += '\t'
        }
        else { value += escaped }
      }
      else {
        value += input[pos]
      }
      advance()
    }
    if (pos >= input.length) {
      throw new SyntaxError(`Unterminated string at ${startLine}:${startColumn}`)
    }
    advance() // skip closing quote
    return { type: 'string', value, line: startLine, column: startColumn }
  }

  function readNumber(): Token {
    const startLine = line
    const startColumn = column
    let value = ''
    while (pos < input.length && /[0-9.]/.test(input[pos])) {
      value += input[pos]
      advance()
    }
    return { type: 'number', value, line: startLine, column: startColumn }
  }

  function readIdentifier(): Token {
    const startLine = line
    const startColumn = column
    let value = ''
    while (pos < input.length && /[a-zA-Z0-9_#-]/.test(input[pos])) {
      value += input[pos]
      advance()
    }
    const type: TokenType = KEYWORDS.has(value) ? 'keyword' : 'identifier'
    return { type, value, line: startLine, column: startColumn }
  }

  while (pos < input.length) {
    skipWhitespace()
    if (pos >= input.length) {
      break
    }

    const ch = peek()
    const startLine = line
    const startColumn = column

    if (ch === '"') {
      tokens.push(readString())
    }
    else if (ch === '{') {
      tokens.push({ type: 'lbrace', value: '{', line: startLine, column: startColumn })
      advance()
    }
    else if (ch === '}') {
      tokens.push({ type: 'rbrace', value: '}', line: startLine, column: startColumn })
      advance()
    }
    else if (ch === '=') {
      tokens.push({ type: 'equals', value: '=', line: startLine, column: startColumn })
      advance()
    }
    else if (ch === '%') {
      tokens.push({ type: 'percent', value: '%', line: startLine, column: startColumn })
      advance()
    }
    else if (/[0-9]/.test(ch)) {
      tokens.push(readNumber())
    }
    else if (ch === '\t') {
      tokens.push({ type: 'tab', value: '\t', line: startLine, column: startColumn })
      advance()
    }
    else if (/[a-zA-Z_#]/.test(ch)) {
      tokens.push(readIdentifier())
    }
    else {
      throw new SyntaxError(`Unexpected character '${ch}' at ${startLine}:${startColumn}`)
    }
  }

  tokens.push({ type: 'eof', value: '', line, column })
  return tokens
}
