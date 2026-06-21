import { describe, expect, it } from 'vitest'
import { EditorState } from '@codemirror/state'
import { buildDiagnostics, locationToOffset } from './diagnostics'

function docOf(text: string) {
  return EditorState.create({ doc: text }).doc
}

describe('locationToOffset', () => {
  const doc = docOf('chart bar {\n  title = "A"\n}\n') // line 1 starts at 0, line 2 at 12

  it('maps line/column (1-based) to an absolute offset', () => {
    expect(locationToOffset(doc, 2, 3)).toBe(doc.line(2).from + 2)
  })

  it('clamps an out-of-range line to the last line', () => {
    expect(locationToOffset(doc, 999, 1)).toBe(doc.line(doc.lines).from)
  })

  it('clamps a non-positive column to the line start', () => {
    expect(locationToOffset(doc, 2, 0)).toBe(doc.line(2).from)
  })

  it('clamps an out-of-range column to the line end', () => {
    expect(locationToOffset(doc, 2, 9999)).toBe(doc.line(2).to)
  })
})

describe('buildDiagnostics', () => {
  const doc = docOf('chart bar {\n  oops\n}\n')

  it('returns no diagnostics on success', () => {
    expect(buildDiagnostics({ success: true }, doc)).toEqual([])
  })

  it('returns no diagnostics for a null result', () => {
    expect(buildDiagnostics(null, doc)).toEqual([])
  })

  it('places an error diagnostic at the reported location', () => {
    const diags = buildDiagnostics(
      { success: false, error: 'Expected "}" at 2:3', location: { line: 2, column: 3 } },
      doc,
    )
    expect(diags).toHaveLength(1)
    expect(diags[0].severity).toBe('error')
    expect(diags[0].from).toBe(doc.line(2).from + 2)
    expect(diags[0].to).toBe(doc.line(2).to)
    expect(diags[0].message).toBe('Expected "}" at 2:3')
  })

  it('falls back to a document-wide diagnostic when there is no location', () => {
    const diags = buildDiagnostics({ success: false, error: 'broken' }, doc)
    expect(diags).toEqual([{ from: 0, to: doc.length, severity: 'error', message: 'broken' }])
  })
})
