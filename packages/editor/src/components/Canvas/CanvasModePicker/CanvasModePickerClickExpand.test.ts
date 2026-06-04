import { mount } from '@vue/test-utils'
import CanvasModePicker from './CanvasModePicker.vue'

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

// Regression for FINDING-005: the picker expanded only on mouseenter, which
// never fires for touch or keyboard users — the trigger looked like a button
// but click did nothing.
describe('CanvasModePicker click expansion', () => {
  beforeEach(() => {
    canvasMode.value = 'blueprint'
    setCanvasMode.mockClear()
  })

  it('expands on trigger click (touch/keyboard path)', async () => {
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker__trigger').trigger('click')
    expect(w.findAll('.canvas-mode-picker-option').length).toBeGreaterThan(0)
    expect(w.find('.canvas-mode-picker__trigger').exists()).toBe(false)
  })

  it('labels the trigger for assistive tech', () => {
    const w = mount(CanvasModePicker)
    const trigger = w.find('.canvas-mode-picker__trigger')
    expect(trigger.attributes('aria-label')).toBe('Canvas mode')
    expect(trigger.attributes('aria-haspopup')).toBe('true')
  })
})
