import { mount } from '@vue/test-utils'
import FormControlDirectionPicker from './FormControlDirectionPicker.vue'
import DirectionPickerHandle from './DirectionPickerHandle.vue'
import DirectionPickerField from './DirectionPickerField.vue'

function mountPicker(modelValue = 'N' as string, size?: string) {
  return mount(FormControlDirectionPicker, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: { modelValue, label: 'Position', ...(size ? { size } : {}) } as any,
  })
}

describe('FormControlDirectionPicker rendering', () => {
  it('renders 9 handles', () => {
    const wrapper = mountPicker()
    const handles = wrapper.findAllComponents(DirectionPickerHandle)
    expect(handles).toHaveLength(9)
  })

  it('renders the field sub-component', () => {
    const wrapper = mountPicker()
    expect(wrapper.findComponent(DirectionPickerField).exists()).toBe(true)
  })

  it('marks the active handle', () => {
    const wrapper = mountPicker('NE')
    const handles = wrapper.findAllComponents(DirectionPickerHandle)
    const activeHandle = handles.find(h => h.props('pos') === 'ne')
    expect(activeHandle?.props('active')).toBe(true)
  })
})

describe('FormControlDirectionPicker inactive handles', () => {
  it('non-selected handles are not active', () => {
    const wrapper = mountPicker('N')
    const handles = wrapper.findAllComponents(DirectionPickerHandle)
    const inactive = handles.filter(h => h.props('pos') !== 'n')
    for (const h of inactive) {
      expect(h.props('active')).toBe(false)
    }
  })
})

describe('FormControlDirectionPicker interaction', () => {
  it('emits update:modelValue when a handle is clicked', async () => {
    const wrapper = mountPicker('N')
    const handles = wrapper.findAllComponents(DirectionPickerHandle)
    const seHandle = handles.find(h => h.props('pos') === 'se')!
    await seHandle.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['SE'])
  })

  it('applies size class (default sm)', () => {
    const wrapper = mountPicker()
    expect(wrapper.find('.direction-picker__anchor--sm').exists()).toBe(true)
  })

  it('applies custom size class', () => {
    const wrapper = mountPicker('N', 'lg')
    expect(wrapper.find('.direction-picker__anchor--lg').exists()).toBe(true)
  })
})

describe('FormControlDirectionPicker field coords: cardinal', () => {
  it('passes correct coordinates for center', () => {
    const wrapper = mountPicker('center')
    const field = wrapper.findComponent(DirectionPickerField)
    expect(field.props('x')).toBe(0.5)
    expect(field.props('y')).toBe(0.5)
  })

  it('passes correct coordinates for NW', () => {
    const wrapper = mountPicker('NW')
    const field = wrapper.findComponent(DirectionPickerField)
    expect(field.props('x')).toBe(0)
    expect(field.props('y')).toBe(0)
  })
})

describe('FormControlDirectionPicker field coords: edges', () => {
  it('passes correct coordinates for SE', () => {
    const wrapper = mountPicker('SE')
    const field = wrapper.findComponent(DirectionPickerField)
    expect(field.props('x')).toBe(1)
    expect(field.props('y')).toBe(1)
  })

  it('falls back to center when modelValue is unknown', () => {
    const wrapper = mountPicker('invalid')
    const field = wrapper.findComponent(DirectionPickerField)
    expect(field.props('x')).toBe(0.5)
    expect(field.props('y')).toBe(0.5)
  })
})

describe('DirectionPickerHandle rendering', () => {
  it('renders a button with the correct title', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'nw', label: 'Top left', shape: 'corner', active: false },
    })
    expect(wrapper.find('button').attributes('title')).toBe('Top left')
  })

  it('has active class when active', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'n', label: 'Top', shape: 'edge-h', active: true },
    })
    expect(wrapper.find('button').classes()).toContain('direction-picker-handle--active')
  })

  it('does not have active class when inactive', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'n', label: 'Top', shape: 'edge-h', active: false },
    })
    expect(wrapper.find('button').classes()).not.toContain('direction-picker-handle--active')
  })
})

describe('DirectionPickerHandle shape: corner and edge-h', () => {
  it('applies shape class for corner', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'nw', label: 'Top left', shape: 'corner', active: false },
    })
    expect(wrapper.find('button').classes()).toContain('direction-picker-handle--corner')
  })

  it('applies shape class for edge-h', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'n', label: 'Top', shape: 'edge-h', active: false },
    })
    expect(wrapper.find('button').classes()).toContain('direction-picker-handle--edge-h')
  })
})

describe('DirectionPickerHandle shape: edge-v and events', () => {
  it('applies shape class for edge-v', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'w', label: 'Left', shape: 'edge-v', active: false },
    })
    expect(wrapper.find('button').classes()).toContain('direction-picker-handle--edge-v')
  })

  it('emits select on click', async () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'e', label: 'Right', shape: 'edge-v', active: false },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('sets data-d attribute for CSS positioning', () => {
    const wrapper = mount(DirectionPickerHandle, {
      props: { pos: 'sw', label: 'Bottom left', shape: 'corner', active: false },
    })
    expect(wrapper.find('button').attributes('data-d')).toBe('sw')
  })
})

describe('DirectionPickerField crosshairs', () => {
  it('renders crosshairs and rect', () => {
    const wrapper = mount(DirectionPickerField, {
      props: { x: 0.5, y: 0.5 },
    })
    expect(wrapper.find('.direction-picker-field__crosshair-h').exists()).toBe(true)
    expect(wrapper.find('.direction-picker-field__crosshair-v').exists()).toBe(true)
    expect(wrapper.find('.direction-picker-field__rect').exists()).toBe(true)
  })

  it('positions crosshairs at center for (0.5, 0.5)', () => {
    const wrapper = mount(DirectionPickerField, {
      props: { x: 0.5, y: 0.5 },
    })
    const h = wrapper.find('.direction-picker-field__crosshair-h')
    const v = wrapper.find('.direction-picker-field__crosshair-v')
    expect(h.attributes('style')).toContain('top: 50%')
    expect(v.attributes('style')).toContain('left: 50%')
  })
})

describe('DirectionPickerField origin crosshairs', () => {
  it('positions crosshairs at origin for (0, 0)', () => {
    const wrapper = mount(DirectionPickerField, {
      props: { x: 0, y: 0 },
    })
    const h = wrapper.find('.direction-picker-field__crosshair-h')
    const v = wrapper.find('.direction-picker-field__crosshair-v')
    expect(h.attributes('style')).toContain('top: 0%')
    expect(v.attributes('style')).toContain('left: 0%')
  })

  it('positions crosshairs at bottom-right for (1, 1)', () => {
    const wrapper = mount(DirectionPickerField, {
      props: { x: 1, y: 1 },
    })
    const h = wrapper.find('.direction-picker-field__crosshair-h')
    const v = wrapper.find('.direction-picker-field__crosshair-v')
    expect(h.attributes('style')).toContain('top: 100%')
    expect(v.attributes('style')).toContain('left: 100%')
  })
})

describe('DirectionPickerField flush positioning', () => {
  it('uses flush positioning for rect at top-left', () => {
    const wrapper = mount(DirectionPickerField, {
      props: { x: 0, y: 0 },
    })
    const rect = wrapper.find('.direction-picker-field__rect')
    expect(rect.attributes('style')).toContain('left: -1px')
    expect(rect.attributes('style')).toContain('top: -1px')
  })

  it('uses flush positioning for rect at bottom-right', () => {
    const wrapper = mount(DirectionPickerField, {
      props: { x: 1, y: 1 },
    })
    const rect = wrapper.find('.direction-picker-field__rect')
    const style = rect.attributes('style')!
    expect(style).toContain('calc(100% - var(--rect-w) + 1px)')
    expect(style).toContain('calc(100% - var(--rect-h) + 1px)')
  })
})
