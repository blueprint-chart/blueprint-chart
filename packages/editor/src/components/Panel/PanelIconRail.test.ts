import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import PanelIconRail from './PanelIconRail.vue'

vi.mock('@blueprint-chart/ui', () => ({
  NavigationIconRail: {
    template: '<div class="icon-rail"><slot name="footer" /></div>',
    props: ['modelValue', 'items', 'horizontal'],
    emits: ['update:modelValue'],
  },
  ButtonIcon: {
    template: '<button class="btn-toggle" @click="$emit(\'click\')">{{ label }}</button>',
    props: ['iconLeft', 'label', 'hideLabel', 'square', 'variant', 'size'],
    emits: ['click'],
  },
}))

const StubIcon = markRaw({ template: '<span />' })

const items = [
  { value: 'a', icon: StubIcon, tooltip: 'Alpha' },
  { value: 'b', icon: StubIcon, tooltip: 'Beta' },
]

describe('PanelIconRail', () => {
  it('renders toggle button with correct label when docked', () => {
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', panelMode: 'docked', items },
    })
    expect(w.find('.btn-toggle').text()).toBe('Detach panel')
  })

  it('renders toggle button with correct label when floating', () => {
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', panelMode: 'floating', items },
    })
    expect(w.find('.btn-toggle').text()).toBe('Dock panel')
  })

  it('renders toggle button with correct label when collapsed', () => {
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', panelMode: 'collapsed', items },
    })
    expect(w.find('.btn-toggle').text()).toBe('Open panel')
  })

  it('hides toggle button when horizontal', () => {
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', panelMode: 'docked', items, horizontal: true },
    })
    expect(w.find('.btn-toggle').exists()).toBe(false)
  })

  it('emits toggle-mode when toggle button is clicked', async () => {
    const w = mount(PanelIconRail, {
      props: { activeTab: 'a', panelMode: 'docked', items },
    })
    await w.find('.btn-toggle').trigger('click')
    expect(w.emitted('toggle-mode')).toHaveLength(1)
  })
})
