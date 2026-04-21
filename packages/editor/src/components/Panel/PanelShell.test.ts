import { mount } from '@vue/test-utils'
import PanelShell from './PanelShell.vue'
import { usePanelStore } from '@/stores/panel'

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
  ButtonDetach: {
    template: '<button class="btn-detach" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
  ButtonDock: {
    template: '<button class="btn-dock" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
  ButtonDrag: {
    template: '<button class="btn-drag" />',
  },
  ButtonClose: {
    template: '<button class="btn-close-stub" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
}))

vi.mock('@/composables/usePanelDrag', () => ({
  usePanelDrag: vi.fn(() => ({ isDragging: false })),
}))

describe('PanelShell', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('mode === "closed"', () => {
    it('renders nothing when mode is closed', () => {
      const panel = usePanelStore()
      panel.close()
      const w = mount(PanelShell, { props: { title: 'Test' } })
      expect(w.find('.panel-docked').exists()).toBe(false)
      expect(w.find('.panel-floating').exists()).toBe(false)
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

    it('clicking detach calls panel.float()', async () => {
      const panel = usePanelStore()
      panel.dock()
      const w = mount(PanelShell, { props: { title: 'Test' } })
      await w.find('.btn-detach').trigger('click')
      expect(panel.mode).toBe('floating')
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

  describe('mode === "floating"', () => {
    it('renders PanelFloating when containerRef is provided', () => {
      const panel = usePanelStore()
      panel.float()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const w = mount(PanelShell, {
        props: { title: 'Floating', containerRef: container },
        attachTo: document.body,
      })
      expect(container.querySelector('.panel-floating')).toBeTruthy()
      w.unmount()
      container.remove()
    })

    it('does not render anything when containerRef is missing', () => {
      const panel = usePanelStore()
      panel.float()
      const w = mount(PanelShell, { props: { title: 'Floating', containerRef: null } })
      expect(w.find('.panel-floating').exists()).toBe(false)
    })

    it('clicking dock button calls panel.dock()', async () => {
      const panel = usePanelStore()
      panel.float()
      const container = document.createElement('div')
      document.body.appendChild(container)
      mount(PanelShell, {
        props: { title: 'Floating', containerRef: container },
        attachTo: document.body,
      })
      const dockBtn = container.querySelector('.btn-dock') as HTMLElement | null
      dockBtn?.click()
      expect(panel.mode).toBe('docked')
      container.remove()
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
})
