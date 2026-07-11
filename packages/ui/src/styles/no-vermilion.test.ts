// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The five migrated source sites. If a future edit reintroduces vermilion in
// any of them, this fails loudly.
const files = [
  './tokens.scss',
  './_eyebrow.scss',
  '../components/Navigation/NavigationWorkspaceSwitcher/NavigationWorkspaceSwitcher.vue',
]

describe('vermilion is fully retired', () => {
  for (const rel of files) {
    it(`has no vermilion hex in ${rel}`, () => {
      const src = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
      expect(src).not.toMatch(/E4512B/i)
      expect(src).not.toMatch(/F2703F/i)
    })
  }
})
