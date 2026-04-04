import { mount } from '@vue/test-utils'
import PanelFloating from './PanelFloating.vue'

vi.mock('@blueprint-chart/ui', () => ({
  ButtonDrag: {
    template: '<button class="btn-drag"></button>',
  },
  ButtonDock: {
    template: '<button class="btn-dock" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
  ButtonClose: {
    template: '<button class="btn-close-stub" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
}))

vi.mock('@/composables/usePanelDrag', () => ({
  usePanelDrag: vi.fn(() => ({ isDragging: false })),
}))

describe('PanelFloating', () => {
  it('renders title from prop', () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Columns', position: { x: 10, y: 20 } },
    })
    expect(w.find('.panel-floating__header__title').text()).toContain('Columns')
  })

  it('renders slot content', () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 0, y: 0 } },
      slots: { default: '<div class="inner">Content</div>' },
    })
    expect(w.find('.inner').text()).toBe('Content')
  })

  it('renders tabs slot', () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 0, y: 0 } },
      slots: { tabs: '<div class="tab-slot">Tabs</div>' },
    })
    expect(w.find('.tab-slot').text()).toBe('Tabs')
  })

  it('applies position style', () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 100, y: 50 } },
    })
    const style = w.find('.panel-floating').attributes('style')
    expect(style).toContain('left: 100px')
    expect(style).toContain('top: 50px')
  })

  it('emits dock when dock button is clicked', async () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 0, y: 0 } },
    })
    await w.find('.btn-dock').trigger('click')
    expect(w.emitted('dock')).toHaveLength(1)
  })

  it('emits close when close button is clicked', async () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 0, y: 0 } },
    })
    await w.find('.btn-close-stub').trigger('click')
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('hides close button when showClose is false', () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 0, y: 0 }, showClose: false },
    })
    expect(w.find('.btn-close-stub').exists()).toBe(false)
  })

  it('shows close button by default', () => {
    const w = mount(PanelFloating, {
      props: { containerRef: null, title: 'Test', position: { x: 0, y: 0 } },
    })
    expect(w.find('.btn-close-stub').exists()).toBe(true)
  })
})
