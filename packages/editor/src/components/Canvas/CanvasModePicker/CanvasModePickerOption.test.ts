import { mount } from '@vue/test-utils'
import CanvasModePickerOption from './CanvasModePickerOption.vue'

describe('CanvasModePickerOption', () => {
  function mountOption(props: { mode: 'blueprint' | 'auto' | 'light' | 'dark', label: string, active: boolean }) {
    return mount(CanvasModePickerOption, { props })
  }

  it('renders label text', () => {
    const w = mountOption({ mode: 'light', label: 'Light', active: false })
    expect(w.find('.canvas-mode-picker-option__label').text()).toBe('Light')
  })

  it('renders swatch subcomponent', () => {
    const w = mountOption({ mode: 'dark', label: 'Dark', active: false })
    expect(w.find('.canvas-mode-swatch--dark').exists()).toBe(true)
  })

  it('applies active class when active', () => {
    const w = mountOption({ mode: 'blueprint', label: 'Blueprint', active: true })
    expect(w.find('.canvas-mode-picker-option--active').exists()).toBe(true)
  })

  it('does not apply active class when inactive', () => {
    const w = mountOption({ mode: 'blueprint', label: 'Blueprint', active: false })
    expect(w.find('.canvas-mode-picker-option--active').exists()).toBe(false)
  })

  it('emits select on click', async () => {
    const w = mountOption({ mode: 'auto', label: 'Auto', active: false })
    await w.find('button').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })

  it('sets title attribute from label', () => {
    const w = mountOption({ mode: 'light', label: 'Light', active: false })
    expect(w.find('button').attributes('title')).toBe('Light')
  })
})
