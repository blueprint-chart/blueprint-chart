import { mount } from '@vue/test-utils'
import PalettesDetail from './PalettesDetail.vue'

function mountDetail(colors: string[]) {
  return mount(PalettesDetail, {
    props: { modelValue: { label: 'Brand', colors }, editable: true },
    global: { stubs: { teleport: true } },
  })
}

describe('PalettesDetail', () => {
  it('blocks removing below 2 colors and says why', () => {
    const wrapper = mountDetail(['#112233', '#445566'])
    const removes = wrapper.findAll('.form-control-colors-input__tag__remove')
    expect(removes.every(b => b.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.text()).toContain('A palette needs 2 to 12 colors.')
  })

  it('blocks adding above 12 colors', () => {
    const wrapper = mountDetail(Array.from({ length: 12 }, (_, i) => `#0000${String(i).padStart(2, '0')}`))
    expect(wrapper.find('.form-control-colors-input .button-add').attributes('disabled')).toBeDefined()
  })
})
