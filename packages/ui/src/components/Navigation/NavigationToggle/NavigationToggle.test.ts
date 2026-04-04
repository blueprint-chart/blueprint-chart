import { mount } from '@vue/test-utils'
import Toggle from './NavigationToggle.vue'
import ToggleOption from './NavigationToggleOption.vue'

const options = [
  { value: 'preview', text: 'Preview' },
  { value: 'dsl', text: 'DSL' },
]

describe('NavigationToggle props', () => {
  it('renders all option buttons from props', () => {
    const wrapper = mount(Toggle, { props: { modelValue: 'preview', options } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Preview')
    expect(buttons[1].text()).toBe('DSL')
  })

  it('applies active class to selected option', () => {
    const wrapper = mount(Toggle, { props: { modelValue: 'dsl', options } })
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[0].classes()).not.toContain('navigation-pill__option--active')
    expect(buttons[1].classes()).toContain('navigation-pill__option--active')
  })

  it('emits update:modelValue on button click', async () => {
    const wrapper = mount(Toggle, { props: { modelValue: 'preview', options } })
    await wrapper.findAll('.navigation-pill__option')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['dsl']])
  })

  it('contains a bubble element', () => {
    const wrapper = mount(Toggle, { props: { modelValue: 'preview', options } })
    expect(wrapper.find('.navigation-pill__bubble').exists()).toBe(true)
  })
})

function mountWithSlots(modelValue: string) {
  return mount(Toggle, {
    props: { modelValue },
    slots: {
      default: () => [
        h(ToggleOption, { value: 'preview', text: 'Preview' }),
        h(ToggleOption, { value: 'dsl', text: 'DSL' }),
      ],
    },
  })
}

describe('NavigationToggle slots', () => {
  it('renders buttons from NavigationToggleOption slots', async () => {
    const wrapper = mountWithSlots('preview')
    await nextTick()
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Preview')
    expect(buttons[1].text()).toBe('DSL')
  })

  it('applies active class to selected slot entry', async () => {
    const wrapper = mountWithSlots('dsl')
    await nextTick()
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[1].classes()).toContain('navigation-pill__option--active')
  })

  it('emits update:modelValue on slot entry click', async () => {
    const wrapper = mountWithSlots('preview')
    await nextTick()
    await wrapper.findAll('.navigation-pill__option')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['dsl']])
  })

  it('prefers slot entries over options prop', async () => {
    const wrapper = mount(Toggle, {
      props: { modelValue: 'a', options: [{ value: 'a', text: 'PropA' }, { value: 'b', text: 'PropB' }] },
      slots: {
        default: () => [
          h(ToggleOption, { value: 'x', text: 'SlotX' }),
          h(ToggleOption, { value: 'y', text: 'SlotY' }),
        ],
      },
    })
    await nextTick()
    const buttons = wrapper.findAll('.navigation-pill__option')
    expect(buttons[0].text()).toBe('SlotX')
    expect(buttons[1].text()).toBe('SlotY')
  })
})
