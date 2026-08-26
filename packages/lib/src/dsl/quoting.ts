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
