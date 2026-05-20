import { describe, expect, it, vi } from 'vitest'

// VitePress is not present in unit tests; stub `useData` per the pattern
// established in use-docs-theme.test.ts.
interface FakeNavEntry {
  text: string
  link: string
  activeMatch?: string
  target?: string
}

const themeRef: { value: { nav?: FakeNavEntry[] } } = { value: { nav: [] } }
const pageRef: { value: { relativePath: string } } = { value: { relativePath: '' } }
vi.mock('vitepress', () => ({
  useData: () => ({ theme: themeRef, page: pageRef }),
}))

import { useCurrentSection } from './use-current-section'

const FOUR_SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started', activeMatch: '^/guide/' },
  { text: 'Charts', link: '/charts/', activeMatch: '^/charts/' },
  { text: 'Handbook', link: '/handbook/', activeMatch: '^/handbook/' },
  { text: 'Reference', link: '/reference/', activeMatch: '^/reference/' },
  { text: 'Editor', link: 'https://blueprintchart.com', target: '_blank' },
]

describe('useCurrentSection', () => {
  it('returns the four docs sections, filtering out entries without activeMatch', () => {
    themeRef.value = { nav: FOUR_SECTIONS }
    pageRef.value = { relativePath: 'index.md' }

    const { sections } = useCurrentSection()
    expect(sections.value).toHaveLength(4)
    expect(sections.value.map(s => s.text)).toEqual([
      'Guide', 'Charts', 'Handbook', 'Reference',
    ])
  })

  it('matches "guide/scenes.md" to the Guide section', () => {
    themeRef.value = { nav: FOUR_SECTIONS }
    pageRef.value = { relativePath: 'guide/scenes.md' }

    const { current } = useCurrentSection()
    expect(current.value?.text).toBe('Guide')
  })

  it('matches "reference/dsl/properties.md" to the Reference section', () => {
    themeRef.value = { nav: FOUR_SECTIONS }
    pageRef.value = { relativePath: 'reference/dsl/properties.md' }

    const { current } = useCurrentSection()
    expect(current.value?.text).toBe('Reference')
  })

  it('matches "charts/index.md" to the Charts section', () => {
    themeRef.value = { nav: FOUR_SECTIONS }
    pageRef.value = { relativePath: 'charts/index.md' }

    const { current } = useCurrentSection()
    expect(current.value?.text).toBe('Charts')
  })

  it('returns null when on the home page (no match)', () => {
    themeRef.value = { nav: FOUR_SECTIONS }
    pageRef.value = { relativePath: 'index.md' }

    const { current } = useCurrentSection()
    expect(current.value).toBeNull()
  })

  it('returns null when the path matches nothing in nav[]', () => {
    themeRef.value = { nav: FOUR_SECTIONS }
    pageRef.value = { relativePath: 'unknown/page.md' }

    const { current } = useCurrentSection()
    expect(current.value).toBeNull()
  })

  it('handles missing nav gracefully (returns empty sections, null current)', () => {
    themeRef.value = { nav: undefined }
    pageRef.value = { relativePath: 'guide/getting-started.md' }

    const { sections, current } = useCurrentSection()
    expect(sections.value).toEqual([])
    expect(current.value).toBeNull()
  })
})
