import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse as peggyParse } from '@blueprint-chart/lib'
// @ts-expect-error generated Lezer parser, no types
import { parser as lezerParser } from './bpc-parser.js'

// Cross-grammar pin (devex-review finding 7): the editor ships a SECOND grammar
// for the BPC language — the Lezer grammar used for CodeMirror highlighting
// (`bpc.grammar` -> generated `bpc-parser.js`). It can silently drift from the
// canonical Peggy grammar that actually parses charts. This test runs every
// shipped sample through BOTH grammars so the two definitions stay in lockstep:
//   - the Peggy parser must accept it (it is the source of truth), and
//   - the Lezer parser must produce a tree with NO error nodes.
// A Lezer error node (node.type.isError) is treated as a failure even though
// Lezer's error recovery would otherwise keep highlighting the rest of the file
// — for samples, anything less than a clean parse is drift.

const SAMPLES_DIR = resolve(__dirname, '../../../lib/src/samples')
const bpcFiles = readdirSync(SAMPLES_DIR).filter(f => f.endsWith('.bpc'))

/** Collect the [from, to] spans of every error node in a Lezer parse tree. */
function lezerErrorSpans(source: string): Array<[number, number]> {
  const tree = lezerParser.parse(source)
  const spans: Array<[number, number]> = []
  tree.iterate({
    enter: (node: { type: { isError: boolean }, from: number, to: number }) => {
      if (node.type.isError) {
        spans.push([node.from, node.to])
      }
    },
  })
  return spans
}

describe('cross-grammar parity (Peggy vs Lezer)', () => {
  it('discovers sample .bpc files', () => {
    expect(bpcFiles.length).toBeGreaterThan(0)
  })

  for (const file of bpcFiles) {
    describe(file, () => {
      const source = readFileSync(join(SAMPLES_DIR, file), 'utf-8')

      it('parses under the canonical Peggy grammar', () => {
        expect(() => peggyParse(source)).not.toThrow()
      })

      it('parses under the editor Lezer grammar with no error nodes', () => {
        const spans = lezerErrorSpans(source)
        const context = spans
          .map(([from, to]) => `@${from}-${to}: ${JSON.stringify(source.slice(Math.max(0, from - 20), to + 20))}`)
          .join('\n')
        expect(
          spans,
          `Lezer grammar produced error nodes (editor grammar drifted from canonical):\n${context}`,
        ).toEqual([])
      })
    })
  }

  // Synthetic fixture: the shipped samples do not exercise block comments,
  // scientific-notation/leading-dot numbers, bodyless highlights, or note
  // blocks all in one place. This inline document pins those edge cases through
  // BOTH grammars so neither definition silently loses support for them.
  describe('edge-case fixture (block comments, sci/leading-dot numbers, note block)', () => {
    const FIXTURE = `/* block comment
   spanning two lines */
chart line {
  // line comment
  title = "Edge cases"
  width = .5
  data {
    series = "A","B"
    "2000" = 2.5e-4,.5
    "2001" = 1,2
  }
  note {
    text = "footnote"
  }
  highlight "2000"
  scene "s" {
    hide-annotation "abc12"
  }
}
`

    it('parses under the canonical Peggy grammar', () => {
      expect(() => peggyParse(FIXTURE)).not.toThrow()
    })

    it('parses under the editor Lezer grammar with no error nodes', () => {
      const spans = lezerErrorSpans(FIXTURE)
      const context = spans
        .map(([from, to]) => `@${from}-${to}: ${JSON.stringify(FIXTURE.slice(Math.max(0, from - 20), to + 20))}`)
        .join('\n')
      expect(
        spans,
        `Lezer grammar produced error nodes on the edge-case fixture:\n${context}`,
      ).toEqual([])
    })
  })
})
