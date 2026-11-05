import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PalettesGrid from './PalettesGrid.vue'
import PalettesCard from './PalettesCard.vue'
import { CUSTOM_PALETTES_KEY, useCustomPalettes } from '@/stores/customPalettes'

function mountGrid() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PalettesGrid, { global: { plugins: [pinia], stubs: { teleport: true } } })
}

describe('PalettesGrid', () => {
  beforeEach(() => localStorage.clear())

  it('lists custom palettes first', () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    const wrapper = mountGrid()
    expect(wrapper.findAllComponents(PalettesCard)[0].props('label')).toBe('Seeded')
  })

  it('duplicates a built-in palette as "<label> copy"', async () => {
    const wrapper = mountGrid()
    const egypt = wrapper.findAllComponents(PalettesCard).find(c => c.props('label') === 'Egypt')!
    const duplicate = egypt.findAll('button').find(b => b.attributes('aria-label') === 'Duplicate')!
    await duplicate.trigger('click')
    await nextTick()
    expect(useCustomPalettes().palettes.value.map(p => p.label)).toContain('Egypt copy')
  })

  it('edits a palette in a drawer and keeps its card in the grid', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    const wrapper = mountGrid()
    const drawer = () => wrapper.findComponent({ name: 'BOffcanvas' })
    expect(drawer().props('modelValue')).toBe(false)
    await wrapper.findAllComponents(PalettesCard)[0].findAll('button').find(b => b.attributes('aria-label') === 'Edit')!.trigger('click')
    await nextTick()
    expect(drawer().props('modelValue')).toBe(true)
    expect(wrapper.findAllComponents(PalettesCard)[0].props('label')).toBe('Seeded')
    const name = wrapper.find('.palettes-drawer__body__name input')
    expect((name.element as HTMLInputElement).value).toBe('Seeded')
    await name.setValue('Renamed')
    expect(useCustomPalettes().palettes.value[0].label).toBe('Renamed')
  })

  it('closes the drawer on Done', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    const wrapper = mountGrid()
    await wrapper.findAllComponents(PalettesCard)[0].findAll('button').find(b => b.attributes('aria-label') === 'Edit')!.trigger('click')
    await nextTick()
    await wrapper.find('.palettes-drawer__footer__done').trigger('click')
    await nextTick()
    expect(wrapper.findComponent({ name: 'BOffcanvas' }).props('modelValue')).toBe(false)
  })

  it('asks for confirmation before deleting a custom palette', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    const wrapper = mountGrid()
    const card = wrapper.findAllComponents(PalettesCard)[0]
    await card.findAll('button').find(b => b.attributes('aria-label') === 'Delete')!.trigger('click')
    expect(useCustomPalettes().palettes.value).toHaveLength(1)
    await wrapper.find('.modal-footer .btn-danger').trigger('click')
    await nextTick()
    expect(useCustomPalettes().palettes.value).toHaveLength(0)
  })
})
