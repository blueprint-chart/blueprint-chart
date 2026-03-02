import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PanelTabBar from './PanelTabBar.vue'

const tabs = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Beta' },
  { key: 'c', label: 'Gamma' },
]

describe('PanelTabBar', () => {
  it('renders all tabs', () => {
    const w = mount(PanelTabBar, { props: { tabs, modelValue: 'a' } })
    const buttons = w.findAll('.panel-tab-bar__tab')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('Alpha')
    expect(buttons[1].text()).toBe('Beta')
    expect(buttons[2].text()).toBe('Gamma')
  })

  it('highlights active tab', () => {
    const w = mount(PanelTabBar, { props: { tabs, modelValue: 'b' } })
    const active = w.find('.panel-tab-bar__tab--active')
    expect(active.text()).toBe('Beta')
  })

  it('emits update:modelValue on click', async () => {
    const w = mount(PanelTabBar, { props: { tabs, modelValue: 'a' } })
    await w.findAll('.panel-tab-bar__tab')[2].trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([['c']])
  })

  it('adds sticky class when sticky prop is true', () => {
    const w = mount(PanelTabBar, { props: { tabs, modelValue: 'a', sticky: true } })
    expect(w.find('.panel-tab-bar--sticky').exists()).toBe(true)
  })

  it('does not add sticky class by default', () => {
    const w = mount(PanelTabBar, { props: { tabs, modelValue: 'a' } })
    expect(w.find('.panel-tab-bar--sticky').exists()).toBe(false)
  })
})
