import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormControlToggleSwitch from './FormControlToggleSwitch.vue'

describe('FormControlToggleSwitch', () => {
  it('renders label text', () => {
    const wrapper = mount(FormControlToggleSwitch, { props: { modelValue: false, label: 'Compact' } })
    expect(wrapper.text()).toContain('Compact')
  })

  it('checkbox is unchecked when modelValue is false', () => {
    const wrapper = mount(FormControlToggleSwitch, { props: { modelValue: false, label: 'Test' } })
    const input = wrapper.find('input[type="checkbox"]')
    expect((input.element as HTMLInputElement).checked).toBe(false)
  })

  it('checkbox is checked when modelValue is true', () => {
    const wrapper = mount(FormControlToggleSwitch, { props: { modelValue: true, label: 'Test' } })
    const input = wrapper.find('input[type="checkbox"]')
    expect((input.element as HTMLInputElement).checked).toBe(true)
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(FormControlToggleSwitch, { props: { modelValue: false, label: 'Test' } })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})
