import type { Diagnostic } from '@codemirror/lint'
import type { Text } from '@codemirror/state'
import { parse, validateChart } from '@blueprint-chart/lib'

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

/**
 * Errors the grammar accepts and the renderer then swallows: an unknown chart
 * type blanks the preview, an unknown property is dropped. The AST carries no
 * offsets for them, so they are reported on the chart header.
 */
function semanticDiagnostics(doc: Text): Diagnostic[] {
  let errors
  try {
    errors = validateChart(parse(doc.toString())).errors
  }
  catch {
    // Unparseable: the syntax error is reported through the parse result.
    return []
  }
  const header = doc.line(1)
  return errors.map(issue => ({
    from: header.from,
    to: header.to,
    severity: 'error' as const,
    message: issue.suggestion ? `${issue.message} Did you mean "${issue.suggestion}"?` : issue.message,
  }))
}

/** Map the latest parse result onto CodeMirror lint diagnostics. */
export function buildDiagnostics(result: DslApplyResult | null, doc: Text): Diagnostic[] {
  if (!result) {
    return []
  }
  if (result.success) {
    return semanticDiagnostics(doc)
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
