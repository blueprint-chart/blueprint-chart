import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(__dirname, 'style.css'), 'utf8')
const hoverSources = ['style.css', 'Layout.vue', 'components/SectionTiles.vue', 'components/DocFeedback.vue']
  .map(file => [file, readFileSync(resolve(__dirname, file), 'utf8')] as const)

function withoutHoverMediaBlocks(source: string) {
  let out = ''
  let i = 0
  while (i < source.length) {
    const start = source.indexOf('@media (hover: hover)', i)
    if (start === -1) {
      return out + source.slice(i)
    }
    out += source.slice(i, start)
    let depth = 0
    let j = source.indexOf('{', start)
    do {
      depth += Number(source[j] === '{') - Number(source[j] === '}')
      j++
    } while (depth > 0)
    i = j
  }
  return out
}
const surfaces = ['var(--vp-c-bg)', 'var(--bs-body-bg)']

function declarations(property: string) {
  return [...css.matchAll(new RegExp(`${property}:\\s*([^;]+);`, 'g'))].map(([, value]) => value.trim())
}

describe('docs theme style.css', () => {
  it.each(['--vp-c-bg-alt', '--vp-c-bg-soft'])('%s equals the page background', (property) => {
    const values = declarations(property)
    expect(values.length).toBeGreaterThan(0)
    values.forEach(value => expect(surfaces).toContain(value))
  })

  it.each([
    ['--vp-c-text-1', 'var(--bc-text-primary)'],
    ['--vp-c-text-2', 'var(--bc-text-secondary)'],
    ['--vp-c-gray-1', 'var(--bc-hairline-strong)'],
    ['--vp-c-gray-2', 'var(--bc-hairline)'],
    ['--vp-c-gray-3', 'var(--bc-tile-bg-elevated)'],
    ['--vp-c-gray-soft', 'var(--bc-wash-firm)'],
    ['--vp-c-border', 'var(--bc-hairline-strong)'],
    ['--vp-local-search-bg', 'var(--vp-c-bg-elv)'],
    ['--vp-local-search-result-bg', 'var(--vp-c-bg-elv)'],
    ['--vp-local-search-result-selected-bg', 'var(--vp-c-bg-elv)'],
  ])('%s resolves to %s in both themes', (property, value) => {
    const values = declarations(property)
    expect(values.length).toBeGreaterThan(0)
    values.forEach(v => expect(v).toBe(value))
  })

  it('bridges the tertiary surface that ui components paint menus with', () => {
    expect(declarations('--bs-tertiary-bg')).toEqual(['var(--bc-tile-bg-elevated)', 'var(--bc-tile-bg-elevated)'])
  })

  it('sizes sidebar items like the editor sidebar', () => {
    const text = css.match(/\.VPSidebar \.VPSidebarItem \.item > \.link > \.text\s*\{[^}]*\}/)![0]
    expect(text).toMatch(/font-size:\s*var\(--bs-font-size-md\)/)
    expect(text).toMatch(/font-weight:\s*400/)
  })

  it('fills the active sidebar item like the editor sidebar', () => {
    const active = css.match(/\.VPSidebar \.VPSidebarItem\.is-active > \.item > \.link\s*\{[^}]*\}/)![0]
    expect(active).toMatch(/background:\s*var\(--bs-tertiary-bg\)/)
    expect(active).toMatch(/--vp-c-brand-1:\s*var\(--bs-emphasis-color\)/)
  })

  it('tracks sidebar eyebrows like the editor sidebar', () => {
    const eyebrow = css.match(/\.VPSidebarItem\.level-0 > \.item > \.text\s*\{[^}]*\}/)![0]
    expect(eyebrow).toMatch(/letter-spacing:\s*0\.1em/)
  })

  it('frames chart blocks like the editor canvas', () => {
    const block = css.match(/\.bpc-block\s*\{[^}]*\}/)![0]
    expect(block).toMatch(/border:\s*1px solid var\(--bc-frame-border\)/)
    expect(block).toMatch(/border-radius:\s*var\(--bc-frame-radius\)/)
  })

  it.each(hoverSources)('%s keeps :hover styles behind @media (hover: hover)', (_, source) => {
    expect(withoutHoverMediaBlocks(source)).not.toMatch(/:hover/)
  })

  it('has no font size below 12px', () => {
    const sizes = declarations('font-size').filter(value => /^[\d.]+(px|rem)$/.test(value))
    sizes.forEach((value) => {
      const px = value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value)
      expect(px, value).toBeGreaterThanOrEqual(12)
    })
  })

  it('collapses .docs-search inside the narrow media query', () => {
    expect(css).toMatch(/@media \(max-width: 959\.98px\)\s*\{[^@]*\.docs-search/)
  })
})
