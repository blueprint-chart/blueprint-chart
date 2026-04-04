import { shallowMount } from '@vue/test-utils'
import FormControlDateFormat from './FormControlDateFormat.vue'

const stubs = {
  FormControlDropdown: {
    template: `
      <div class="form-control-dropdown">
        <span class="trigger"><slot name="button-content" /></span>
        <div class="menu"><slot name="menu" v-bind="{ hide: hideFn }" /></div>
      </div>
    `,
    props: ['id', 'modelValue', 'label', 'block', 'placeholder', 'autoClose', 'menuClass', 'minMenuWidth'],
    emits: ['update:modelValue'],
    methods: {
      hideFn() { /* noop */ },
    },
  },
}

function factory(props: Record<string, unknown> = {}) {
  return shallowMount(FormControlDateFormat, {
    props: {
      modelValue: '',
      ...props,
    },
    global: { stubs },
  })
}

describe('FormControlDateFormat rendering', () => {
  it('displays (automatic) when model is empty', () => {
    const wrapper = factory({ modelValue: '' })
    const trigger = wrapper.find('.trigger')
    expect(trigger.text()).toContain('(automatic)')
  })

  it('applies text-secondary class when model is empty', () => {
    const wrapper = factory({ modelValue: '' })
    const triggerText = wrapper.find('.form-control-date-format__trigger-text')
    expect(triggerText.classes()).toContain('text-secondary')
  })

  it('does not apply text-secondary when model has a value', () => {
    const wrapper = factory({ modelValue: '%Y' })
    const triggerText = wrapper.find('.form-control-date-format__trigger-text')
    expect(triggerText.classes()).not.toContain('text-secondary')
  })

  it('shows preset label for known d3 format', () => {
    const wrapper = factory({ modelValue: '%Y' })
    const trigger = wrapper.find('.trigger')
    expect(trigger.text()).toContain('Year only')
  })
})

describe('FormControlDateFormat presets list', () => {
  it('renders all preset items', () => {
    const wrapper = factory()
    const items = wrapper.findAll('.form-control-date-format__popover__list__item')
    // 13 presets total
    expect(items.length).toBe(13)
  })

  it('marks the active preset with active class', () => {
    const wrapper = factory({ modelValue: '%Y' })
    const items = wrapper.findAll('.form-control-date-format__popover__list__item')
    const yearItem = items.find(i => i.text().includes('Year only'))!
    expect(yearItem.classes()).toContain('form-control-date-format__popover__list__item--active')
  })

  it('shows checkmark only for active preset', () => {
    const wrapper = factory({ modelValue: '' })
    const checks = wrapper.findAll('.form-control-date-format__popover__list__item__check')
    // Only the (automatic) preset should have a check
    expect(checks).toHaveLength(1)
  })
})

describe('FormControlDateFormat preset selection', () => {
  it('emits update:modelValue with d3 string on preset click', async () => {
    const wrapper = factory({ modelValue: '' })
    const items = wrapper.findAll('.form-control-date-format__popover__list__item')
    const yearItem = items.find(i => i.text().includes('Year only'))!
    await yearItem.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['%Y'])
  })

  it('emits empty string on (automatic) preset click', async () => {
    const wrapper = factory({ modelValue: '%Y' })
    const items = wrapper.findAll('.form-control-date-format__popover__list__item')
    const autoItem = items.find(i => i.text().includes('(automatic)'))!
    await autoItem.trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])
  })
})

describe('FormControlDateFormat custom format', () => {
  it('shows custom input section when (custom) preset is selected', async () => {
    const wrapper = factory({ modelValue: '' })
    const items = wrapper.findAll('.form-control-date-format__popover__list__item')
    const customItem = items.find(i => i.text().includes('(custom)'))!
    await customItem.trigger('click')
    expect(wrapper.find('.form-control-date-format__popover__custom').exists()).toBe(true)
  })

  it('hides custom input section for non-custom presets', () => {
    const wrapper = factory({ modelValue: '' })
    expect(wrapper.find('.form-control-date-format__popover__custom').exists()).toBe(false)
  })

  it('initializes as custom when model value is not a known d3 preset', () => {
    const wrapper = factory({ modelValue: '%H:%M' })
    expect(wrapper.find('.form-control-date-format__popover__custom').exists()).toBe(true)
  })
})

describe('FormControlDateFormat tick previews', () => {
  it('shows tick preview for known formats', () => {
    const wrapper = factory()
    const ticks = wrapper.findAll('.form-control-date-format__popover__list__item__body__ticks')
    // At least (automatic) and Year only should have tick text
    expect(ticks.length).toBeGreaterThan(0)
  })

  it('shows auto text for automatic preset', () => {
    const wrapper = factory()
    const items = wrapper.findAll('.form-control-date-format__popover__list__item')
    const autoItem = items[0]
    expect(autoItem.text()).toContain('auto')
  })
})
