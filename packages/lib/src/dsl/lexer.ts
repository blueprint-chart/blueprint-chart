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

interface LexerState {
  input: string
  tokens: Token[]
  pos: number
  line: number
  column: number
}

function lexAdvance(s: LexerState, count = 1): void {
  for (let i = 0; i < count; i++) {
    if (s.input[s.pos] === '\n') {
      s.line++
      s.column = 1
    }
    else {
      s.column++
    }
    s.pos++
  }
}

function lexSkipWhitespace(s: LexerState): void {
  while (s.pos < s.input.length && /[ \n\r]/.test(s.input[s.pos])) {
    lexAdvance(s)
  }
}

function resolveEscape(ch: string): string {
  if (ch === '"') {
    return '"'
  }
  if (ch === '\\') {
    return '\\'
  }
  if (ch === 'n') {
    return '\n'
  }
  if (ch === 't') {
    return '\t'
  }
  return ch
}

function lexReadString(s: LexerState): Token {
  const startLine = s.line
  const startColumn = s.column
  lexAdvance(s)
  let value = ''
  while (s.pos < s.input.length && s.input[s.pos] !== '"') {
    if (s.input[s.pos] === '\\') {
      lexAdvance(s)
      if (s.pos >= s.input.length) {
        throw new SyntaxError(`Unterminated string at ${startLine}:${startColumn}`)
      }
      value += resolveEscape(s.input[s.pos])
    }
    else {
      value += s.input[s.pos]
    }
    lexAdvance(s)
  }
  if (s.pos >= s.input.length) {
    throw new SyntaxError(`Unterminated string at ${startLine}:${startColumn}`)
  }
  lexAdvance(s)
  return { type: 'string', value, line: startLine, column: startColumn }
}

function lexReadNumber(s: LexerState): Token {
  const startLine = s.line
  const startColumn = s.column
  let value = ''
  while (s.pos < s.input.length && /[0-9.]/.test(s.input[s.pos])) {
    value += s.input[s.pos]
    lexAdvance(s)
  }
  return { type: 'number', value, line: startLine, column: startColumn }
}

function lexReadIdentifier(s: LexerState): Token {
  const startLine = s.line
  const startColumn = s.column
  let value = ''
  while (s.pos < s.input.length && /[a-zA-Z0-9_#-]/.test(s.input[s.pos])) {
    value += s.input[s.pos]
    lexAdvance(s)
  }
  const type: TokenType = KEYWORDS.has(value) ? 'keyword' : 'identifier'
  return { type, value, line: startLine, column: startColumn }
}

function lexSingleChar(s: LexerState, type: TokenType, value: string): Token {
  const tok: Token = { type, value, line: s.line, column: s.column }
  lexAdvance(s)
  return tok
}

const SINGLE_CHAR_TOKENS: Record<string, TokenType> = {
  '{': 'lbrace',
  '}': 'rbrace',
  '=': 'equals',
  '%': 'percent',
  '\t': 'tab',
}

function lexNextToken(s: LexerState): void {
  const ch = s.input[s.pos] ?? ''
  if (ch === '"') {
    s.tokens.push(lexReadString(s))
    return
  }
  const singleType = SINGLE_CHAR_TOKENS[ch]
  if (singleType) {
    s.tokens.push(lexSingleChar(s, singleType, ch))
    return
  }
  if (/[0-9]/.test(ch)) {
    s.tokens.push(lexReadNumber(s))
    return
  }
  if (/[a-zA-Z_#]/.test(ch)) {
    s.tokens.push(lexReadIdentifier(s))
    return
  }
  throw new SyntaxError(`Unexpected character '${ch}' at ${s.line}:${s.column}`)
}

export function tokenize(input: string): Token[] {
  const s: LexerState = { input, tokens: [], pos: 0, line: 1, column: 1 }

  while (s.pos < input.length) {
    lexSkipWhitespace(s)
    if (s.pos >= input.length) {
      break
    }
    lexNextToken(s)
  }

  s.tokens.push({ type: 'eof', value: '', line: s.line, column: s.column })
  return s.tokens
}
