import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { installBpcFence } from './bpc-fence'

function render(mdSource: string, frontmatter: Record<string, unknown> = {}) {
  const md = new MarkdownIt()
  installBpcFence(md)
  return md.render(mdSource, { frontmatter })
}

/** Pull the decoded BPC source out of the emitted <BpcBlock source-b64="…">. */
function decodedSource(html: string): string {
  const m = html.match(/source-b64="([^"]+)"/)
  if (!m) {
    throw new Error('no BpcBlock in output:\n' + html)
  }
  return Buffer.from(m[1], 'base64').toString('utf-8')
}

const bar = '```bpc\nchart bar-vertical {\n  title = "Hi"\n  data {\n    "a" = 1\n  }\n}\n```'

describe('installBpcFence brand default', () => {
  it('injects theme + palette when the fence declares neither', () => {
    const src = decodedSource(render(bar))
    expect(src).toContain('theme = "blueprint-bold"')
    expect(src).toContain('colorPalette = "BlueprintBold"')
  })

  it('leaves a fence that already sets a palette untouched', () => {
    const fence = '```bpc\nchart donut {\n  colorPalette = "Imperator"\n  data {\n    "a" = 1\n  }\n}\n```'
    const src = decodedSource(render(fence))
    expect(src).toContain('colorPalette = "Imperator"')
    expect(src).not.toContain('blueprint-bold')
  })

  it('skips injection for a fence with the plain modifier', () => {
    const fence = '```bpc plain\nchart bar-vertical {\n  data {\n    "a" = 1\n  }\n}\n```'
    const src = decodedSource(render(fence))
    expect(src).not.toContain('blueprint-bold')
  })

  it('skips injection when the page opts out via frontmatter', () => {
    const src = decodedSource(render(bar, { bpcBrandDefault: false }))
    expect(src).not.toContain('blueprint-bold')
  })

  it('still wraps non-bpc fences unchanged (plain code block)', () => {
    const html = render('```js\nconst a = 1\n```')
    expect(html).not.toContain('BpcBlock')
  })
})
