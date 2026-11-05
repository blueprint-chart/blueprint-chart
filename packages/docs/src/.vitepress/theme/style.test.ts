import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(__dirname, 'style.css'), 'utf8')
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
