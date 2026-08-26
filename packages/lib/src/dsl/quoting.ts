const ESCAPES: Record<string, string> = {
  '\\': '\\\\',
  '"': '\\"',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
}

const UNESCAPES: Record<string, string> = {
  '\\': '\\',
  '"': '"',
  'n': '\n',
  'r': '\r',
  't': '\t',
}

/**
 * Wrap a label, target, name or value in quotes for emission as DSL. Newlines
 * and tabs are escaped rather than emitted raw: the data-string format read by
 * `parseData` is line-oriented, so a raw newline inside a label costs the row.
 */
export function quoteDslString(value: string): string {
  return `"${value.replace(/[\\"\n\r\t]/g, c => ESCAPES[c])}"`
}

/** Reverse of `quoteDslString`, for the escape set the grammar's `EscapeChar` accepts. */
export function unescapeDslString(value: string): string {
  return value.replace(
    /\\(u[0-9a-fA-F]{4}|[\\"nrt])/g,
    (_, esc: string) => esc[0] === 'u' ? String.fromCharCode(parseInt(esc.slice(1), 16)) : UNESCAPES[esc],
  )
}

/** Strip the surrounding quotes of a quoted segment, if any, and unescape it. */
export function unquoteDslString(value: string): string {
  const trimmed = value.trim()
  const quoted = trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')
  return quoted ? unescapeDslString(trimmed.slice(1, -1)) : trimmed
}

/**
 * Split on the commas that separate list entries, leaving alone the ones that
 * belong to an entry: inside a quoted string (`"Paris, France"`) or inside a
 * functional notation (`rgb(230,57,70)`).
 */
export function splitTopLevelCommas(value: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0
  let quoted = false
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (quoted && char === '\\' && i + 1 < value.length) {
      current += char + value[++i]
      continue
    }
    if (char === '"') {
      quoted = !quoted
    }
    else if (!quoted && char === '(') {
      depth++
    }
    else if (!quoted && char === ')') {
      depth = Math.max(0, depth - 1)
    }
    else if (char === ',' && !quoted && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts
}
