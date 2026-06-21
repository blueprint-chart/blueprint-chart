import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { styleTags, tags as t, highlightTree, classHighlighter } from '@lezer/highlight'
// @ts-expect-error generated file
import { parser } from './bpc-parser.js'

// Shared CodeMirror theme for the BPC editor surface, wired to the app's design
// tokens. Lives here alongside bpcLanguage()/bpcHighlighter so any BPC editor
// surface (the main editor, a future read-only preview pane) reuses one theme.
// `--fst-clearance` is set by the surrounding layout (ChartEditPanel); the 9rem
// fallback covers standalone use.
export const bpcEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--bc-tile-bg-elevated)',
    fontSize: '13px',
  },
  '.cm-scroller': { overflow: 'auto', lineHeight: '1.6' },
  '.cm-content': {
    fontFamily: 'var(--bs-font-monospace)',
    paddingBottom: 'var(--fst-clearance, 9rem)',
    caretColor: 'var(--bs-body-color)',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--bs-body-color)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--bs-body-color) 4%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--bs-body-color) 6%, transparent)' },
  '.cm-gutters': {
    backgroundColor: 'var(--bc-tile-bg-elevated)',
    color: 'color-mix(in srgb, var(--bs-body-color) 28%, transparent)',
    border: 'none',
  },
})

const bpcParser = parser.configure({
  props: [
    styleTags({
      'chart': t.keyword,
      'data': t.keyword,
      'colorize': t.keyword,
      'highlight': t.keyword,
      'area-fill': t.keyword,
      'annotation': t.keyword,
      'range': t.keyword,
      'note': t.keyword,
      'hide-annotation': t.keyword,
      'show-annotation': t.keyword,
      'hide-range': t.keyword,
      'show-range': t.keyword,
      'hide-note': t.keyword,
      'show-note': t.keyword,
      'series': t.keyword,
      'scene': t.keyword,
      'transform': t.keyword,
      'Identifier': t.variableName,
      'String': t.string,
      'Number': t.number,
      'Percentage': t.number,
      'Equals': t.operator,
      'LineComment': t.lineComment,
      'BlockComment': t.blockComment,
      '{ }': t.brace,
    }),
  ],
})

const bpcLang = LRLanguage.define({
  parser: bpcParser,
  languageData: {
    commentTokens: { line: '//' },
  },
})

export const bpcHighlighter = syntaxHighlighting(classHighlighter)

export function bpcLanguage(): LanguageSupport {
  return new LanguageSupport(bpcLang)
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlightDsl(code: string): string {
  const tree = bpcParser.parse(code)
  let pos = 0
  let html = ''
  highlightTree(tree, classHighlighter, (from, to, classes) => {
    if (from > pos) {
      html += escapeHtml(code.slice(pos, from))
    }
    html += `<span class="${classes}">${escapeHtml(code.slice(from, to))}</span>`
    pos = to
  })
  if (pos < code.length) {
    html += escapeHtml(code.slice(pos))
  }
  return html
}
