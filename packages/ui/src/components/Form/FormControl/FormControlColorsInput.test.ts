import { flushPromises, shallowMount } from '@vue/test-utils'
import FormControlColorsInput from './FormControlColorsInput.vue'

const stubs = {
  BFormGroup: { template: '<div class="form-group"><slot /></div>', props: ['label', 'labelFor'] },
  DisplayColorSwatch: { template: '<span class="swatch" />', props: ['color', 'size'] },
  ButtonAdd: { template: '<button class="btn-add" @click="$emit(\'click\')" />', props: ['id', 'size'] },
  FormControlColorInputPopover: true,
}

function factory(props: Record<string, unknown> = {}) {
  return shallowMount(FormControlColorsInput, {
    props: {
      modelValue: ['#ff0000', '#00ff00', '#0000ff'],
      label: 'Colors',
      id: 'test-colors',
      ...props,
    },
    global: { stubs },
  })
}

describe('FormControlColorsInput rendering', () => {
  it('renders a tag for each color in the model', () => {
    const wrapper = factory()
    const tags = wrapper.findAll('.form-control-colors-input__tag')
    expect(tags).toHaveLength(3)
  })

  it('displays hex values in tags', () => {
    const wrapper = factory()
    const hexSpans = wrapper.findAll('.form-control-colors-input__tag__edit__hex')
    expect(hexSpans[0].text()).toBe('#ff0000')
    expect(hexSpans[1].text()).toBe('#00ff00')
    expect(hexSpans[2].text()).toBe('#0000ff')
  })

  it('renders a swatch for each color', () => {
    const wrapper = factory()
    const swatches = wrapper.findAll('.swatch')
    expect(swatches).toHaveLength(3)
  })

  it('renders the add button', () => {
    const wrapper = factory()
    expect(wrapper.find('.btn-add').exists()).toBe(true)
  })

  it('renders no tags when model is empty', () => {
    const wrapper = factory({ modelValue: [] })
    expect(wrapper.findAll('.form-control-colors-input__tag')).toHaveLength(0)
  })
})

describe('FormControlColorsInput remove', () => {
  it('renders remove button with correct aria-label for each tag', () => {
    const wrapper = factory()
    const removeButtons = wrapper.findAll('.form-control-colors-input__tag__remove')
    expect(removeButtons).toHaveLength(3)
    expect(removeButtons[0].attributes('aria-label')).toBe('Remove #ff0000')
    expect(removeButtons[1].attributes('aria-label')).toBe('Remove #00ff00')
  })

  it('emits update:modelValue without the removed color on remove click', async () => {
    const wrapper = factory()
    const removeButtons = wrapper.findAll('.form-control-colors-input__tag__remove')
    await removeButtons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['#ff0000', '#0000ff']])
  })

  it('emits update:modelValue with empty array when removing last color', async () => {
    const wrapper = factory({ modelValue: ['#ff0000'] })
    const removeBtn = wrapper.find('.form-control-colors-input__tag__remove')
    await removeBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]])
  })
})

describe('FormControlColorsInput edit', () => {
  it('opens the picker on the clicked color from its hex label', async () => {
    const wrapper = factory()
    const editBtn = wrapper.find('button[aria-label="Edit #00ff00"]')
    expect(editBtn.text()).toContain('#00ff00')
    await editBtn.trigger('click')
    const popover = wrapper.findComponent({ name: 'FormControlColorInputPopover' })
    expect(popover.props('open')).toBe(true)
    expect(popover.props('modelValue')).toBe('#00ff00')
  })

  it('anchors the picker under the start of the clicked pill', async () => {
    const wrapper = factory()
    await wrapper.find('button[aria-label="Edit #00ff00"]').trigger('click')
    const popover = wrapper.findComponent({ name: 'FormControlColorInputPopover' })
    expect(popover.props('target')).toBe(wrapper.findAll('.form-control-colors-input__tag')[1].element)
    expect(popover.props('placement')).toBe('bottom-start')
  })

  it('only ignores outside clicks on the edit button, not the whole pill', async () => {
    const wrapper = factory()
    const editBtn = wrapper.find('button[aria-label="Edit #00ff00"]')
    await editBtn.trigger('click')
    expect(wrapper.findComponent({ name: 'FormControlColorInputPopover' }).props('ignore')).toBe(editBtn.element)
  })

  it('closes the picker when the edited color is removed', async () => {
    const wrapper = factory()
    wrapper.setProps({ 'onUpdate:modelValue': (value: string[]) => wrapper.setProps({ modelValue: value }) })
    await wrapper.find('button[aria-label="Edit #00ff00"]').trigger('click')
    await wrapper.find('button[aria-label="Remove #00ff00"]').trigger('click')
    expect(wrapper.findComponent({ name: 'FormControlColorInputPopover' }).props('open')).toBe(false)
  })

  it('closes the picker when the parent replaces the edited color', async () => {
    const wrapper = factory()
    await wrapper.find('button[aria-label="Edit #00ff00"]').trigger('click')
    await wrapper.setProps({ modelValue: ['#ff0000', '#123456', '#0000ff'] })
    expect(wrapper.findComponent({ name: 'FormControlColorInputPopover' }).props('open')).toBe(false)
  })

  it('keeps the picker open while it edits the color itself', async () => {
    const wrapper = factory()
    wrapper.setProps({ 'onUpdate:modelValue': (value: string[]) => wrapper.setProps({ modelValue: value }) })
    await wrapper.find('button[aria-label="Edit #00ff00"]').trigger('click')
    const popover = wrapper.findComponent({ name: 'FormControlColorInputPopover' })
    popover.vm.$emit('update:modelValue', '#abcdef')
    await flushPromises()
    expect(wrapper.props('modelValue')).toEqual(['#ff0000', '#abcdef', '#0000ff'])
    expect(popover.props('open')).toBe(true)
  })
})

describe('FormControlColorsInput add', () => {
  it('centers the picker under the add button', async () => {
    const wrapper = factory()
    await wrapper.find('.btn-add').trigger('click')
    const popover = wrapper.findComponent({ name: 'FormControlColorInputPopover' })
    expect(popover.props('open')).toBe(true)
    expect(popover.props('target')).toBe(wrapper.find('.btn-add').element)
    expect(popover.props('placement')).toBe('bottom')
  })
})

describe('FormControlColorsInput limits', () => {
  it('disables remove buttons at the minimum', () => {
    const wrapper = factory({ modelValue: ['#ff0000', '#00ff00'], min: 2 })
    const removes = wrapper.findAll('.form-control-colors-input__tag__remove')
    expect(removes.every(b => b.attributes('disabled') !== undefined)).toBe(true)
  })

  it('keeps remove buttons enabled above the minimum', () => {
    const wrapper = factory({ min: 2 })
    expect(wrapper.find('.form-control-colors-input__tag__remove').attributes('disabled')).toBeUndefined()
  })

  it('disables the add button at the maximum', () => {
    const wrapper = factory({ max: 3 })
    expect(wrapper.find('.btn-add').attributes('disabled')).toBeDefined()
  })
})
