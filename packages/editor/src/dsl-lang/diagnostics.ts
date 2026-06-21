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
    const from = locationToOffset(doc, result.location.line, result.location.column)
    const to = doc.lineAt(from).to
    return [{ from, to, severity: 'error', message }]
  }
  return [{ from: 0, to: doc.length, severity: 'error', message }]
}
