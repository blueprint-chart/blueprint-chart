import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import EditorSortSection from './EditorSortSection.vue'

const mockSetOption = vi.fn()
const availableOptionKeys = ref<string[]>([])
const currentOptions = ref<Record<string, unknown>>({})
const optionDefs = ref<Record<string, unknown>[]>([])
const sort = ref('none')
const data = ref('series = x, y\n"a" = 1, 2\n"b" = 3, 4')

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions,
    availableOptionKeys,
    optionDefs,
    setOption: mockSetOption,
  }),
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ sort, data }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlButtonGroup: {
    name: 'FormControlButtonGroup',
    template: '<div :data-label="label" :data-value="modelValue" @click="$emit(\'update:modelValue\', \'total\')" />',
    props: ['modelValue', 'label', 'options', 'block'],
    emits: ['update:modelValue'],
  },
  FormControlCheckbox: {
    name: 'FormControlCheckbox',
    template: '<div :data-label="label" @click="$emit(\'update:modelValue\', true)" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorSortSection (#127)', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
    optionDefs.value = []
    sort.value = 'none'
  })

  it('offers sortMode on a chart type that has it', () => {
    availableOptionKeys.value = ['sortMode']
    currentOptions.value = { sortMode: 'none' }
    const wrapper = mount(EditorSortSection)
    expect(wrapper.find('[data-label="Sort mode"]').exists()).toBe(true)
  })

  it('writes the chosen sortMode back through setOption', async () => {
    availableOptionKeys.value = ['sortMode']
    const wrapper = mount(EditorSortSection)
    await wrapper.find('[data-label="Sort mode"]').trigger('click')
    expect(mockSetOption).toHaveBeenCalledWith('sortMode', 'total')
  })

  describe('with the dot plot sortMode def', () => {
    beforeEach(() => {
      availableOptionKeys.value = ['sortMode']
      optionDefs.value = [{
        key: 'sortMode',
        default: 'value',
        choices: [{ value: 'none', text: 'None' }, { value: 'value', text: 'By value' }, { value: 'gap', text: 'By gap' }],
      }]
    })

    it('lists the choices of the registry def', () => {
      const group = mount(EditorSortSection).findComponent({ name: 'FormControlButtonGroup' })
      expect((group.props('options') as { text: string }[]).map(o => o.text)).toEqual(['None', 'By value', 'By gap'])
    })

    it('keeps an explicit none', () => {
      currentOptions.value = { sortMode: 'none' }
      expect(mount(EditorSortSection).find('[data-label="Sort mode"]').attributes('data-value')).toBe('none')
    })
  })

  it('offers the data series to sort by when sorting by series', () => {
    availableOptionKeys.value = ['sortMode', 'sortSeries']
    currentOptions.value = { sortMode: 'series' }
    const select = mount(EditorSortSection).findComponent({ name: 'BFormSelect' })
    expect(select.props('options')).toEqual(['x', 'y'])
    expect(select.props('modelValue')).toBe('x')
  })

  it('hides the series picker for other sort modes', () => {
    availableOptionKeys.value = ['sortMode', 'sortSeries']
    currentOptions.value = { sortMode: 'total' }
    expect(mount(EditorSortSection).findComponent({ name: 'BFormSelect' }).exists()).toBe(false)
  })

  it('writes the reverse toggle back through setOption', async () => {
    availableOptionKeys.value = ['sortMode', 'sortReverse']
    await mount(EditorSortSection).find('[data-label="Reverse order"]').trigger('click')
    expect(mockSetOption).toHaveBeenCalledWith('sortReverse', true)
  })

  it('falls back to a plain sort direction when the type has no sortMode', () => {
    availableOptionKeys.value = ['legend']
    const wrapper = mount(EditorSortSection)
    expect(wrapper.find('[data-label="Sort"]').exists()).toBe(true)
  })
})

describe('EditorSortSection is reachable (#127)', () => {
  it('is mounted by a tab, not left as dead code', () => {
    const tab = readFileSync(resolve(process.cwd(), 'src/components/Editor/EditorAppearanceTab.vue'), 'utf-8')
    expect(tab).toContain('<EditorSortSection />')
  })
})
