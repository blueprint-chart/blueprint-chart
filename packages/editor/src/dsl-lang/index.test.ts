import { describe, it, expect } from 'vitest'
import { bpcLanguage, highlightDsl } from '.'

describe('bpcLanguage', () => {
  it('returns a LanguageSupport instance', () => {
    const lang = bpcLanguage()
    expect(lang).toBeDefined()
    expect(lang.language).toBeDefined()
  })
})

describe('highlightDsl', () => {
  it('highlights keywords with tok-keyword class', () => {
    const html = highlightDsl('chart line {\n}')
    expect(html).toContain('<span class="tok-keyword">chart</span>')
  })

  it('highlights strings with tok-string class', () => {
    const html = highlightDsl('chart line {\ntitle = "Hello"\n}')
    expect(html).toContain('tok-string')
    expect(html).toContain('Hello')
  })

  it('highlights numbers with tok-number class', () => {
    const html = highlightDsl('chart line {\nwidth = 400\n}')
    expect(html).toContain('<span class="tok-number">400</span>')
  })

  it('highlights percentages with tok-number class', () => {
    const html = highlightDsl('chart bar {\ndata {\nA = 50%\n}\n}')
    expect(html).toContain('tok-number')
    expect(html).toContain('50%')
  })

  it('highlights block keywords', () => {
    const dsl = 'chart line {\ndata {\n}\nhighlight "A" {\n}\nseries "B" {\n}\n}'
    const html = highlightDsl(dsl)
    expect(html).toContain('<span class="tok-keyword">data</span>')
    expect(html).toContain('<span class="tok-keyword">highlight</span>')
    expect(html).toContain('<span class="tok-keyword">series</span>')
  })

  it('escapes HTML entities in plain text', () => {
    const html = highlightDsl('chart line {\ntitle = "<b>"\n}')
    expect(html).toContain('&lt;b&gt;')
    expect(html).not.toContain('<b>')
  })

  it('returns plain text when input is empty', () => {
    expect(highlightDsl('')).toBe('')
  })

  it('highlights identifiers with tok-variableName', () => {
    const html = highlightDsl('chart line {\ncolor = red\n}')
    expect(html).toContain('tok-variableName')
  })
})
