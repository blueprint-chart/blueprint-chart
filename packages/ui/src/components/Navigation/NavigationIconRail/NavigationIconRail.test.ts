import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import IconRail from './NavigationIconRail.vue'
import IconRailEntry from './NavigationIconRailEntry.vue'

const StubIcon = markRaw(defineComponent({ render: () => h('svg') }))

const items = [
  { value: 'type', icon: StubIcon, tooltip: 'Chart Type' },
  { value: 'text', icon: StubIcon, tooltip: 'Text' },
  { value: 'series', icon: StubIcon, tooltip: 'Series' },
]

describe('IconRail', () => {
  it('renders all items', () => {
    const wrapper = mount(IconRail, { props: { items, modelValue: 'type' } })
    expect(wrapper.findAll('.navigation-icon-rail__button')).toHaveLength(3)
  })

  it('applies active class to matching modelValue', () => {
    const wrapper = mount(IconRail, { props: { items, modelValue: 'text' } })
    const buttons = wrapper.findAll('.navigation-icon-rail__button')
    expect(buttons[0].classes()).not.toContain('navigation-icon-rail__button--active')
    expect(buttons[1].classes()).toContain('navigation-icon-rail__button--active')
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(IconRail, { props: { items, modelValue: 'type' } })
    await wrapper.findAll('.navigation-icon-rail__button')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['series'])
  })

  it('renders footer slot', () => {
    const wrapper = mount(IconRail, {
      props: { items, modelValue: 'type' },
      slots: { footer: '<span class="settings">⚙️</span>' },
    })
    expect(wrapper.find('.navigation-icon-rail__footer .settings').exists()).toBe(true)
  })
})

function mountIconRailWithSlots(modelValue: string) {
  return mount(IconRail, {
    props: { modelValue },
    slots: {
      default: () => [
        h(IconRailEntry, { value: 'type', icon: StubIcon, tooltip: 'Chart Type' }),
        h(IconRailEntry, { value: 'text', icon: StubIcon, tooltip: 'Text' }),
      ],
    },
  })
}

describe('IconRail slot entry rendering', () => {
  it('renders items from slot entries', async () => {
    const wrapper = mountIconRailWithSlots('type')
    await nextTick()
    expect(wrapper.findAll('.navigation-icon-rail__button')).toHaveLength(2)
  })

  it('applies active class from slot entries', async () => {
    const wrapper = mountIconRailWithSlots('text')
    await nextTick()
    const buttons = wrapper.findAll('.navigation-icon-rail__button')
    expect(buttons[0].classes()).not.toContain('navigation-icon-rail__button--active')
    expect(buttons[1].classes()).toContain('navigation-icon-rail__button--active')
  })
})

describe('IconRail slot entry interaction', () => {
  it('emits update:modelValue on slot entry click', async () => {
    const wrapper = mountIconRailWithSlots('type')
    await nextTick()
    await wrapper.findAll('.navigation-icon-rail__button')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['text'])
  })
})
