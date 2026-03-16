import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import CanvasDimensionsToggle from './CanvasDimensionsToggle.vue'

const showDimensions = ref(true)

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    showDimensions,
  }),
}))

vi.mock('~icons/ph/ruler', () => ({
  default: { template: '<span class="icon-ruler" />' },
}))

describe('CanvasDimensionsToggle', () => {
  beforeEach(() => {
    showDimensions.value = true
  })

  it('renders with active class when showDimensions is true', () => {
    const w = mount(CanvasDimensionsToggle)
    expect(w.find('.canvas-dimensions-toggle--active').exists()).toBe(true)
  })

  it('renders without active class when showDimensions is false', () => {
    showDimensions.value = false
    const w = mount(CanvasDimensionsToggle)
    expect(w.find('.canvas-dimensions-toggle--active').exists()).toBe(false)
  })

  it('toggles showDimensions on click', async () => {
    const w = mount(CanvasDimensionsToggle)
    expect(showDimensions.value).toBe(true)
    await w.find('button').trigger('click')
    expect(showDimensions.value).toBe(false)
    await w.find('button').trigger('click')
    expect(showDimensions.value).toBe(true)
  })

  it('has the correct title attribute', () => {
    const w = mount(CanvasDimensionsToggle)
    expect(w.find('button').attributes('title')).toBe('Show dimensions')
  })
})
