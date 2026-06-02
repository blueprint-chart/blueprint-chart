import { shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import LandingTopNav from './LandingTopNav.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({
    theme: shallowRef('light'),
    resolvedTheme: shallowRef('light'),
    cycleTheme: vi.fn(),
  }),
}))

vi.mock('@/composables/usePlatformShortcut', () => ({
  usePlatformShortcut: () => ({
    keyLabel: '⌘ K',
    matches: () => false,
    trigger: vi.fn(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k',
        code: 'KeyK',
        ctrlKey: true,
        bubbles: true,
      }))
    }),
  }),
}))

function mountNav() {
  return mount(LandingTopNav, {
    global: {
      stubs: {
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
        'ButtonIcon': { template: '<button class="btn-stub" :data-label="label"><slot /></button>', props: ['label', 'variant', 'size', 'iconRight', 'iconLeft', 'hideLabel', 'square'] },
        'AppIcon': { template: '<span />', props: ['name', 'size'] },
        'NavigationCommandBar': {
          template: '<button class="ncb-stub" :data-placeholder="placeholder" @click="$emit(\'click\')"><slot /></button>',
          props: ['placeholder', 'shortcutLabel'],
          emits: ['click'],
        },
        'NavigationMarketingBar': {
          template: `
            <header class="nmb-stub">
              <slot name="brand" />
              <nav class="nmb-stub__menu"><slot name="menu" /></nav>
              <div class="nmb-stub__actions"><slot name="actions" /></div>
              <div class="nmb-stub__cta-secondary"><slot name="cta-secondary" /></div>
              <div class="nmb-stub__cta-primary"><slot name="cta-primary" /></div>
            </header>
          `,
        },
      },
    },
  })
}

describe('LandingTopNav', () => {
  it('renders the brand name and logo', () => {
    const w = mountNav()
    expect(w.find('.landing-topnav__brand-name').text()).toBe('Blueprint Chart')
    expect(w.find('.landing-topnav__brand-logo').exists()).toBe(true)
  })

  it('renders the five section anchor links inside the marketing menu slot', () => {
    const w = mountNav()
    const menuLabels = w.findAll('.nmb-stub__menu a').map(n => n.text())
    expect(menuLabels).toEqual(['AI', 'Format', 'Defaults', 'Transforms', 'Scenes'])
  })

  it('renders search, GitHub, and theme toggle inside actions, in that order', () => {
    const w = mountNav()
    const actions = w.find('.nmb-stub__actions').html()
    expect(actions.indexOf('ncb-stub')).toBeLessThan(actions.indexOf('landing-topnav__github'))
    expect(actions.indexOf('landing-topnav__github')).toBeLessThan(actions.indexOf('data-label="Toggle theme"'))
  })

  it('does not render My charts or New chart buttons', () => {
    const w = mountNav()
    const labels = w.findAll('.btn-stub').map(n => n.attributes('data-label'))
    expect(labels).not.toContain('My charts')
    expect(labels).not.toContain('New chart')
  })

  it('clicking the search pill replays the platform shortcut keydown', async () => {
    const w = mountNav()
    let captured: KeyboardEvent | null = null
    const handler = (ev: Event) => {
      captured = ev as KeyboardEvent
    }
    document.addEventListener('keydown', handler)
    await w.find('.ncb-stub').trigger('click')
    document.removeEventListener('keydown', handler)
    expect(captured).not.toBeNull()
    expect(captured!.key).toBe('k')
  })

  it('uses NavigationMarketingBar as its root chrome', () => {
    const w = mountNav()
    expect(w.find('.nmb-stub').exists()).toBe(true)
  })
})
