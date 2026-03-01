import { mount } from '@vue/test-utils'
import PillBase from './NavigationPillBase.vue'

const items = [
  { key: 'upload', text: 'Upload', active: false },
  { key: 'check', text: 'Check', active: true },
  { key: 'edit', text: 'Edit', active: false },
  { key: 'export', text: 'Export', active: false },
]

describe('NavigationPillBase', () => {
  it('renders all item buttons from props', () => {
    const wrapper = mount(PillBase, { props: { items } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons).toHaveLength(4)
    expect(buttons[0].text()).toBe('Upload')
    expect(buttons[1].text()).toBe('Check')
    expect(buttons[2].text()).toBe('Edit')
    expect(buttons[3].text()).toBe('Export')
  })

  it('applies active class to active item', () => {
    const wrapper = mount(PillBase, { props: { items } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[0].classes()).not.toContain('navigation-pill__option--active')
    expect(buttons[1].classes()).toContain('navigation-pill__option--active')
  })

  it('applies disabled class and attribute to disabled items', () => {
    const disabledItems = items.map((item, i) =>
      i === 2 ? { ...item, disabled: true } : item,
    )
    const wrapper = mount(PillBase, { props: { items: disabledItems } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[2].classes()).toContain('navigation-pill__option--disabled')
    expect(buttons[2].attributes('disabled')).toBeDefined()
  })

  it('applies done class to done items', () => {
    const doneItems = items.map((item, i) =>
      i === 0 ? { ...item, done: true } : item,
    )
    const wrapper = mount(PillBase, { props: { items: doneItems } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[0].classes()).toContain('navigation-pill__option--done')
  })

  it('emits select with key on button click', async () => {
    const wrapper = mount(PillBase, { props: { items } })
    await wrapper.findAll('.navigation-pill__option')[2].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['edit']])
  })

  it('does not emit select when clicking disabled item', async () => {
    const disabledItems = items.map((item, i) =>
      i === 2 ? { ...item, disabled: true } : item,
    )
    const wrapper = mount(PillBase, { props: { items: disabledItems } })
    await wrapper.findAll('.navigation-pill__option')[2].trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('contains a bubble element', () => {
    const wrapper = mount(PillBase, { props: { items } })
    expect(wrapper.find('.navigation-pill__bubble').exists()).toBe(true)
  })

  it('sets aria-current="step" on active item', () => {
    const wrapper = mount(PillBase, { props: { items } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[0].attributes('aria-current')).toBeUndefined()
    expect(buttons[1].attributes('aria-current')).toBe('step')
  })
})
