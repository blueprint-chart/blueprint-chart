import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DataCheckTable from './DataCheckTable.vue'

const mockSelectColumn = vi.fn()
const mockSelectedColumnIndex = ref(-1)

vi.mock('@/composables/useEditorPanel', () => ({
  useEditorPanel: () => ({
    selectColumn: mockSelectColumn,
    selectedColumnIndex: mockSelectedColumnIndex,
  }),
}))

const mockDisplayColumns = ref<string[]>([])
const mockDisplayRows = ref<string[][]>([])
const mockDisplayColumnTypes = ref<string[]>([])

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    displayColumns: mockDisplayColumns,
    displayRows: mockDisplayRows,
    displayColumnTypes: mockDisplayColumnTypes,
  }),
}))

vi.mock('bootstrap-vue-next', () => ({
  BTableSimple: { template: '<table><slot /></table>', props: ['hover', 'bordered', 'stickyHeader'] },
  BThead: { template: '<thead><slot /></thead>' },
  BTbody: { template: '<tbody><slot /></tbody>' },
  BTr: { template: '<tr><slot /></tr>' },
  BTh: { template: '<th @click="$emit(\'click\')"><slot /></th>' },
  BTd: { template: '<td><slot /></td>' },
}))

function resetData() {
  mockDisplayColumns.value = []
  mockDisplayRows.value = []
  mockDisplayColumnTypes.value = []
  mockSelectedColumnIndex.value = -1
}

describe('DataCheckTable', () => {
  beforeEach(() => {
    resetData()
    mockSelectColumn.mockClear()
  })

  it('shows empty state when no rows', () => {
    const w = mount(DataCheckTable)
    expect(w.find('.data-check-empty').exists()).toBe(true)
    expect(w.find('.data-check-table').exists()).toBe(false)
  })

  it('renders table when rows exist', () => {
    mockDisplayColumns.value = ['Name', 'Value']
    mockDisplayRows.value = [['A', '10']]
    mockDisplayColumnTypes.value = ['string', 'number']

    const w = mount(DataCheckTable)
    expect(w.find('.data-check-empty').exists()).toBe(false)
    expect(w.find('.data-check-table').exists()).toBe(true)
  })

  it('renders row numbers starting at 1', () => {
    mockDisplayColumns.value = ['Name']
    mockDisplayRows.value = [['A'], ['B'], ['C']]
    mockDisplayColumnTypes.value = ['string']

    const w = mount(DataCheckTable)
    const rowNums = w.findAll('tbody .data-check-table__row-num')
    expect(rowNums).toHaveLength(3)
    expect(rowNums[0].text()).toBe('1')
    expect(rowNums[1].text()).toBe('2')
    expect(rowNums[2].text()).toBe('3')
  })

  it('renders column headers with name and type', () => {
    mockDisplayColumns.value = ['Name', 'Value']
    mockDisplayRows.value = [['A', '10']]
    mockDisplayColumnTypes.value = ['string', 'number']

    const w = mount(DataCheckTable)
    const headers = w.findAll('.data-check-table__col-header')
    expect(headers).toHaveLength(2)
    expect(headers[0].find('.data-check-table__col-name').text()).toBe('Name')
    expect(headers[0].find('.data-check-table__col-type').text()).toBe('string')
    expect(headers[1].find('.data-check-table__col-name').text()).toBe('Value')
    expect(headers[1].find('.data-check-table__col-type').text()).toBe('number')
  })

  it('renders data cells with correct values', () => {
    mockDisplayColumns.value = ['Name', 'Value']
    mockDisplayRows.value = [['Apples', '42'], ['Bananas', '58']]
    mockDisplayColumnTypes.value = ['string', 'number']

    const w = mount(DataCheckTable)
    const rows = w.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    const firstRowCells = rows[0].findAll('td')
    // first td is row number, next are data cells
    expect(firstRowCells[1].text()).toBe('Apples')
    expect(firstRowCells[2].text()).toBe('42')
  })

  it('applies numeric class to number columns', () => {
    mockDisplayColumns.value = ['Name', 'Value']
    mockDisplayRows.value = [['A', '10']]
    mockDisplayColumnTypes.value = ['string', 'number']

    const w = mount(DataCheckTable)
    const cells = w.findAll('tbody td')
    // cells: [row-num, Name, Value]
    expect(cells[1].classes()).not.toContain('data-check-table__cell--numeric')
    expect(cells[2].classes()).toContain('data-check-table__cell--numeric')
  })

  it('highlights selected column', () => {
    mockDisplayColumns.value = ['Name', 'Value']
    mockDisplayRows.value = [['A', '10']]
    mockDisplayColumnTypes.value = ['string', 'number']
    mockSelectedColumnIndex.value = 1

    const w = mount(DataCheckTable)
    const headers = w.findAll('.data-check-table__col-header')
    expect(headers[0].classes()).not.toContain('data-check-table__col--selected')
    expect(headers[1].classes()).toContain('data-check-table__col--selected')
  })

  it('calls selectColumn when header clicked', async () => {
    mockDisplayColumns.value = ['Name', 'Value']
    mockDisplayRows.value = [['A', '10']]
    mockDisplayColumnTypes.value = ['string', 'number']

    const w = mount(DataCheckTable)
    const headers = w.findAll('.data-check-table__col-header')
    await headers[1].trigger('click')
    expect(mockSelectColumn).toHaveBeenCalledWith(1)
  })
})
