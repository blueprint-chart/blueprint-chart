import { mount } from '@vue/test-utils'
import FormControlButtonGroup from './FormControlButtonGroup.vue'
import FormControlButtonGroupEntry from './FormControlButtonGroupEntry.vue'

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const options = [
  { value: 'left', text: 'Left' },
  { value: 'center', text: 'Center' },
  { value: 'right', text: 'Right' },
]

describe('FormControlButtonGroup rendering', () => {
  it('renders all option buttons', () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: { modelValue: 'left', label: 'Align', options },
    })
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    expect(buttons).toHaveLength(3)
  })

  it('applies primary variant to selected option', () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: { modelValue: 'center', label: 'Align', options },
    })
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    expect(buttons[1].classes()).toContain('btn-primary')
    expect(buttons[0].classes()).toContain('btn-outline-primary')
  })

  it('emits update:modelValue on button click', async () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: { modelValue: 'left', label: 'Align', options },
    })
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['right'])
  })
})

describe('FormControlButtonGroup block modifier', () => {
  it('applies block modifier classes when block prop is true', () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: { modelValue: 'left', label: 'Align', options, block: true },
    })
    expect(wrapper.find('.form-control-button-group__container--block').exists()).toBe(true)
    expect(wrapper.find('.form-control-button-group__container__buttons--block').exists()).toBe(true)
  })

  it('does not apply block modifier by default', () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: { modelValue: 'left', label: 'Align', options },
    })
    expect(wrapper.find('.form-control-button-group__container--block').exists()).toBe(false)
    expect(wrapper.find('.form-control-button-group__container__buttons--block').exists()).toBe(false)
  })

  it('renders section slot for selected value', () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: { modelValue: 'left', label: 'Align', options },
      slots: { 'section:left': '<div class="test-section">Section content</div>' },
    })
    expect(wrapper.find('.test-section').text()).toBe('Section content')
  })
})

function mountButtonGroupWithSlots(modelValue: string) {
  return mount(FormControlButtonGroup, {
    props: { modelValue, label: 'Align' },
    slots: {
      default: () => [
        h(FormControlButtonGroupEntry, { value: 'left', text: 'Left' }),
        h(FormControlButtonGroupEntry, { value: 'center', text: 'Center' }),
        h(FormControlButtonGroupEntry, { value: 'right', text: 'Right' }),
      ],
    },
  })
}

describe('FormControlButtonGroup slot entry rendering', () => {
  it('renders buttons from slot entries', async () => {
    const wrapper = mountButtonGroupWithSlots('left')
    await nextTick()
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    expect(buttons).toHaveLength(3)
  })

  it('applies primary variant to selected slot entry', async () => {
    const wrapper = mountButtonGroupWithSlots('center')
    await nextTick()
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    expect(buttons[1].classes()).toContain('btn-primary')
  })

  it('emits update:modelValue on slot entry click', async () => {
    const wrapper = mountButtonGroupWithSlots('left')
    await nextTick()
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['right'])
  })
})

describe('FormControlButtonGroup slot entry precedence', () => {
  it('prefers slot entries over options prop', async () => {
    const wrapper = mount(FormControlButtonGroup, {
      props: {
        modelValue: 'a',
        label: 'Test',
        options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }],
      },
      slots: {
        default: () => [
          h(FormControlButtonGroupEntry, { value: 'x', text: 'X' }),
        ],
      },
    })
    await nextTick()
    const buttons = wrapper.findAll('.form-control-button-group__container__buttons .btn')
    expect(buttons).toHaveLength(1)
  })
})
