import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DataStructurePanel from './DataStructurePanel.vue'

const mockOpenDataPanel = vi.fn()
const mockCollapseDataPanel = vi.fn()

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    columns: ref(['Name', 'Value']),
    rows: ref([['Apples', '42'], ['Bananas', '58']]),
    columnTypes: ref(['string', 'number']),
    sourceLabel: ref('Pasted'),
  }),
}))

vi.mock('@/composables/useEditorPanel', () => ({
  useEditorPanel: () => ({
    selectedColumnIndex: ref(-1),
    selectColumn: vi.fn(),
    dataPanelMode: ref('docked'),
    dataPanelTab: ref('column'),
    dataPanelOpen: ref(true),
    openDataPanel: mockOpenDataPanel,
    collapseDataPanel: mockCollapseDataPanel,
    setDataView: vi.fn(),
  }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  LayoutBottomDrawer: { template: '<div class="drawer-stub"><slot /></div>', props: ['modelValue'] },
  ButtonIcon: { template: '<button class="btn-icon-stub"><slot /></button>', props: ['iconLeft', 'label', 'variant', 'size'] },
  useBreakpoint: () => ({ isNarrow: ref(false) }),
}))

function mountPanel() {
  return mount(DataStructurePanel, {
    global: {
      stubs: {
        DataCheckTable: { template: '<div class="table-stub" />' },
        DataInsightBadges: { template: '<div class="badges-stub" />', props: ['columns', 'rows'] },
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
    mockOpenDataPanel.mockClear()
  })

  it('renders insight badges', () => {
    const w = mountPanel()
    expect(w.find('.badges-stub').exists()).toBe(true)
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
