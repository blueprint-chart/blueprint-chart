import { mount } from '@vue/test-utils'
import PanelIconRail from './PanelIconRail.vue'
import { usePanelStore } from '@/stores/panel'

vi.mock('@blueprint-chart/ui', () => ({
  NavigationIconRail: {
    name: 'NavigationIconRail',
    template: '<div class="icon-rail"><button v-for="i in items" :key="i.value" class="rail-item" :data-value="i.value" @click="$emit(\'update:modelValue\', i.value)" /><slot name="footer" /></div>',
    props: ['modelValue', 'items', 'horizontal'],
    emits: ['update:modelValue'],
  },
  ButtonIcon: {
    template: '<button class="btn-toggle" @click="$emit(\'click\')">{{ label }}</button>',
    props: ['iconLeft', 'label', 'hideLabel', 'square', 'variant', 'size'],
    emits: ['click'],
  },
}))

const StubIcon = markRaw({ template: '<span />' })

const items = [
  { value: 'a', icon: StubIcon, tooltip: 'Alpha' },
  { value: 'b', icon: StubIcon, tooltip: 'Beta' },
]

describe('PanelIconRail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders toggle button with correct label when docked', () => {
    usePanelStore().$patch({ mode: 'docked' })
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', items },
    })
    expect(w.find('.btn-toggle').text()).toBe('Close panel')
  })

  it('renders toggle button with correct label when closed', () => {
    usePanelStore().$patch({ mode: 'closed' })
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', items },
    })
    expect(w.find('.btn-toggle').text()).toBe('Open panel')
  })

  it('hides toggle button when horizontal', () => {
    usePanelStore().$patch({ mode: 'docked' })
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', items, horizontal: true },
    })
    expect(w.find('.btn-toggle').exists()).toBe(false)
  })

  it('emits toggle-mode when toggle button is clicked', async () => {
    usePanelStore().$patch({ mode: 'docked' })
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', items },
    })
    await w.find('.btn-toggle').trigger('click')
    expect(w.emitted('toggle-mode')).toHaveLength(1)
  })

  it('opens the panel and emits select when clicked while closed', async () => {
    const store = usePanelStore()
    store.$patch({ mode: 'closed', lastDesktopMode: 'docked' })
    const w = mount(PanelIconRail, {
      props: { activeTab: '', items },
    })
    await w.find('.rail-item[data-value="b"]').trigger('click')
    expect(store.mode).toBe('docked')
    expect(w.emitted('select')).toEqual([['b']])
  })

  it('does not change mode when clicking while panel is already open', async () => {
    const store = usePanelStore()
    store.$patch({ mode: 'docked', lastDesktopMode: 'docked' })
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', items },
    })
    await w.find('.rail-item[data-value="b"]').trigger('click')
    expect(store.mode).toBe('docked')
    expect(w.emitted('select')).toEqual([['b']])
  })
})
