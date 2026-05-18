import { mount } from '@vue/test-utils'
import PanelDocked from './PanelDocked.vue'

vi.mock('@blueprint-chart/ui', () => ({
  LayoutPanel: {
    template: '<div class="panel"><div class="title">{{ title }}</div><slot name="actions" /><slot /><div v-if="$slots.footer" class="panel-footer"><slot name="footer" /></div></div>',
    props: ['title'],
  },
  ButtonDetach: {
    template: '<button class="btn-detach" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
  ButtonClose: {
    template: '<button class="btn-close-stub" @click="$emit(\'click\')"></button>',
    emits: ['click'],
  },
}))

describe('PanelDocked', () => {
  it('renders title from prop', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Settings' } })
    expect(w.find('.title').text()).toBe('Settings')
  })

  it('renders slot content', () => {
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test' },
      slots: { default: '<div class="content">Hello</div>' },
    })
    expect(w.find('.content').text()).toBe('Hello')
  })

  it('adds collapsed class when collapsed prop is true', () => {
    const w = mount(PanelDocked, { props: { collapsed: true, title: 'Test' } })
    expect(w.find('.panel-docked--collapsed').exists()).toBe(true)
  })

  it('does not add collapsed class when collapsed prop is false', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test' } })
    expect(w.find('.panel-docked--collapsed').exists()).toBe(false)
  })

  it('emits float when detach button is clicked', async () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test' } })
    await w.find('.btn-detach').trigger('click')
    expect(w.emitted('float')).toHaveLength(1)
  })

  it('emits close when close button is clicked', async () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test' } })
    await w.find('.btn-close-stub').trigger('click')
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('renders resize handle', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test' } })
    expect(w.find('.panel-docked__resize-handle').exists()).toBe(true)
  })

  it('resize handle emits width updates on pointer drag', async () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test', modelValue: 330 } })
    const handle = w.find('.panel-docked__resize-handle')
    const el = handle.element as HTMLElement
    el.setPointerCapture = vi.fn()
    el.removeEventListener = vi.fn()
    await handle.trigger('pointerdown', { clientX: 500, pointerId: 1 })
    // Simulate drag left by 50px → width should increase by 50
    const move = new Event('pointermove') as Event & { clientX: number }
    move.clientX = 450
    el.dispatchEvent(move)
    el.dispatchEvent(new Event('pointerup'))
    const emitted = w.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![emitted!.length - 1][0]).toBe(380)
  })

  it('uses modelValue as initial width when provided', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test', modelValue: 400 } })
    const style = w.find('.panel-docked').attributes('style')
    expect(style).toContain('width: 400px')
  })

  it('uses initialWidth when modelValue is not provided', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test', initialWidth: 300 } })
    const style = w.find('.panel-docked').attributes('style')
    expect(style).toContain('width: 300px')
  })

  it('syncs width when modelValue prop changes', async () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test', modelValue: 340 } })
    expect(w.find('.panel-docked').attributes('style')).toContain('width: 340px')
    await w.setProps({ modelValue: 420 })
    expect(w.find('.panel-docked').attributes('style')).toContain('width: 420px')
  })

  it('renders footer slot content', () => {
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test' },
      slots: { footer: '<button>Next</button>' },
    })
    expect(w.find('.panel-footer').exists()).toBe(true)
    expect(w.find('.panel-footer button').text()).toBe('Next')
  })

  it('hides footer when no footer slot is provided', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test' } })
    expect(w.find('.panel-footer').exists()).toBe(false)
  })

  it('hides close button when showClose is false', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test', showClose: false } })
    expect(w.find('.btn-close-stub').exists()).toBe(false)
  })

  it('shows close button by default', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test' } })
    expect(w.find('.btn-close-stub').exists()).toBe(true)
  })

  it('shows close button when showClose is true', () => {
    const w = mount(PanelDocked, { props: { collapsed: false, title: 'Test', showClose: true } })
    expect(w.find('.btn-close-stub').exists()).toBe(true)
  })

  it('clamps rendered width when canvasWidth would leave less than min canvas', () => {
    // stored = 500, canvas = 700, minCanvas = 320 → effective = 700 - 320 = 380
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test', modelValue: 500, canvasWidth: 700 },
    })
    const style = w.find('.panel-docked').attributes('style')
    expect(style).toContain('width: 380px')
  })

  it('uses stored width unchanged when canvas has plenty of room', () => {
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test', modelValue: 400, canvasWidth: 2000 },
    })
    const style = w.find('.panel-docked').attributes('style')
    expect(style).toContain('width: 400px')
  })

  it('does not mutate modelValue when canvasWidth would clamp the display', async () => {
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test', modelValue: 500, canvasWidth: 700 },
    })
    await nextTick()
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('clamps the resize handle drag ceiling to canvas-aware max', async () => {
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test', modelValue: 300, canvasWidth: 800 },
    })
    const handle = w.find('.panel-docked__resize-handle')
    const el = handle.element as HTMLElement
    el.setPointerCapture = vi.fn()
    el.removeEventListener = vi.fn()
    await handle.trigger('pointerdown', { clientX: 500, pointerId: 1 })
    // Drag left by 1000px — would request width=1300 if unclamped.
    // Effective max = min(660, 800 - 320) = 480
    const move = new Event('pointermove') as Event & { clientX: number }
    move.clientX = -500
    el.dispatchEvent(move)
    el.dispatchEvent(new Event('pointerup'))
    const emitted = w.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![emitted!.length - 1][0]).toBe(480)
  })

  it('uses static MAX_WIDTH when canvasWidth is undefined (back-compat)', async () => {
    const w = mount(PanelDocked, {
      props: { collapsed: false, title: 'Test', modelValue: 300 },
    })
    const handle = w.find('.panel-docked__resize-handle')
    const el = handle.element as HTMLElement
    el.setPointerCapture = vi.fn()
    el.removeEventListener = vi.fn()
    await handle.trigger('pointerdown', { clientX: 500, pointerId: 1 })
    const move = new Event('pointermove') as Event & { clientX: number }
    move.clientX = -500 // Request 1300 → clamped to 660 (MAX_WIDTH).
    el.dispatchEvent(move)
    el.dispatchEvent(new Event('pointerup'))
    const emitted = w.emitted('update:modelValue')
    expect(emitted![emitted!.length - 1][0]).toBe(660)
  })
})
