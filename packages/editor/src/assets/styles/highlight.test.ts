// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const main = readFileSync(
  fileURLToPath(new URL('./main.scss', import.meta.url)),
  'utf8',
)

describe('highlighter utility', () => {
  it('defines .bc-highlight using the shared swipe token', () => {
    expect(main).toMatch(/\.bc-highlight\s*{[^}]*background:\s*var\(--bc-swipe\)/)
  })

  it('shares the swipe token in both themes (no dark chartreuse-ink override)', () => {
    // The dark override that force-colored .bc-highlight chartreuse text is
    // removed: --bc-swipe itself carries the faint dark treatment now, so
    // .bc-highlight resolves the same rule in both themes.
    expect(main).not.toMatch(/\[data-bs-theme="dark"\][^{]*\.bc-highlight/s)
  })

  it('does not re-declare the swipe gradient (it lives in --bc-swipe)', () => {
    // Guard against copy-pasting the linear-gradient back into components.
    expect(main).not.toMatch(/linear-gradient\(\s*180deg[^)]*transparent 45%/)
  })
})
