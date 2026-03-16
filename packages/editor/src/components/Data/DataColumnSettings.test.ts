import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DataColumnSettings from './DataColumnSettings.vue'

const selectedColumnIndex = ref(-1)
const selectColumn = vi.fn((idx: number) => {
  selectedColumnIndex.value = idx
})

const columns = ref(['Name', 'Value', 'Count'])
const rows = ref([
  ['Alice', '100', '5'],
  ['Bob', '200', '10'],
])
const columnTypes = ref(['string', 'number', 'number'])
const setColumnType = vi.fn()

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    selectedColumnIndex,
    selectColumn,
  }),
}))

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({
    columns,
    rows,
    columnTypes,
    setColumnType,
  }),
}))

function mountSettings() {
  return mount(DataColumnSettings, {
    global: {
      stubs: {
        FormControlDropdown: {
          template: '<select :data-value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select>',
          props: ['modelValue', 'options', 'placeholder', 'label', 'block'],
        },
      },
    },
  })
}

describe('DataColumnSettings', () => {
  beforeEach(() => {
    selectedColumnIndex.value = -1
    selectColumn.mockClear()
    setColumnType.mockClear()
    columns.value = ['Name', 'Value', 'Count']
    rows.value = [
      ['Alice', '100', '5'],
      ['Bob', '200', '10'],
    ]
    columnTypes.value = ['string', 'number', 'number']
  })

  it('shows column picker dropdown when no column is selected', () => {
    const w = mountSettings()
    expect(w.find('.data-column-settings__picker').exists()).toBe(true)
    const options = w.findAll('option')
    expect(options.length).toBe(3)
    expect(options[0].text()).toBe('Name')
    expect(options[1].text()).toBe('Value')
    expect(options[2].text()).toBe('Count')
  })

  it('calls selectColumn when a column is picked from dropdown', async () => {
    const w = mountSettings()
    const select = w.find('select')
    await select.setValue('1')
    expect(selectColumn).toHaveBeenCalledWith(1)
  })

  it('hides column picker when a column is selected', async () => {
    selectedColumnIndex.value = 0
    const w = mountSettings()
    expect(w.find('.data-column-settings__picker').exists()).toBe(false)
  })

  it('shows type dropdown and detections when column is selected', () => {
    selectedColumnIndex.value = 1
    const w = mountSettings()
    expect(w.find('.data-column-settings__field').exists()).toBe(true)
    expect(w.find('.data-column-settings__section__detections').exists()).toBe(true)
  })

  it('shows unique values detection for selected column', () => {
    selectedColumnIndex.value = 0
    const w = mountSettings()
    const detections = w.findAll('.data-column-settings__section__detections__item')
    expect(detections[0].text()).toContain('unique values')
  })

  it('shows type detection for selected column', () => {
    selectedColumnIndex.value = 1
    const w = mountSettings()
    const detections = w.findAll('.data-column-settings__section__detections__item')
    expect(detections[1].text()).toContain('Numeric measure detected')
  })
})
