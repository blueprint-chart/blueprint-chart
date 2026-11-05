import router from './router'

vi.mock('@/stores/chartSession', () => ({ useChartSession: () => ({}), storageKey: vi.fn(), metaKey: vi.fn() }))
vi.mock('@/components/Dashboard/DashboardPage.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/Wizard/WizardShell.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/Render/RenderPage.vue', () => ({ default: { template: '<div />' } }))

describe('router titles', () => {
  it('sets the document title from route meta', async () => {
    await router.push('/charts')
    expect(document.title).toBe('My charts · Blueprint Chart')
  })

  it('falls back to the app name without meta title', async () => {
    await router.push('/')
    expect(document.title).toBe('Blueprint Chart')
  })
})
