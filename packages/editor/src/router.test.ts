import { nextTick } from 'vue'
import router from './router'

vi.mock('@/stores/chartSession', () => ({ useChartSession: () => ({ sessionId: { value: 'x' } }), storageKey: vi.fn(), metaKey: vi.fn() }))
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

  it('leaves the title alone when the navigation fails', async () => {
    await router.push('/charts')
    document.title = 'Stale'
    await router.push('/charts')
    expect(document.title).toBe('Stale')
  })

  describe('scrollBehavior', () => {
    const scroll = (to: object) => router.options.scrollBehavior!(to as never, {} as never, null)

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('smooth-scrolls to hashes by default', async () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }))
      expect(await scroll({ hash: '#features' })).toMatchObject({ behavior: 'smooth' })
    })

    it('does not animate hash scrolling under reduced motion', async () => {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' }))
      expect(await scroll({ hash: '#features' })).toMatchObject({ behavior: 'auto' })
    })
  })

  describe('focus management', () => {
    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('focuses the view h1 after navigating', async () => {
      await router.push('/')
      document.body.innerHTML = '<main id="main"><h1>Title</h1></main>'
      await router.push('/charts')
      await nextTick()
      const h1 = document.querySelector('h1')
      expect(h1?.getAttribute('tabindex')).toBe('-1')
      expect(document.activeElement).toBe(h1)
    })

    it('keeps focus when navigating between steps of the same view', async () => {
      await router.push('/edit/x/data')
      document.body.innerHTML = '<main id="main"><h1>Title</h1></main><button id="tab">Visualize</button>'
      const tab = document.getElementById('tab')!
      tab.focus()
      await router.push('/edit/x/visualize')
      await nextTick()
      expect(document.activeElement).toBe(tab)
    })

    it('falls back to main when the view has no h1', async () => {
      await router.push('/')
      document.body.innerHTML = '<main id="main" tabindex="-1"></main>'
      await router.push('/charts')
      await nextTick()
      expect(document.activeElement).toBe(document.getElementById('main'))
    })
  })
})
