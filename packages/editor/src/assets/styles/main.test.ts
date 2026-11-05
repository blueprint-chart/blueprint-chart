// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass-embedded'

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const read = (path: string) => readFileSync(here(path), 'utf8')

const workspaceSources: Record<string, string> = {
  '@blueprint-chart/ui/styles/': '../../../../ui/src/styles/',
  '@blueprint-chart/lib/charts.scss': '../../../../lib/src/charts/chart.scss',
}

const workspaceImporter: sass.FileImporter<'sync'> = {
  findFileUrl(url) {
    const prefix = Object.keys(workspaceSources).find(key => url.startsWith(key))
    return prefix ? new URL(workspaceSources[prefix] + url.slice(prefix.length), import.meta.url) : null
  },
}

const css = sass.compile(here('./main.scss'), {
  importers: [workspaceImporter, new sass.NodePackageImporter()],
  loadPaths: [here('../../../node_modules')],
  quietDeps: true,
  silenceDeprecations: ['import'],
}).css

describe('button recipe', () => {
  it('rings every button with the shared focus token', () => {
    expect(css).toMatch(/\.btn\s*{[^}]*--bs-btn-focus-box-shadow:\s*var\(--bc-focus-ring\)/)
    expect(css).not.toMatch(/--bs-btn-focus-shadow-rgb:\s*37,\s*99,\s*160/)
  })

  it('builds .btn-strong from theme variables so it flips in nested themes', () => {
    expect(css).toMatch(/\.btn-strong\s*{[^}]*--bs-btn-bg:\s*var\(--bs-emphasis-color\)/)
    expect(css).toMatch(/\.btn-strong\s*{[^}]*--bs-btn-color:\s*var\(--bs-body-bg\)/)
    expect(css).toMatch(/\.btn-strong\s*{[^}]*--bs-btn-hover-bg:\s*var\(--bc-btn-strong-hover-bg\)/)
    expect(css).not.toMatch(/\[data-bs-theme=("?)dark\1\][^{]*\.btn-strong/)
  })

  it('washes status variants with subtle tokens', () => {
    expect(css).toMatch(/\.btn-danger\s*{[^}]*--bs-btn-bg:\s*var\(--bs-danger-bg-subtle\)/)
  })

  it('fills .btn-primary grey', () => {
    expect(css).toMatch(/\.btn-primary\s*{[^}]*--bs-btn-bg:\s*#f2f2f2/)
  })

  it('keeps shadows off form controls', () => {
    expect(css).not.toMatch(/\.form-control\s*{[^}]*box-shadow:\s*var\(--bs-box-shadow-inset\)/)
  })

  it('gives cards a 1px border', () => {
    expect(css).toMatch(/\.card\s*{[^}]*--bs-card-border-width:\s*1px/)
  })
})

describe('hard-coded rings', () => {
  const files = [
    '../../components/Panel/PanelOpenButton.vue',
    '../../../../docs/src/.vitepress/theme/components/DocFeedback.vue',
  ]

  it('docs :focus-visible uses the focus token', () => {
    const style = read('../../../../docs/src/.vitepress/theme/style.css')
    const rule = style.match(/:focus-visible\s*{[^}]*}/)?.[0]
    expect(rule).toContain('var(--bc-focus-ring)')
    expect(rule).not.toContain('rgba(37, 99, 160')
    expect(rule).not.toContain('outline: none')
  })

  it.each(files)('%s uses the focus token', (file) => {
    const source = read(file)
    expect(source).toContain('var(--bc-focus-ring)')
    expect(source).not.toContain('rgba(37, 99, 160')
  })

  it('bridges the theme variables the focus token needs in docs, light and dark', () => {
    const style = read('../../../../docs/src/.vitepress/theme/style.css')
    expect(style.match(/--bs-body-bg:\s*var\(--vp-c-bg\)/g)).toHaveLength(2)
    expect(style.match(/--bs-emphasis-color:\s*var\(--vp-c-text-1\)/g)).toHaveLength(2)
  })
})

describe('strong call sites', () => {
  const component = (path: string) => read(`../../components/${path}`)

  it.each([
    'Dashboard/DashboardToolbar.vue',
    'Account/AccountMenu.vue',
    'Panel/PanelStepperFooter.vue',
    'Data/DataUpload/DataUploadCard.vue',
    'Dashboard/DashboardDetailContent.vue',
  ])('%s uses the strong variant', (path) => {
    expect(component(path)).toContain('variant="strong"')
  })

  it('AccountSignInModal.vue uses btn-strong', () => {
    expect(component('Account/AccountSignInModal.vue')).toContain('btn-strong')
  })

  it('DataStructurePanel.vue has no outline-primary', () => {
    expect(component('Data/DataStructurePanel.vue')).not.toContain('outline-primary')
  })

  it('docs primary button flips with the theme', () => {
    const layout = read('../../../../docs/src/.vitepress/theme/Layout.vue')
    const rule = layout.match(/\.docs-btn-primary\s*{[^}]*}/)![0]
    const hover = layout.match(/\.docs-btn-primary:hover\s*{[^}]*}/)![0]
    expect(rule).toContain('background: var(--bs-emphasis-color)')
    expect(rule).toContain('color: var(--bs-body-bg)')
    expect(hover).toContain('var(--bc-btn-strong-hover-bg)')
  })
})

describe('form focus', () => {
  it('borders focused controls with the emphasis color', () => {
    expect(css).toMatch(/\.form-control:focus\s*{[^}]*border-color:\s*var\(--bs-emphasis-color\)/)
  })

  it('bakes a literal fill into the focused switch thumb', () => {
    const rule = css.match(/\.form-switch\s+\.form-check-input:focus\s*{[^}]*}/)?.[0] ?? ''
    expect(rule).toMatch(/--bs-form-switch-bg:\s*url\(/)
    expect(rule).not.toContain('var(')
    expect(rule).not.toContain('%23171717')
  })
})
