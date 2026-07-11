// @vitest-environment node
//
// Forced to the node environment: under the package default (jsdom), the
// jsdom-shimmed URL constructor resolves `new URL(relative, import.meta.url)`
// against jsdom's document location instead of the file: base, breaking
// fileURLToPath. tokens.test.ts sidesteps this with path.resolve; this file
// keeps the brief's URL-based resolution and opts out of jsdom instead.
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const effectsPath = fileURLToPath(new URL('./_effects.scss', import.meta.url))
const css = sass.compile(effectsPath, { style: 'expanded' }).css

describe('_effects.scss — grid pool + ring', () => {
  it('masks the grid pool with a radial gradient (the signature)', () => {
    expect(css).toMatch(/\.bc-pool/)
    expect(css).toMatch(/mask-image:\s*radial-gradient\(circle var\(--bc-pool-r\)/i)
  })

  it('draws the grid from two repeating linear gradients using pool ink', () => {
    const grads = css.match(/repeating-linear-gradient/g) ?? []
    expect(grads.length).toBeGreaterThanOrEqual(2)
    expect(css).toMatch(/var\(--bc-pool-ink\)/)
  })

  it('exposes a particle-ring class', () => {
    expect(css).toMatch(/\.bc-ring/)
  })
})
