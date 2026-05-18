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

const resizeCallbacks: Array<() => void> = []
vi.mock('@vueuse/core', () => ({
  useResizeObserver: vi.fn((_target: unknown, cb: () => void) => {
    resizeCallbacks.push(cb)
  }),
}))

function createSizedContainer(width: number, height: number) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: width })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: height })
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  resizeCallbacks.length = 0
})

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

  it('clamps an out-of-bounds position back inside the container on mount', () => {
    // Stale position from a previously larger container — simulates float →
    // dock → window shrink → float-again, where the saved position now sits
    // outside the (now smaller) container.
    const container = createSizedContainer(800, 600)
    const position = { x: 5000, y: 5000 }
    mount(PanelFloating, {
      props: { containerRef: container, title: 'Test', position },
    })
    // Panel falls back to 340x400 in jsdom (offsetWidth/Height are 0). With
    // 16px margin: maxX = 800-340-16 = 444, maxY = 600-400-16 = 184.
    expect(position.x).toBe(444)
    expect(position.y).toBe(184)
    container.remove()
  })

  it('re-clamps position when the container resizes', () => {
    const container = createSizedContainer(800, 600)
    const position = { x: 400, y: 150 }
    mount(PanelFloating, {
      props: { containerRef: container, title: 'Test', position },
    })
    // In-bounds at 800x600 — no change on mount.
    expect(position.x).toBe(400)
    expect(position.y).toBe(150)

    // Shrink the container and fire the ResizeObserver callback.
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 })
    resizeCallbacks.forEach(cb => cb())

    // maxX = 500-340-16 = 144, maxY = 500-400-16 = 84.
    expect(position.x).toBe(144)
    expect(position.y).toBe(84)
    container.remove()
  })

  it('does not apply an inline max-width that would override the CSS clamp', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const w = mount(PanelFloating, {
      props: {
        containerRef: container,
        title: 'Test',
        position: { x: 100, y: 100 },
      },
      attachTo: container,
    })
    const el = w.find('.panel-floating').element as HTMLElement
    // The scoped stylesheet sets max-width via SCSS; here we just guard that
    // no inline style is overriding it. The CSS rule itself is covered via
    // visual/manual QA — jsdom does not resolve calc() against parent bounds.
    expect(el.style.maxWidth).toBe('')
    w.unmount()
    container.remove()
  })
})
