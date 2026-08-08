import { mount } from '@vue/test-utils'
import CanvasViewPicker from './CanvasViewPicker.vue'

const canvasMode = ref<string>('blueprint')
const setCanvasMode = vi.fn((mode: string) => {
  canvasMode.value = mode
})

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    canvasMode,
    setCanvasMode,
    showDimensions: ref(true),
  }),
}))

vi.mock('~icons/ph/ruler', () => ({
  default: { template: '<span class="icon-ruler" />' },
}))

vi.mock('~icons/ph/caret-down', () => ({
  default: { template: '<span class="icon-caret-down" />' },
}))

describe('CanvasViewPicker', () => {
  beforeEach(() => {
    canvasMode.value = 'blueprint'
    setCanvasMode.mockClear()
  })

  it('renders the trigger with the current canvas swatch and no panel', () => {
    canvasMode.value = 'dark'
    const w = mount(CanvasViewPicker)
    expect(w.find('.canvas-view-picker__trigger').exists()).toBe(true)
    expect(w.find('.canvas-mode-swatch--dark').exists()).toBe(true)
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
  })

  it('opens the panel on trigger click', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(true)
    expect(w.findAll('.canvas-mode-option').length).toBe(4)
  })

  it('closes the panel on a second trigger click', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
  })

  // The panel is bigger than the old swatch list and (from Task 3) holds layout
  // switching, so an accidental pointer pass must not open it.
  it('does not open on hover', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker').trigger('mouseenter')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
  })

  it('keeps the trigger mounted while the panel is open', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.canvas-view-picker__trigger').exists()).toBe(true)
  })

  it('reflects the open state on the trigger for assistive tech', async () => {
    const w = mount(CanvasViewPicker)
    const trigger = w.find('.canvas-view-picker__trigger')
    expect(trigger.attributes('aria-label')).toBe('View options')
    expect(trigger.attributes('aria-haspopup')).toBe('true')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(w.find('.canvas-view-picker__trigger').attributes('aria-expanded')).toBe('true')
  })

  it('closes on Escape', async () => {
    const w = mount(CanvasViewPicker, { attachTo: document.body })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
    w.unmount()
  })

  it('closes on an outside mousedown', async () => {
    const w = mount(CanvasViewPicker, { attachTo: document.body })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
    w.unmount()
  })

  it('stays open on a mousedown inside the panel', async () => {
    const w = mount(CanvasViewPicker, { attachTo: document.body })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    await w.find('.canvas-view-picker__panel').trigger('mousedown')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(true)
    w.unmount()
  })

  it('calls setCanvasMode and closes when a canvas mode is picked', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    // Options are Blueprint, Auto, Light, Dark - click "Light".
    await w.findAll('.canvas-mode-option')[2].trigger('click')
    expect(setCanvasMode).toHaveBeenCalledWith('light')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
  })

  it('marks the active mode option', async () => {
    canvasMode.value = 'auto'
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    const active = w.find('.canvas-mode-option--active')
    expect(active.exists()).toBe(true)
    expect(active.attributes('title')).toBe('Auto')
  })

  it('labels the canvas section and shows the Dims toggle', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.canvas-view-picker__label').text()).toBe('Canvas')
    expect(w.find('.canvas-dimensions-toggle').exists()).toBe(true)
    expect(w.find('.canvas-view-picker__dims').text()).toContain('Dims')
  })

  it('keeps the panel open when Dims is toggled', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    await w.find('.canvas-dimensions-toggle').trigger('click')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(true)
  })
})
