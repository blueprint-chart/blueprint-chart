import { describe, expect, it, vi } from 'vitest'

// VitePress is not present in unit tests; stub `useData` per the pattern
// established in use-docs-theme.test.ts.
const themeRef = { value: { nav: [] as any[] } }
const pageRef = { value: { relativePath: '' as string } }
vi.mock('vitepress', () => ({
  useData: () => ({ theme: themeRef, page: pageRef }),
}))

import { useCurrentSection } from './use-current-section'

const FIVE_SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started', activeMatch: '^/guide/' },
  { text: 'Charts', link: '/charts/', activeMatch: '^/charts/' },
  { text: 'Handbook', link: '/handbook/', activeMatch: '^/handbook/' },
  { text: 'DSL Spec', link: '/spec/dsl', activeMatch: '^/spec/' },
  { text: 'API', link: '/api/', activeMatch: '^/api/' },
  { text: 'Editor', link: 'https://blueprintchart.com', target: '_blank' },
]

describe('useCurrentSection', () => {
  it('returns the five docs sections, filtering out entries without activeMatch', () => {
    themeRef.value = { nav: FIVE_SECTIONS }
    pageRef.value = { relativePath: 'index.md' }

    const { sections } = useCurrentSection()
    expect(sections.value).toHaveLength(5)
    expect(sections.value.map((s) => s.text)).toEqual([
      'Guide', 'Charts', 'Handbook', 'DSL Spec', 'API',
    ])
  })

  it('matches "guide/scenes.md" to the Guide section', () => {
    themeRef.value = { nav: FIVE_SECTIONS }
    pageRef.value = { relativePath: 'guide/scenes.md' }

    const { current } = useCurrentSection()
    expect(current.value?.text).toBe('Guide')
  })

  it('matches "spec/dsl.md" to the DSL Spec section', () => {
    themeRef.value = { nav: FIVE_SECTIONS }
    pageRef.value = { relativePath: 'spec/dsl.md' }

    const { current } = useCurrentSection()
    expect(current.value?.text).toBe('DSL Spec')
  })

  it('matches "charts/index.md" to Charts (trailing slash in activeMatch)', () => {
    themeRef.value = { nav: FIVE_SECTIONS }
    pageRef.value = { relativePath: 'charts/index.md' }

    const { current } = useCurrentSection()
    expect(current.value?.text).toBe('Charts')
  })

  it('returns null when on the home page (no match)', () => {
    themeRef.value = { nav: FIVE_SECTIONS }
    pageRef.value = { relativePath: 'index.md' }

    const { current } = useCurrentSection()
    expect(current.value).toBeNull()
  })

  it('returns null when the path matches nothing in nav[]', () => {
    themeRef.value = { nav: FIVE_SECTIONS }
    pageRef.value = { relativePath: 'unknown/page.md' }

    const { current } = useCurrentSection()
    expect(current.value).toBeNull()
  })

  it('handles missing nav gracefully (returns empty sections, null current)', () => {
    themeRef.value = { nav: undefined as any }
    pageRef.value = { relativePath: 'guide/getting-started.md' }

    const { sections, current } = useCurrentSection()
    expect(sections.value).toEqual([])
    expect(current.value).toBeNull()
  })
})
