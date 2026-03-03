import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CanvasModePickerOptionSwatch from './CanvasModePickerOptionSwatch.vue'

describe('CanvasModePickerOptionSwatch', () => {
  it('renders a span with the mode class', () => {
    const w = mount(CanvasModePickerOptionSwatch, { props: { mode: 'blueprint' } })
    const span = w.find('.canvas-mode-swatch')
    expect(span.exists()).toBe(true)
    expect(span.classes()).toContain('canvas-mode-swatch--blueprint')
  })

  it.each(['blueprint', 'auto', 'light', 'dark'] as const)('applies correct class for %s mode', (mode) => {
    const w = mount(CanvasModePickerOptionSwatch, { props: { mode } })
    expect(w.find(`.canvas-mode-swatch--${mode}`).exists()).toBe(true)
  })
})
