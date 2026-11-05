import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const layout = readFileSync(resolve(__dirname, 'Layout.vue'), 'utf8')
const docsBar = layout.match(/<NavigationDocsBar[\s\S]*?<\/NavigationDocsBar>/)![0]
const sidebar = layout.match(/#sidebar-nav-before[\s\S]*?<\/template>/)![0]

describe('docs Layout.vue', () => {
  it('puts the section switcher in the brand row, after the home link', () => {
    const brandRow = sidebar.match(/<div\s+class="docs-sidebar-brand"[\s\S]*?<\/div>/)![0]
    expect(brandRow).toMatch(/docs-sidebar-brand__home[\s\S]*<NavigationSectionDropdown/)
  })

  it('puts the search in the sidebar on doc pages, like the editor', () => {
    expect(sidebar).toContain('<NavigationCommandBar')
    expect(docsBar).not.toContain('<NavigationCommandBar')
  })
})
