import { mount, type VueWrapper } from '@vue/test-utils'
import PanelShell from './PanelShell.vue'
import { usePanelStore, MIN_CANVAS_WIDTH } from '@/stores/panel'

// Mocked useElementSize lets tests drive canvas width directly.
// Once PanelShell calls usePanelCanvasSync (which calls useElementSize),
// every test in this file goes through this mock.
const elementWidth = ref(1000)
// Track the last element passed to useElementSize so structural tests can
// assert that PanelShell observes parentElement instead of containerRef itself.
let lastUseElementSizeTarget: unknown = undefined
vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    useElementSize: (target: unknown) => {
      lastUseElementSizeTarget = target
      return { width: elementWidth, height: ref(800) }
    },
  }
})

vi.mock('@blueprint-chart/ui', () => ({
  LayoutPanel: {
    template: '<div class="layout-panel"><div class="layout-panel__title">{{ title }}</div><div class="layout-panel__actions"><slot name="actions" /></div><slot name="toolbar" /><slot /><div v-if="$slots.footer" class="layout-panel__footer"><slot name="footer" /></div></div>',
    props: ['title'],
  },
  LayoutBottomDrawer: {
    template: '<div class="layout-bottom-drawer" v-if="modelValue"><div v-if="title" class="layout-bottom-drawer__title">{{ title }}</div><slot /></div>',
    props: ['modelValue', 'title'],
    emits: ['update:modelValue'],
  },
  ButtonClose: {
    template: '<button class="btn-close-stub" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
}))

// Module-scoped wrapper so afterEach can unmount it. Without unmount, orphan
// watchers from previous tests keep firing on the shared elementWidth ref and
// clobber the active Pinia instance, causing inter-test pollution.
let wrapper: VueWrapper | null = null

describe('PanelShell', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    elementWidth.value = 1000
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  describe('mode === "closed"', () => {
    it('renders nothing when mode is closed', () => {
      const panel = usePanelStore()
      panel.close()
      const w = mount(PanelShell, { props: { title: 'Test' } })
      expect(w.find('.panel-docked').exists()).toBe(false)
      expect(w.find('.layout-bottom-drawer').exists()).toBe(false)
    })
  })

  describe('mode === "docked"', () => {
    it('renders PanelDocked', () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, { props: { title: 'Settings' } })
      expect(w.find('.panel-docked').exists()).toBe(true)
      expect(w.find('.layout-panel__title').text()).toBe('Settings')
    })

    it('renders default slot content', () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, {
        props: { title: 'Test' },
        slots: { default: '<div class="body-content">Body</div>' },
      })
      expect(w.find('.body-content').text()).toBe('Body')
    })

    it('renders header slot in #toolbar position', () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, {
        props: { title: 'Test' },
        slots: { header: '<div class="header-content">Header</div>' },
      })
      expect(w.find('.header-content').text()).toBe('Header')
    })

    it('does not render tabs slot in docked mode', () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, {
        props: { title: 'Test' },
        slots: { tabs: '<div class="tabs-content">Tabs</div>' },
      })
      expect(w.find('.tabs-content').exists()).toBe(false)
    })

    it('renders footer slot', () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, {
        props: { title: 'Test' },
        slots: { footer: '<div class="footer-content">Footer</div>' },
      })
      expect(w.find('.layout-panel__footer').exists()).toBe(true)
      expect(w.find('.footer-content').text()).toBe('Footer')
    })

    it('clicking close calls panel.close() and emits close', async () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, { props: { title: 'Test' } })
      await w.find('.btn-close-stub').trigger('click')
      expect(panel.mode).toBe('closed')
      expect(w.emitted('close')).toHaveLength(1)
    })

    it('hides close button when showClose is false', () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, { props: { title: 'Test', showClose: false } })
      expect(w.find('.btn-close-stub').exists()).toBe(false)
    })
  })

  describe('mode === "drawer"', () => {
    it('renders PanelDrawer when drawerOpen is true', () => {
      const panel = usePanelStore()
      panel.initBreakpoint(true)
      const w = mount(PanelShell, {
        props: { title: 'Drawer', drawerOpen: true },
      })
      expect(w.find('.layout-bottom-drawer').exists()).toBe(true)
    })

    it('does not render drawer content when drawerOpen is false', () => {
      const panel = usePanelStore()
      panel.initBreakpoint(true)
      const w = mount(PanelShell, {
        props: { title: 'Drawer', drawerOpen: false },
      })
      expect(w.find('.layout-bottom-drawer').exists()).toBe(false)
    })

    it('renders default slot content in drawer', () => {
      const panel = usePanelStore()
      panel.initBreakpoint(true)
      const w = mount(PanelShell, {
        props: { title: 'Drawer', drawerOpen: true },
        slots: { default: '<div class="body-content">Body</div>' },
      })
      expect(w.find('.body-content').text()).toBe('Body')
    })

    it('renders header slot in drawer', () => {
      const panel = usePanelStore()
      panel.initBreakpoint(true)
      const w = mount(PanelShell, {
        props: { title: 'Drawer', drawerOpen: true },
        slots: { header: '<div class="header-content">Header</div>' },
      })
      expect(w.find('.header-content').text()).toBe('Header')
    })

    it('renders tabs slot in drawer', () => {
      const panel = usePanelStore()
      panel.initBreakpoint(true)
      const w = mount(PanelShell, {
        props: { title: 'Drawer', drawerOpen: true },
        slots: { tabs: '<div class="tabs-content">Tabs</div>' },
      })
      expect(w.find('.tabs-content').text()).toBe('Tabs')
    })

    it('emits drawerOpen update when drawer closes', async () => {
      const panel = usePanelStore()
      panel.initBreakpoint(true)
      const w = mount(PanelShell, {
        props: { title: 'Drawer', drawerOpen: true },
      })
      await w.findComponent({ name: 'PanelDrawer' }).vm.$emit('update:modelValue', false)
      expect(w.emitted('update:drawerOpen')).toBeTruthy()
      expect(w.emitted('update:drawerOpen')![0]).toEqual([false])
    })
  })

  describe('mode switching', () => {
    it('switches chrome when mode changes', async () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, { props: { title: 'Test' } })
      expect(w.find('.panel-docked').exists()).toBe(true)

      panel.close()
      await nextTick()
      expect(w.find('.panel-docked').exists()).toBe(false)
    })
  })

  describe('canvas-sync', () => {
    it('passes canvasWidth from useElementSize down to PanelDocked', async () => {
      elementWidth.value = 800
      const store = usePanelStore()
      store.dock()
      const parent = document.createElement('div')
      const container = document.createElement('div')
      parent.appendChild(container)
      document.body.appendChild(parent)
      wrapper = mount(PanelShell, {
        props: { title: 'Panel', containerRef: container },
      })
      await nextTick()
      const style = wrapper.find('.panel-docked').attributes('style')
      expect(style).toMatch(/width: \d+px/)
      const widthMatch = style?.match(/width: (\d+)px/)
      const renderedWidth = widthMatch ? parseInt(widthMatch[1], 10) : 0
      expect(renderedWidth).toBeLessThanOrEqual(800 - MIN_CANVAS_WIDTH)
      parent.remove()
    })

    it('closes an open docked panel when canvas crosses the cramped threshold', async () => {
      elementWidth.value = 1000
      const store = usePanelStore()
      store.dock()
      const parent = document.createElement('div')
      const container = document.createElement('div')
      parent.appendChild(container)
      document.body.appendChild(parent)

      wrapper = mount(PanelShell, {
        props: { title: 'Panel', containerRef: container },
        attachTo: parent,
      })
      await nextTick()
      expect(store.mode).toBe('docked')

      elementWidth.value = 400
      await nextTick()
      await nextTick()

      expect(store.mode).toBe('closed')
      expect(store.lastDesktopMode).toBe('docked')
      parent.remove()
    })

    it('observes containerRef.parentElement (stable container), not containerRef itself', async () => {
      // Structural test: verifies the fix is in place — PanelShell must pass
      // the parent element to useElementSize, not the canvas ref directly.
      // Without this, a flex-shrinking canvas creates a reactive feedback loop
      // (oscillation) as described in the cramped-oscillation bug.
      const store = usePanelStore()
      store.dock()
      const parent = document.createElement('div')
      const container = document.createElement('div')
      parent.appendChild(container)
      document.body.appendChild(parent)

      lastUseElementSizeTarget = undefined
      wrapper = mount(PanelShell, {
        props: { title: 'Panel', containerRef: container },
      })
      await nextTick()

      // Resolve the getter/ref that was passed to useElementSize and verify
      // it points to the parent element, not the container (canvas) element.
      const resolved = typeof lastUseElementSizeTarget === 'function'
        ? (lastUseElementSizeTarget as () => unknown)()
        : (lastUseElementSizeTarget as { value?: unknown } | null)?.value ?? lastUseElementSizeTarget
      expect(resolved).toBe(parent)
      expect(resolved).not.toBe(container)

      parent.remove()
    })
  })
})
