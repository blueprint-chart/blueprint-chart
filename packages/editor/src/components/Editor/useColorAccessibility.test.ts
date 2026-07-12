// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const dir = dirname(new URL(import.meta.url).pathname)
const source = readFileSync(resolve(dir, 'useColorAccessibility.ts'), 'utf8')

describe('useColorAccessibility', () => {
  it('checks dark-theme contrast against the true-black canvas', () => {
    expect(source).toMatch(/const DARK_BG = '#000000'/)
  })
})
