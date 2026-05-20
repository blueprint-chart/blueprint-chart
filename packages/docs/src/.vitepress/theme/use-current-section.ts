import { computed } from 'vue'
import { useData } from 'vitepress'

export interface DocsSection {
  text: string
  link: string
  activeMatch: string
}

interface NavEntry {
  text?: string
  link?: string
  activeMatch?: string
  [key: string]: unknown
}

function isDocsSection(entry: NavEntry): entry is DocsSection {
  return (
    typeof entry.text === 'string'
    && typeof entry.link === 'string'
    && typeof entry.activeMatch === 'string'
  )
}

export function useCurrentSection() {
  const { theme, page } = useData()

  const sections = computed<DocsSection[]>(() => {
    const nav = (theme.value as { nav?: NavEntry[] }).nav
    if (!Array.isArray(nav)) {
      return []
    }
    return nav.filter(isDocsSection)
  })

  const current = computed<DocsSection | null>(() => {
    const relative = (page.value as { relativePath?: string }).relativePath ?? ''
    // VitePress's relativePath is ".md"-suffixed (e.g. "guide/scenes.md");
    // strip the suffix and prepend "/" so `activeMatch` regexes — written
    // for URL paths — can match.
    const path = '/' + relative.replace(/\.md$/, '')
    return (
      sections.value.find(section =>
        new RegExp(section.activeMatch).test(path),
      ) ?? null
    )
  })

  return { sections, current }
}
