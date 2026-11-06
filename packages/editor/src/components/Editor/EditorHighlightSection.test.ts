import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import EditorHighlightSection from './EditorHighlightSection.vue'

const chartTypeRef = ref('scatter')
const optionsRef = ref<Record<string, unknown>>({})

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({
    chartType: chartTypeRef,
    data: ref([
      'series = "GDP per capita","Life expectancy","Population","Region"',
      '"France" = 53449, 82.8, 67.4, "Europe"',
      '"Nigeria" = 8362, 53.0, 209.5, "Africa"',
      '"Kenya" = 5172, 62.9, 51.2, "Africa"',
    ].join('\n')),
    highlights: ref([{ target: 'Nigeria' }]),
  }),
}))

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({ currentOptions: optionsRef }),
}))

const ListSelectPanel = {
  name: 'ListSelectPanel',
  props: ['items', 'selected'],
  template: '<div class="stub-list" />',
}

const items = () => mount(EditorHighlightSection, { global: { stubs: { ListSelectPanel } } })
  .findComponent({ name: 'ListSelectPanel' })
  .props('items') as string[]

describe('EditorHighlightSection on a scatter chart', () => {
  it('offers every point and every group as a highlight target', () => {
    optionsRef.value = {}
    expect(items()).toEqual(['France', 'Nigeria', 'Kenya', 'Europe', 'Africa'])
  })

  it('offers no group when the group encoding is off', () => {
    optionsRef.value = { group: 'none' }
    expect(items()).toEqual(['France', 'Nigeria', 'Kenya'])
  })
})
