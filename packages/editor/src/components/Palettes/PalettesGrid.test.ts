import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PalettesGrid from './PalettesGrid.vue'
import PalettesCard from './PalettesCard.vue'
import { CUSTOM_PALETTES_KEY, useCustomPalettes } from '@/stores/customPalettes'

function mountGrid() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PalettesGrid, { global: { plugins: [pinia], stubs: { teleport: true } } })
}

function seed() {
  localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
    { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
  ]))
}

async function select(card: VueWrapper) {
  await card.find('.palettes-card__header__text__name__button').trigger('click')
  await nextTick()
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

  it('shows the empty state when nothing is selected', () => {
    const wrapper = mountGrid()
    expect(wrapper.find('.palettes-empty-state').text()).toBe('Select a palette to edit it')
  })

  it('selecting a custom palette shows its editor in the panel', async () => {
    seed()
    const wrapper = mountGrid()
    const card = wrapper.findAllComponents(PalettesCard)[0]
    await select(card)
    expect(card.classes()).toContain('palettes-card--selected')
    expect(wrapper.find('.palettes-empty-state').exists()).toBe(false)
    const name = wrapper.find('.palettes-detail__body__name input')
    expect((name.element as HTMLInputElement).value).toBe('Seeded')
    await name.setValue('Renamed')
    expect(useCustomPalettes().palettes.value[0].label).toBe('Renamed')
  })

  it('flags an empty name and keeps the stored one', async () => {
    seed()
    const wrapper = mountGrid()
    await select(wrapper.findAllComponents(PalettesCard)[0])
    const name = wrapper.find('.palettes-detail__body__name input')
    await name.setValue('  ')
    expect((name.element as HTMLInputElement).value).toBe('  ')
    expect(name.classes()).toContain('is-invalid')
    expect(wrapper.find('.palettes-detail__body__name').text()).toContain('Name can\'t be empty.')
    expect(useCustomPalettes().palettes.value[0].label).toBe('Seeded')
  })

  it('selecting a built-in palette shows a read-only detail that duplicates it', async () => {
    const wrapper = mountGrid()
    await select(wrapper.findAllComponents(PalettesCard).find(c => c.props('label') === 'Egypt')!)
    const detail = wrapper.find('.palettes-detail')
    expect(detail.find('input').exists()).toBe(false)
    expect(wrapper.find('.layout-panel__header').text()).toContain('Egypt')
    await detail.find('[data-test="duplicate"]').trigger('click')
    expect(useCustomPalettes().palettes.value.map(p => p.label)).toEqual(['Egypt copy'])
  })

  it('creates a palette from the New palette card and selects it', async () => {
    const wrapper = mountGrid()
    await wrapper.find('.palettes-new-card').trigger('click')
    await nextTick()
    expect(useCustomPalettes().palettes.value).toHaveLength(1)
    expect((wrapper.find('.palettes-detail__body__name input').element as HTMLInputElement).value).toBe('New palette')
  })

  it('deletes the selected palette from the panel after confirming', async () => {
    seed()
    const wrapper = mountGrid()
    await select(wrapper.findAllComponents(PalettesCard)[0])
    await wrapper.find('.palettes-detail [data-test="delete"]').trigger('click')
    expect(useCustomPalettes().palettes.value).toHaveLength(1)
    await wrapper.find('.modal-footer .btn-danger').trigger('click')
    await nextTick()
    expect(useCustomPalettes().palettes.value).toHaveLength(0)
    expect(wrapper.find('.palettes-empty-state').exists()).toBe(true)
  })

  it('asks for confirmation before deleting a custom palette', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    const wrapper = mountGrid()
    const card = wrapper.findAllComponents(PalettesCard)[0]
    await card.findAll('button').find(b => b.attributes('aria-label') === 'Delete palette')!.trigger('click')
    expect(useCustomPalettes().palettes.value).toHaveLength(1)
    await wrapper.find('.modal-footer .btn-danger').trigger('click')
    await nextTick()
    expect(useCustomPalettes().palettes.value).toHaveLength(0)
  })
})
