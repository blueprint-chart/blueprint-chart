import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
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

describe('CanvasModePicker', () => {
  beforeEach(() => {
    canvasMode.value = 'blueprint'
    setCanvasMode.mockClear()
  })

  it('shows collapsed trigger by default', () => {
    const w = mount(CanvasModePicker)
    expect(w.find('.canvas-mode-picker__trigger').exists()).toBe(true)
    expect(w.findAll('.canvas-mode-picker-option').length).toBe(0)
  })

  it('shows swatch for current mode when collapsed', () => {
    canvasMode.value = 'dark'
    const w = mount(CanvasModePicker)
    expect(w.find('.canvas-mode-swatch--dark').exists()).toBe(true)
  })

  it('expands on mouseenter showing all 4 options', async () => {
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker').trigger('mouseenter')
    expect(w.findAll('.canvas-mode-picker-option').length).toBe(4)
    expect(w.find('.canvas-mode-picker__trigger').exists()).toBe(false)
  })

  it('collapses on mouseleave', async () => {
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker').trigger('mouseenter')
    expect(w.findAll('.canvas-mode-picker-option').length).toBe(4)
    await w.find('.canvas-mode-picker').trigger('mouseleave')
    expect(w.find('.canvas-mode-picker__trigger').exists()).toBe(true)
  })

  it('calls setCanvasMode and collapses on option select', async () => {
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker').trigger('mouseenter')
    const options = w.findAll('.canvas-mode-picker-option')
    // Click "Light" (index 2)
    await options[2].trigger('click')
    expect(setCanvasMode).toHaveBeenCalledWith('light')
    // Should collapse after selection
    expect(w.find('.canvas-mode-picker__trigger').exists()).toBe(true)
  })

  it('shows dimensions toggle when expanded', async () => {
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker').trigger('mouseenter')
    expect(w.find('.canvas-dimensions-toggle').exists()).toBe(true)
  })

  it('shows divider when expanded', async () => {
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker').trigger('mouseenter')
    expect(w.find('.canvas-mode-picker__divider').exists()).toBe(true)
  })

  it('marks the active mode option', async () => {
    canvasMode.value = 'auto'
    const w = mount(CanvasModePicker)
    await w.find('.canvas-mode-picker').trigger('mouseenter')
    const active = w.find('.canvas-mode-picker-option--active')
    expect(active.exists()).toBe(true)
    expect(active.attributes('title')).toBe('Auto')
  })
})
