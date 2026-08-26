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

  it('underlines the last character for an end-of-line/EOF error (never zero-width)', () => {
    // 'expected }' / unexpected-end errors report a column past the line end.
    const oneLine = docOf('chart bar {')
    const diags = buildDiagnostics(
      { success: false, error: 'unexpected end', location: { line: 1, column: 99 } },
      oneLine,
    )
    expect(diags).toHaveLength(1)
    expect(diags[0].to).toBe(oneLine.line(1).to)
    expect(diags[0].from).toBe(oneLine.line(1).to - 1)
    expect(diags[0].from).toBeLessThan(diags[0].to) // visible underline, not a point
  })
})

describe('buildDiagnostics on semantic errors the parser accepts', () => {
  const VALID = 'chart bar-vertical {\n  data {\n    "A" = 1\n  }\n}\n'

  it('reports an unknown chart type on the chart header', () => {
    const doc = docOf('chart nope-o-gram {\n  data {\n    "A" = 1\n  }\n}\n')
    const [diagnostic, ...rest] = buildDiagnostics({ success: true }, doc)

    expect(rest).toEqual([])
    expect(diagnostic.severity).toBe('error')
    expect(diagnostic.message).toContain('nope-o-gram')
    expect(diagnostic.from).toBe(doc.line(1).from)
    expect(diagnostic.to).toBe(doc.line(1).to)
  })

  it('passes on the suggestion the validator already computed', () => {
    const doc = docOf('chart aera {\n  data {\n    "A" = 1\n  }\n}\n')
    const [diagnostic] = buildDiagnostics({ success: true }, doc)

    expect(diagnostic.message).toContain('Did you mean "area"?')
  })

  it('reports an unknown property', () => {
    const doc = docOf('chart bar-vertical {\n  flurbleWidth = 3\n\n  data {\n    "A" = 1\n  }\n}\n')
    const messages = buildDiagnostics({ success: true }, doc).map(d => d.message)

    expect(messages.join(' ')).toContain('flurbleWidth')
  })

  it('stays quiet on a chart with nothing wrong with it', () => {
    expect(buildDiagnostics({ success: true }, docOf(VALID))).toEqual([])
  })

  it('stays quiet when the document does not parse, since the parse error is already reported', () => {
    expect(buildDiagnostics({ success: true }, docOf('!!!'))).toEqual([])
  })
})
