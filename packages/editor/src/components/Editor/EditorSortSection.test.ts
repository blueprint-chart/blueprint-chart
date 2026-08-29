import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import EditorSortSection from './EditorSortSection.vue'

const mockSetOption = vi.fn()
const availableOptionKeys = ref<string[]>([])
const currentOptions = ref<Record<string, unknown>>({})
const sort = ref('none')

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions,
    availableOptionKeys,
    setOption: mockSetOption,
  }),
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ sort }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlButtonGroup: {
    template: '<div :data-label="label" :data-value="modelValue" @click="$emit(\'update:modelValue\', \'total\')" />',
    props: ['modelValue', 'label', 'options', 'block'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorSortSection (#127)', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
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
