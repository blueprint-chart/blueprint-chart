// @vitest-environment node
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const p = fileURLToPath(new URL('./_eyebrow.scss', import.meta.url))
const css = sass.compile(p, { style: 'expanded' }).css

describe('_eyebrow.scss - mark migration', () => {
  it('draws the hash and dot with the editorial mark token', () => {
    expect(css).toMatch(/\.bc-eyebrow__hash[^}]*color:\s*var\(--bc-mark\)/)
    expect(css).toMatch(/\.bc-eyebrow__dot[^}]*background:\s*var\(--bc-mark\)/)
  })

  it('no longer references the interactive accent for the marks', () => {
    expect(css).not.toMatch(/\.bc-eyebrow__hash[^}]*var\(--bc-accent\)/)
  })
})
