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
    const dsl = 'chart line {\ndata {\n}\ncolorize "A" {\n}\nseries "B" {\n}\n}'
    const html = highlightDsl(dsl)
    expect(html).toContain('<span class="tok-keyword">data</span>')
    expect(html).toContain('<span class="tok-keyword">colorize</span>')
    expect(html).toContain('<span class="tok-keyword">series</span>')
  })

  it('highlights highlight keyword (block form)', () => {
    const dsl = 'chart line {\nhighlight "A" {\n}\n}'
    const html = highlightDsl(dsl)
    expect(html).toContain('<span class="tok-keyword">highlight</span>')
  })

  it('highlights bodyless highlight keyword', () => {
    const html = highlightDsl('chart line {\nhighlight "2021"\n}')
    expect(html).toContain('<span class="tok-keyword">highlight</span>')
    expect(html).toContain('2021')
  })

  it('highlights the kebab-case area-fill keyword', () => {
    const html = highlightDsl('chart line {\narea-fill "A" "B" {\n}\n}')
    expect(html).toContain('<span class="tok-keyword">area-fill</span>')
  })

  it('highlights annotation as a keyword', () => {
    const html = highlightDsl('chart line {\nscene "s" {\nannotation "abc12" {\nrepeat = true\n}\n}\n}')
    expect(html).toContain('<span class="tok-keyword">annotation</span>')
  })

  it('highlights range as a keyword', () => {
    const html = highlightDsl('chart line {\nscene "s" {\nrange {\nrepeat = true\n}\n}\n}')
    expect(html).toContain('<span class="tok-keyword">range</span>')
  })

  it('highlights block comments with the tok-comment class', () => {
    const html = highlightDsl('chart line {\n/* a comment */\ntitle = "Hi"\n}')
    expect(html).toContain('<span class="tok-comment">/* a comment */</span>')
  })

  it('highlights note as a keyword in the block form', () => {
    const html = highlightDsl('chart line {\nnote {\ntext = "hi"\n}\n}')
    expect(html).toContain('<span class="tok-keyword">note</span>')
  })

  it('highlights a top-level note property key as an identifier, not a keyword', () => {
    const html = highlightDsl('chart line {\nnote = "footnote"\n}')
    expect(html).toContain('<span class="tok-variableName">note</span>')
    expect(html).not.toContain('<span class="tok-keyword">note</span>')
  })

  it('highlights scene keyword', () => {
    const html = highlightDsl('chart line {\nscene "intro" {\n}\n}')
    expect(html).toContain('<span class="tok-keyword">scene</span>')
  })

  it('treats series meta-row key as a plain identifier inside data', () => {
    const html = highlightDsl('chart bar {\ndata {\nseries = "X","Y"\n"2000" = 1,2\n}\n}')
    expect(html).toContain('series')
    expect(html).toContain('tok-string')
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
