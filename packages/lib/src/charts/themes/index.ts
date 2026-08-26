export interface ThemeEntry {
  name: string
  label: string
  description: string
}

// One entry per stylesheet in this directory: a theme name with no matching
// `.bc-theme-*` rule renders unstyled instead of failing, so this list is what
// the validator checks against.
const THEMES: ThemeEntry[] = [
  { name: 'blueprint', label: 'Blueprint', description: 'The default Blueprint Chart theme' },
  { name: 'blueprint-framed', label: 'Blueprint Framed', description: 'Adds borders and a tinted footer' },
  { name: 'blueprint-bold', label: 'Blueprint Bold', description: 'Charts on the blueprint canvas with the full brand palette' },
]

export function listThemes(): ThemeEntry[] {
  return THEMES
}
