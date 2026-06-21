import type { Diagnostic } from '@codemirror/lint'
import type { Text } from '@codemirror/state'

export interface DslApplyResult {
  success: boolean
  error?: string
  location?: { line: number, column: number }
}

/** Convert a 1-based { line, column } to a clamped absolute document offset. */
export function locationToOffset(doc: Text, line: number, column: number): number {
  const safeLine = Math.min(Math.max(line, 1), doc.lines)
  const lineObj = doc.line(safeLine)
  const offset = lineObj.from + Math.max(column - 1, 0)
  return Math.min(Math.max(offset, 0), lineObj.to)
}

/** Map the latest parse result onto CodeMirror lint diagnostics. */
export function buildDiagnostics(result: DslApplyResult | null, doc: Text): Diagnostic[] {
  if (!result || result.success) {
    return []
  }
  const message = result.error ?? 'Invalid DSL'
  if (result.location) {
    const offset = locationToOffset(doc, result.location.line, result.location.column)
    const line = doc.lineAt(offset)
    let from = offset
    let to = line.to
    if (from === to) {
      // Error at the end of a line / end of input (the common "expected }" /
      // "unexpected end" case): a zero-width range renders as a faint point,
      // not the underline used for every other error. Underline the last
      // character (or, on an empty line, the next one) so the marker is
      // visible and consistent.
      if (from > line.from) {
        from = from - 1
      }
      else if (to < doc.length) {
        to = to + 1
      }
    }
    return [{ from, to, severity: 'error', message }]
  }
  return [{ from: 0, to: doc.length, severity: 'error', message }]
}
