import { mount } from '@vue/test-utils'
import CanvasModeSwatch from './CanvasModeSwatch.vue'

describe('CanvasModeSwatch', () => {
  it('renders a span with the mode class', () => {
    const w = mount(CanvasModeSwatch, { props: { mode: 'auto' } })
    const span = w.find('.canvas-mode-swatch')
    expect(span.exists()).toBe(true)
    expect(span.classes()).toContain('canvas-mode-swatch--auto')
  })

  it.each(['auto', 'light', 'dark'] as const)('applies correct class for %s mode', (mode) => {
    const w = mount(CanvasModeSwatch, { props: { mode } })
    expect(w.find(`.canvas-mode-swatch--${mode}`).exists()).toBe(true)
  })
})
