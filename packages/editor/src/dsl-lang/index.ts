import { LRLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language'
import { styleTags, tags as t, highlightTree, classHighlighter } from '@lezer/highlight'
// @ts-expect-error generated file
import { parser } from './bpc-parser.js'

const bpcParser = parser.configure({
  props: [
    styleTags({
      'chart': t.keyword,
      'data': t.keyword,
      'highlight': t.keyword,
      'areafill': t.keyword,
      'annotation': t.keyword,
      'range': t.keyword,
      'note': t.keyword,
      'series': t.keyword,
      'scene': t.keyword,
      'step': t.keyword,
      'transform': t.keyword,
      'Identifier': t.variableName,
      'String': t.string,
      'Number': t.number,
      'Percentage': t.number,
      'Equals': t.operator,
      'LineComment': t.lineComment,
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
