import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import * as sass from 'sass'

const currentDir = dirname(new URL(import.meta.url).pathname)
const tokensPath = resolve(currentDir, 'tokens.scss')
const css = sass.compile(tokensPath, { style: 'expanded' }).css
const source = readFileSync(tokensPath, 'utf8')

const lightBody = css.match(/:root,\s*\[data-bs-theme=["']?light["']?\]\s*\{([^}]*)\}/i)?.[1] ?? ''
const darkBody = css.match(/\[data-bs-theme=["']?dark["']?\],\s*\.dark\s*\{([^}]*)\}/i)?.[1] ?? ''

const vars = sass.compileString(
  `@use 'tokens' as t; :root { --primary: #{t.$primary}; --body: #{t.$body-color}; --body-dark: #{t.$body-color-dark};
   --bg: #{t.$body-bg}; --bg-dark: #{t.$body-bg-dark}; --muted: #{t.$body-secondary-color}; --muted-dark: #{t.$body-secondary-color-dark};
   --tertiary: #{t.$body-tertiary-color}; --tertiary-bg: #{t.$body-tertiary-bg}; --tertiary-bg-dark: #{t.$body-tertiary-bg-dark};
   --pe-dark: #{t.$primary-text-emphasis-dark}; --ps-dark: #{t.$primary-bg-subtle-dark}; --pb-dark: #{t.$primary-border-subtle-dark}; --tertiary-dark: #{t.$body-tertiary-color-dark}; }`,
  { loadPaths: [currentDir] },
).css

const read = (block: string, name: string) =>
  block.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim() ?? ''

function parseColor(value: string): [number, number, number, number] {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1]
  if (hex) {
    const full = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex
    const n = parseInt(full, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
  }
  const [r, g, b, a = 1] = value.match(/rgba?\(([^)]+)\)/i)![1].split(',').map(Number)
  return [r, g, b, a]
}

function luminance([r, g, b]: number[]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrast(fg: string, bg: string) {
  const [br, bgG, bb] = parseColor(bg)
  const [r, g, b, a] = parseColor(fg)
  const mixed = [r * a + br * (1 - a), g * a + bgG * (1 - a), b * a + bb * (1 - a)]
  const [l1, l2] = [luminance(mixed), luminance([br, bgG, bb])].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

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
    expect(css).toMatch(/--bc-mark:/i)
  })

  it('no longer defines the retired marketing surface tokens', () => {
    expect(css).not.toMatch(/--bc-marketing-field/i)
    expect(css).not.toMatch(/--bc-marketing-card/i)
    // the editorial ink + focus constants stay
    expect(css).toMatch(/--bc-marketing-ink:/i)
    expect(css).toMatch(/--bc-focus-ring-marketing:/i)
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

  it('exposes body and secondary text colors at runtime', () => {
    expect(lightBody).toMatch(/--bc-text-primary:\s*#171717/i)
    expect(lightBody).toMatch(/--bc-text-secondary:\s*#666666/i)
    expect(darkBody).toMatch(/--bc-text-primary:\s*#ededed/i)
    expect(darkBody).toMatch(/--bc-text-secondary:\s*#a1a1a1/i)
  })

  it('draws hairlines with the same colors as bootstrap borders', () => {
    expect(lightBody).toMatch(/--bc-hairline:\s*#eaeaea/i)
    expect(lightBody).toMatch(/--bc-hairline-strong:\s*#dedede/i)
  })

  it('locks the neutral dark surface ramp', () => {
    expect(read(vars, '--bg-dark')).toBe('#000000')
    expect(darkBody).toMatch(/--bc-chrome-bg:\s*#000000/i)
    expect(darkBody).toMatch(/--bc-content-bg:\s*#000000/i)
    expect(darkBody).toMatch(/--bc-hairline:\s*#2e2e2e/i)
    expect(darkBody).toMatch(/--bc-hairline-strong:\s*#454545/i)
    expect(darkBody).toMatch(/--bc-canvas-dimension-color:\s*rgba\(255,\s*255,\s*255,\s*0\.45\)/i)
    expect(darkBody).toMatch(/--bc-shadow-overlay:[^;]*rgba\(0,\s*0,\s*0,\s*0\.6\)/i)
  })

  it('makes primary the body color, not Prussian', () => {
    expect(read(vars, '--primary')).toBe('#171717')
  })

  it.each([
    ['--body', '--bg'], ['--muted', '--bg'], ['--tertiary', '--bg'],
    ['--body-dark', '--bg-dark'], ['--muted-dark', '--bg-dark'], ['--tertiary-dark', '--bg-dark'],
    ['--tertiary', '--tertiary-bg'], ['--tertiary-dark', '--tertiary-bg-dark'],
    ['--pe-dark', '--ps-dark'], ['--pe-dark', '--bg-dark'],
  ])('%s on %s reaches 4.5:1', (fg, bg) => {
    expect(contrast(read(vars, fg), read(vars, bg))).toBeGreaterThanOrEqual(4.5)
  })

  it.each([['light', () => lightBody], ['dark', () => darkBody]])(
    'declares the same two-ring focus token and a distinct selected ring in the %s block',
    (_, block) => {
      expect(block()).toMatch(/--bc-focus-ring:\s*0 0 0 2px var\(--bs-body-bg\), 0 0 0 4px var\(--bs-emphasis-color\);/)
      expect(block()).toMatch(/--bc-selected-ring:\s*0 0 0 2px var\(--bs-emphasis-color\);/)
    },
  )

  it('keeps the dark primary tints visible against the page', () => {
    expect(contrast(read(vars, '--pb-dark'), read(vars, '--bg-dark'))).toBeGreaterThanOrEqual(1.5)
    expect(read(vars, '--ps-dark')).not.toBe(read(vars, '--bg-dark'))
  })

  it('emits the tertiary text color as a runtime token in both blocks', () => {
    expect(lightBody).toMatch(/--bc-text-tertiary:\s*#6b6b6b/i)
    expect(darkBody).toMatch(/--bc-text-tertiary:\s*#8f8f8f/i)
  })

  it('declares the strong button hover token per theme', () => {
    expect(lightBody).toMatch(/--bc-btn-strong-hover-bg:\s*#383838/i)
    expect(darkBody).toMatch(/--bc-btn-strong-hover-bg:\s*#cccccc/i)
  })

  it('flattens the wash: content, tile and chrome equal the page bg', () => {
    for (const [block, bg, elevated] of [[lightBody, '#ffffff', '#f2f2f2'], [darkBody, '#000000', '#1f1f1f']]) {
      for (const name of ['--bc-content-bg', '--bc-tile-bg', '--bc-chrome-bg']) {
        expect(read(block, name)).toBe(bg)
      }
      expect(read(block, '--bc-tile-bg-elevated')).toBe(elevated)
    }
  })

  it('uses a neutral canvas with a grey grid', () => {
    expect(read(lightBody, '--bc-canvas-bg')).toBe('#f5f5f5')
    expect(read(darkBody, '--bc-canvas-bg')).toBe('#0d0d0d')
    expect(lightBody).toMatch(/--bc-canvas-grid-color:\s*rgba\(0,\s*0,\s*0,/)
    expect(lightBody).toMatch(/--bc-canvas-grid-color-major:\s*rgba\(0,\s*0,\s*0,/)
    expect(darkBody).toMatch(/--bc-canvas-grid-color:\s*rgba\(255,\s*255,\s*255,/)
    expect(darkBody).toMatch(/--bc-canvas-grid-color-major:\s*rgba\(255,\s*255,\s*255,/)
  })

  it.each(['--bc-syn-keyword', '--bc-syn-string', '--bc-syn-number', '--bc-syn-identifier', '--bc-syn-punct', '--bc-syn-comment'])(
    '%s reaches 4.5:1 on the code surface in both themes',
    (name) => {
      for (const block of [lightBody, darkBody]) {
        expect(contrast(read(block, name), read(block, '--bc-tile-bg-elevated'))).toBeGreaterThanOrEqual(4.5)
      }
    },
  )

  it('moves keyword off Prussian', () => {
    expect(read(lightBody, '--bc-syn-keyword')).not.toMatch(/2563A0/i)
  })

  it('keeps Prussian only in accent, primary button, marketing and marketing focus tokens', () => {
    const prussian = /2563A0|163A65|102E55|0A1E3D|4B90CF|A3C9E8|E1EEF7|244a7c|rgba\(37,\s*99,\s*160|rgba\(75,\s*144,\s*207|rgba\(163,\s*201,\s*232/i
    const allowed = /^--bc-(accent-ink|btn-primary-|marketing-|focus-ring-marketing)/
    for (const block of [lightBody, darkBody]) {
      const offenders = block.split(';').map(d => d.trim()).filter(d => prussian.test(d) && !allowed.test(d))
      expect(offenders).toEqual([])
    }
  })

  it('goes grey on mark and pool ink', () => {
    for (const block of [lightBody, darkBody]) {
      for (const name of ['--bc-mark', '--bc-pool-ink']) {
        const [r, g, b] = parseColor(read(block, name))
        expect(r === g && g === b).toBe(true)
      }
    }
  })
})

describe('drawer height', () => {
  it('keeps vh as the base and upgrades to dvh only under @supports', () => {
    expect(lightBody).toMatch(/--bc-drawer-height:\s*70vh/)
    expect(lightBody).not.toMatch(/70dvh/)
    expect(css).toMatch(/@supports \(height: 1dvh\)\s*\{[^@]*--bc-drawer-height:\s*70dvh/)
  })
})
