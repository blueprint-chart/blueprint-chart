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
