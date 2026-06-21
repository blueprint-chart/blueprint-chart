import { mount } from '@vue/test-utils'
import NavigationSegmentedControl from './NavigationSegmentedControl.vue'

const items = [
  { key: 'grid', text: 'Grid', active: true },
  { key: 'list', text: 'List', active: false },
]

describe('NavigationSegmentedControl', () => {
  it('renders all item buttons from props', () => {
    const wrapper = mount(NavigationSegmentedControl, { props: { items } })
    const buttons = wrapper.findAll('.navigation-segmented-control__option')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Grid')
    expect(buttons[1].text()).toBe('List')
  })

  it('applies active modifier class to active item', () => {
    const wrapper = mount(NavigationSegmentedControl, { props: { items } })
    const buttons = wrapper.findAll('.navigation-segmented-control__option')
    expect(buttons[0].classes()).toContain('navigation-segmented-control__option--active')
    expect(buttons[1].classes()).not.toContain('navigation-segmented-control__option--active')
  })

  it('applies disabled class and attribute when disabled', () => {
    const disabled = [items[0], { ...items[1], disabled: true }]
    const wrapper = mount(NavigationSegmentedControl, { props: { items: disabled } })
    const buttons = wrapper.findAll('.navigation-segmented-control__option')
    expect(buttons[1].classes()).toContain('navigation-segmented-control__option--disabled')
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('emits select with key on click', async () => {
    const wrapper = mount(NavigationSegmentedControl, { props: { items } })
    await wrapper.findAll('.navigation-segmented-control__option')[1].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['list']])
  })

  it('does not emit select when clicking a disabled item', async () => {
    const disabled = [items[0], { ...items[1], disabled: true }]
    const wrapper = mount(NavigationSegmentedControl, { props: { items: disabled } })
    await wrapper.findAll('.navigation-segmented-control__option')[1].trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('sets aria-current="true" on the active item', () => {
    const wrapper = mount(NavigationSegmentedControl, { props: { items } })
    const buttons = wrapper.findAll('.navigation-segmented-control__option')
    expect(buttons[0].attributes('aria-current')).toBe('true')
    expect(buttons[1].attributes('aria-current')).toBeUndefined()
  })

  it('applies size modifier class', () => {
    const wrapper = mount(NavigationSegmentedControl, { props: { items, size: 'sm' } })
    expect(wrapper.find('.navigation-segmented-control').classes())
      .toContain('navigation-segmented-control--sm')
  })

  it('applies icon-only modifier class when iconOnly is set', () => {
    const wrapper = mount(NavigationSegmentedControl, { props: { items, iconOnly: true } })
    expect(wrapper.find('.navigation-segmented-control').classes())
      .toContain('navigation-segmented-control--icon-only')
  })

  it('renders the per-item title as a tooltip on the option', () => {
    const titled = [{ key: 'grid', text: 'Grid', title: 'Grid view', active: true }]
    const wrapper = mount(NavigationSegmentedControl, { props: { items: titled } })
    expect(wrapper.find('.navigation-segmented-control__option').attributes('title')).toBe('Grid view')
  })
})
