import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PalettesCategoryTable from './PalettesCategoryTable.vue'
import { CATEGORY_COLORS_KEY, useCategoryColors } from '@/stores/categoryColors'

function mountTable() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PalettesCategoryTable, { global: { plugins: [pinia], stubs: { teleport: true } } })
}

async function addCategory(wrapper: ReturnType<typeof mountTable>, name: string, color: string) {
  await wrapper.find('.palettes-category-table__form__name').setValue(name)
  const hex = wrapper.find('.palettes-category-table__form .form-control-color-input__wrapper__field')
  await hex.setValue(color)
  await hex.trigger('change')
  await wrapper.find('.palettes-category-table__form__add').trigger('click')
  await flushPromises()
}

describe('PalettesCategoryTable', () => {
  beforeEach(() => localStorage.clear())

  it('shows the empty-state line when there are no category colors', () => {
    const wrapper = mountTable()
    expect(wrapper.text()).toContain('Give a name a fixed color. Charts with that name can apply it from the Colors section.')
  })

  it('adds a row', async () => {
    const wrapper = mountTable()
    await addCategory(wrapper, 'France', '#0055A4')
    expect(wrapper.find('.palettes-category-table__row').text()).toContain('France')
    expect(useCategoryColors().categoryColors.value).toEqual([{ name: 'France', color: '#0055A4' }])
  })

  it('shows an error for a duplicate name', async () => {
    localStorage.setItem(CATEGORY_COLORS_KEY, JSON.stringify([{ name: 'France', color: '#0055A4' }]))
    const wrapper = mountTable()
    await addCategory(wrapper, 'france', '#112233')
    expect(wrapper.text()).toContain('This name already has a color.')
    expect(useCategoryColors().categoryColors.value).toHaveLength(1)
  })

  it('deletes a row', async () => {
    localStorage.setItem(CATEGORY_COLORS_KEY, JSON.stringify([{ name: 'France', color: '#0055A4' }]))
    const wrapper = mountTable()
    await wrapper.find('.palettes-category-table__row__delete').trigger('click')
    await flushPromises()
    expect(wrapper.find('.palettes-category-table__row').exists()).toBe(false)
    expect(useCategoryColors().categoryColors.value).toHaveLength(0)
  })
})
