import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import FormControlPalette from './FormControlPalette.vue'
import FormControlPaletteEntry from './FormControlPaletteEntry.vue'

const palettes = [
  { value: 'warm', label: 'Warm', colors: ['#e74c3c', '#e67e22', '#f1c40f'] },
  { value: 'cool', label: 'Cool', colors: ['#3498db', '#2ecc71', '#1abc9c'] },
  { value: 'mono', label: 'Mono', colors: ['#333', '#666', '#999'] },
]

describe('FormControlPalette', () => {
  it('renders selected palette name', () => {
    const wrapper = mount(FormControlPalette, {
      props: { modelValue: 'cool', palettes },
    })
    expect(wrapper.find('.form-control-palette__name').text()).toBe('Cool')
  })

  it('renders selected palette swatches in preview', () => {
    const wrapper = mount(FormControlPalette, {
      props: { modelValue: 'warm', palettes },
    })
    expect(wrapper.find('.form-control-palette__preview .display-palette').exists()).toBe(true)
  })

  it('renders dropdown items for each palette', () => {
    const wrapper = mount(FormControlPalette, {
      props: { modelValue: 'warm', palettes },
      global: { stubs: { Teleport: true } },
    })
    const items = wrapper.findAll('.form-control-palette__item')
    expect(items).toHaveLength(3)
  })
})

describe('FormControlPalette (slot entries)', () => {
  it('renders palettes from slot entries', async () => {
    const wrapper = mount(FormControlPalette, {
      props: { modelValue: 'warm' },
      slots: {
        default: () => [
          h(FormControlPaletteEntry, { value: 'warm', label: 'Warm', colors: ['#e74c3c', '#e67e22'] }),
          h(FormControlPaletteEntry, { value: 'cool', label: 'Cool', colors: ['#3498db', '#2ecc71'] }),
        ],
      },
      global: { stubs: { Teleport: true } },
    })
    await nextTick()
    const items = wrapper.findAll('.form-control-palette__item')
    expect(items).toHaveLength(2)
  })

  it('shows selected palette name from slot entries', async () => {
    const wrapper = mount(FormControlPalette, {
      props: { modelValue: 'cool' },
      slots: {
        default: () => [
          h(FormControlPaletteEntry, { value: 'warm', label: 'Warm', colors: ['#e74c3c'] }),
          h(FormControlPaletteEntry, { value: 'cool', label: 'Cool', colors: ['#3498db'] }),
        ],
      },
    })
    await nextTick()
    expect(wrapper.find('.form-control-palette__name').text()).toBe('Cool')
  })
})
