import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DataStructurePanel from './DataStructurePanel.vue'

const mockSelectColumn = vi.fn()
const mockOpenDataPanel = vi.fn()
const mockCollapseDataPanel = vi.fn()

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    columns: ref(['Name', 'Value']),
    columnTypes: ref(['string', 'number']),
  }),
}))

vi.mock('@/composables/useEditorPanel', () => ({
  useEditorPanel: () => ({
    selectedColumnIndex: ref(-1),
    selectColumn: mockSelectColumn,
    dataPanelMode: ref('docked'),
    dataPanelTab: ref('column'),
    dataPanelOpen: ref(true),
    openDataPanel: mockOpenDataPanel,
    collapseDataPanel: mockCollapseDataPanel,
  }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  LayoutBottomDrawer: { template: '<div class="drawer-stub"><slot /></div>', props: ['modelValue'] },
  useBreakpoint: () => ({ isNarrow: ref(false) }),
}))

function mountPanel() {
  return mount(DataStructurePanel, {
    global: {
      stubs: {
        DataCheckTable: { template: '<div class="table-stub" />' },
        DataColumnPills: { template: '<div class="pills-stub" />', props: ['columns', 'columnTypes', 'selected'], emits: ['select'] },
        DataSideIconRail: { template: '<div class="icon-rail-stub" />', props: ['horizontal'] },
        DataSidePanel: { template: '<div class="side-panel-stub" />', props: ['collapsed'] },
        DataFloatingPanel: { template: '<div class="floating-panel-stub" />', props: ['containerRef'] },
        DataColumnSettings: { template: '<div class="column-settings-stub" />' },
        DataTransformPipeline: { template: '<div class="transforms-stub" />' },
        DataParseSettings: { template: '<div class="parse-settings-stub" />' },
        DataRecommendations: { template: '<div class="reco-stub" />' },
        PanelTabBar: { template: '<div class="tab-bar-stub" />', props: ['tabs', 'modelValue', 'sticky'] },
      },
    },
  })
}

describe('DataStructurePanel', () => {
  beforeEach(() => {
    mockSelectColumn.mockClear()
    mockOpenDataPanel.mockClear()
  })

  it('renders column pills', () => {
    const w = mountPanel()
    expect(w.find('.pills-stub').exists()).toBe(true)
  })

  it('renders data table', () => {
    const w = mountPanel()
    expect(w.find('.table-stub').exists()).toBe(true)
  })

  it('renders side icon rail on desktop', () => {
    const w = mountPanel()
    expect(w.find('.icon-rail-stub').exists()).toBe(true)
  })

  it('renders side panel on desktop', () => {
    const w = mountPanel()
    expect(w.find('.side-panel-stub').exists()).toBe(true)
  })
})
