import { mount } from '@vue/test-utils'
import CanvasViewPicker from './CanvasViewPicker.vue'

const viewMode = ref<string>('preview')
const canvasMode = ref<string>('blueprint')
const setViewMode = vi.fn((mode: string) => {
  viewMode.value = mode
})
const setCanvasMode = vi.fn((mode: string) => {
  canvasMode.value = mode
})
const isNarrowRef = ref(false)

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    viewMode,
    canvasMode,
    setViewMode,
    setCanvasMode,
    showDimensions: ref(true),
  }),
}))

// Keep NavigationToggle (and the rest of the library) real so the rendered
// segments are exercised; only override the breakpoint so the test controls
// narrow/wide.
vi.mock('@blueprint-chart/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@blueprint-chart/ui')>()),
  useBreakpoint: () => ({ isNarrow: isNarrowRef }),
}))

vi.mock('~icons/ph/ruler', () => ({
  default: { template: '<span class="icon-ruler" />' },
}))

vi.mock('~icons/ph/caret-down', () => ({
  default: { template: '<span class="icon-caret-down" />' },
}))

function segments(w: ReturnType<typeof mount>) {
  return w.findAll('.navigation-segmented-control__option')
}

beforeEach(() => {
  viewMode.value = 'preview'
  canvasMode.value = 'blueprint'
  setViewMode.mockClear()
  setCanvasMode.mockClear()
  isNarrowRef.value = false
})

describe('CanvasViewPicker', () => {
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

  // The panel is bigger than the old swatch list and holds layout switching,
  // so an accidental pointer pass must not open it.
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

describe('CanvasViewPicker layout section', () => {
  it('has no layout section without showLayout', async () => {
    const w = mount(CanvasViewPicker)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.navigation-segmented-control').exists()).toBe(false)
    expect(w.findAll('.canvas-view-picker__label').map(el => el.text())).toEqual(['Canvas'])
  })

  it('offers exactly Chart, Split and BPC on wide viewports', async () => {
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(segments(w).map(el => el.text().trim())).toEqual(['Chart', 'Split', 'BPC'])
  })

  it('labels both sections when layout is shown', async () => {
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.findAll('.canvas-view-picker__label').map(el => el.text())).toEqual(['Layout', 'Canvas'])
  })

  it('renders one distinct icon per layout segment', async () => {
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    const [chart, split, dsl] = segments(w)
    expect(chart.find('.icon-view-chart').exists()).toBe(true)
    expect(split.find('.icon-view-split').exists()).toBe(true)
    expect(dsl.find('.icon-view-dsl').exists()).toBe(true)
  })

  it('drops the Split segment on narrow viewports', async () => {
    isNarrowRef.value = true
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(segments(w).map(el => el.text().trim())).toEqual(['Chart', 'BPC'])
  })

  it('calls setViewMode and closes when a layout is picked', async () => {
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    const split = segments(w).find(el => el.text().trim() === 'Split')
    expect(split).toBeDefined()
    await split!.trigger('click')
    expect(setViewMode).toHaveBeenCalledWith('split')
    expect(w.find('.canvas-view-picker__panel').exists()).toBe(false)
  })

  it('shows the current layout icon on the trigger', () => {
    viewMode.value = 'dsl'
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    expect(w.find('.canvas-view-picker__trigger .icon-view-dsl').exists()).toBe(true)
  })

  it('renders no layout icon on the trigger without showLayout', () => {
    const w = mount(CanvasViewPicker)
    expect(w.find('.canvas-view-picker__trigger .icon-view-chart').exists()).toBe(false)
  })

  it('hides the canvas section and the trigger swatch in dsl mode', async () => {
    viewMode.value = 'dsl'
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    expect(w.find('.canvas-view-picker__trigger .canvas-mode-swatch').exists()).toBe(false)
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.findAll('.canvas-view-picker__label').map(el => el.text())).toEqual(['Layout'])
    expect(w.findAll('.canvas-mode-option').length).toBe(0)
    expect(w.find('.canvas-dimensions-toggle').exists()).toBe(false)
  })

  it('has no divider when only one section is shown', async () => {
    viewMode.value = 'dsl'
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.canvas-view-picker__divider').exists()).toBe(false)
  })

  it('divides the two sections when both are shown', async () => {
    const w = mount(CanvasViewPicker, { props: { showLayout: true } })
    await w.find('.canvas-view-picker__trigger').trigger('click')
    expect(w.find('.canvas-view-picker__divider').exists()).toBe(true)
  })
})
