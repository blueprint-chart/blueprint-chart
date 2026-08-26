import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
// Import the canonical parser from lib source (not the built bundle) so the
// docs are pinned to the exact grammar that ships, without a build step.
import { parse } from '../../lib/src/dsl/parser'
import { validateChart } from '../../lib/src/dsl/validate'
import * as enums from '../../lib/src/enums'

// These tests pin the docs (one of the three definitions of the BPC language)
// to the canonical Peggy parser and to the on-disk sample files. They exist to
// stop the docs, the samples, and the grammar from drifting apart again
// (devex-review findings 3, 4, 7).

const DOCS_SRC = __dirname
const REPO_ROOT = resolve(DOCS_SRC, '../../..')
const SAMPLES_DIR = resolve(REPO_ROOT, 'packages/lib/src/samples')

/**
 * Recursively collect every Markdown file under `packages/docs/src`, excluding
 * the VitePress theme/config tree (`.vitepress`), which holds Vue/TS, not prose.
 */
function collectMarkdown(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === '.vitepress') {
      continue
    }
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectMarkdown(full))
    }
    else if (entry.endsWith('.md')) {
      out.push(full)
    }
  }
  return out
}

const markdownFiles = collectMarkdown(DOCS_SRC)

describe('docs integrity', () => {
  it('discovers Markdown files to scan', () => {
    expect(markdownFiles.length).toBeGreaterThan(0)
  })

  // -------------------------------------------------------------------------
  // Task 1 — every `packages/lib/src/samples/<name>.bpc` path mentioned in the
  // docs must point at a file that actually exists on disk. A failure names the
  // exact missing sample so the drift is obvious.
  // -------------------------------------------------------------------------
  describe('sample references resolve to real files', () => {
    // Matches `packages/lib/src/samples/<name>.bpc` wherever it appears in prose
    // (info callouts, inline code, plain text). The leading boundary keeps us
    // from matching a longer, unrelated path.
    const SAMPLE_REF = /packages\/lib\/src\/samples\/([\w-]+\.bpc)/g

    for (const file of markdownFiles) {
      const rel = relative(REPO_ROOT, file)
      const content = readFileSync(file, 'utf-8')
      const referenced = new Set<string>()
      for (const m of content.matchAll(SAMPLE_REF)) {
        referenced.add(m[1])
      }
      if (referenced.size === 0) {
        continue
      }

      describe(rel, () => {
        for (const name of referenced) {
          it(`references existing sample "${name}"`, () => {
            const onDisk = join(SAMPLES_DIR, name)
            expect(
              existsSync(onDisk),
              `docs reference missing sample: ${name} (expected at packages/lib/src/samples/${name})`,
            ).toBe(true)
          })
        }
      })
    }
  })

  // -------------------------------------------------------------------------
  // Task 2 — every fenced ```bpc snippet must parse through the canonical Peggy
  // parser.
  //
  // SKIP CONVENTION: a snippet that legitimately cannot parse standalone (e.g.
  // a syntax skeleton with `<placeholder>` tokens) is opted out by placing the
  // HTML comment marker `<!-- bpc-no-parse -->` on the line directly above its
  // opening fence. Anything without that marker MUST parse.
  //
  // AUTO-WRAP HEURISTIC: many real snippets are fragments — a bare `scene`,
  // `annotation`, `series`, `transform`, `data`, or property line lifted out of
  // its chart. Rather than mark every fragment, we wrap them in a minimal chart
  // shell so they parse as the chart members they are:
  //   - starts with `chart`  -> parse verbatim (it is a whole document).
  //   - starts with `data`   -> wrap as `chart line { <snippet> }` (no filler
  //                             data block, which would collide as a duplicate).
  //   - otherwise            -> wrap as `chart line { data { "a" = 1 } <snippet> }`
  //                             so member-only fragments have the data they need.
  // The heuristic is deliberately tight: a genuinely broken snippet (bad
  // keyword, unbalanced braces, placeholder tokens) still fails under every
  // branch, so it would be caught rather than masked.
  // -------------------------------------------------------------------------
  describe('fenced bpc snippets parse', () => {
    const SKIP_MARKER = '<!-- bpc-no-parse -->'

    interface Snippet {
      file: string
      index: number
      line: number
      skip: boolean
      code: string
    }

    function extractSnippets(file: string): Snippet[] {
      const rel = relative(REPO_ROOT, file)
      const lines = readFileSync(file, 'utf-8').split('\n')
      const out: Snippet[] = []
      let index = 0
      for (let i = 0; i < lines.length; i++) {
        if (!/^```bpc\s*$/.test(lines[i].trim())) {
          continue
        }
        // Look back over blank lines for the skip marker directly above.
        let prev = i - 1
        while (prev >= 0 && lines[prev].trim() === '') {
          prev--
        }
        const skip = prev >= 0 && lines[prev].trim() === SKIP_MARKER
        const body: string[] = []
        let j = i + 1
        for (; j < lines.length; j++) {
          if (lines[j].trim() === '```') {
            break
          }
          body.push(lines[j])
        }
        out.push({ file: rel, index: index++, line: i + 1, skip, code: body.join('\n') })
        i = j
      }
      return out
    }

    function wrapFragment(code: string): string {
      const head = code.trimStart()
      if (head.startsWith('chart')) {
        return code
      }
      if (head.startsWith('data')) {
        return `chart line {\n${code}\n}`
      }
      return `chart line {\n  data { "a" = 1 }\n${code}\n}`
    }

    const allSnippets = markdownFiles.flatMap(extractSnippets)

    it('finds bpc snippets to validate', () => {
      expect(allSnippets.length).toBeGreaterThan(0)
    })

    for (const snippet of allSnippets) {
      const label = `${snippet.file} block #${snippet.index + 1} (line ${snippet.line})`
      const runner = snippet.skip ? it.skip : it
      runner(`parses ${label}`, () => {
        const source = wrapFragment(snippet.code)
        expect(() => parse(source), `snippet failed to parse:\n${source}`).not.toThrow()
      })
      runner(`validates ${label}`, () => {
        const source = wrapFragment(snippet.code)
        const { errors } = validateChart(parse(source))
        expect(
          errors.map(e => `${e.code} at ${e.path}: ${e.message}`),
          `snippet failed semantic validation:\n${source}`,
        ).toEqual([])
      })
    }
  })
})

// The API reference hand-maintains an "authoritative list of enum exports". It
// drifted: AnnotationAction was listed and never existed, so the documented
// import was a TS build error.
describe('api reference enum list', () => {
  const page = readFileSync(join(DOCS_SRC, 'reference/api/index.md'), 'utf-8')
  const listed = page
    .split('\n')
    .find(l => l.includes('`ChartType`') && l.includes(' · '))
    ?.match(/`(\w+)`/g)
    ?.map(m => m.slice(1, -1)) ?? []

  it('finds the enum list', () => {
    expect(listed.length).toBeGreaterThan(20)
  })

  for (const name of listed) {
    it(`exports ${name}`, () => {
      expect(name in enums, `documented enum is not exported from lib/src/enums: ${name}`).toBe(true)
    })
  }
})
