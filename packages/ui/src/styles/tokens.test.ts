import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import * as sass from 'sass'

const currentDir = dirname(new URL(import.meta.url).pathname)
const tokensPath = resolve(currentDir, 'tokens.scss')
const css = sass.compile(tokensPath, { style: 'expanded' }).css
const source = readFileSync(tokensPath, 'utf8')

describe('tokens.scss - chartreuse accent', () => {
  it('defines chartreuse as the accent in light and dark', () => {
    // #DDF247 appears as --bc-accent in both :root and the dark block
    const matches = css.match(/--bc-accent:\s*#DDF247/gi) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('sets accent ink to prussian-600 navy', () => {
    expect(css).toMatch(/--bc-accent-ink:\s*#163A65/i)
  })

  it('exposes pool + marketing + mark tokens', () => {
    expect(css).toMatch(/--bc-pool-r:\s*100px/i)
    expect(css).toMatch(/--bc-pool-ink:/i)
    expect(css).toMatch(/--bc-marketing-field:\s*#000000/i)
    expect(css).toMatch(/--bc-marketing-card:\s*#0D1B2E/i)
    expect(css).toMatch(/--bc-mark:/i)
    expect(css).toMatch(/--bc-swipe:/i)
  })

  it('defines a primary button token pair that flips per theme', () => {
    expect(css).toMatch(/--bc-btn-primary-bg:/i)
    expect(css).toMatch(/--bc-btn-primary-fg:/i)

    const lightBlockMatch = css.match(
      /:root,\s*\[data-bs-theme=["']?light["']?\]\s*\{([^}]*)\}/i,
    )
    const darkBlockMatch = css.match(
      /\[data-bs-theme=["']?dark["']?\],\s*\.dark\s*\{([^}]*)\}/i,
    )
    expect(lightBlockMatch).not.toBeNull()
    expect(darkBlockMatch).not.toBeNull()

    const lightBody = lightBlockMatch?.[1] ?? ''
    const darkBody = darkBlockMatch?.[1] ?? ''

    expect(lightBody).toMatch(/--bc-btn-primary-bg:\s*#163A65/i)
    expect(lightBody).toMatch(/--bc-btn-primary-fg:\s*#DDF247/i)
    expect(darkBody).toMatch(/--bc-btn-primary-bg:\s*#DDF247/i)
    expect(darkBody).toMatch(/--bc-btn-primary-fg:\s*#163A65/i)
  })

  it('contains no vermilion hex anywhere', () => {
    expect(source).not.toMatch(/E4512B/i)
    expect(source).not.toMatch(/F2703F/i)
    expect(css).not.toMatch(/E4512B/i)
    expect(css).not.toMatch(/F2703F/i)
  })
})
