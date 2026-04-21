import { mount } from '@vue/test-utils'
import DataStructurePanel from './DataStructurePanel.vue'
import { useScenesStore } from '@/stores/scenes'

const mockOpenDataPanel = vi.fn()
const mockCloseDataPanel = vi.fn()

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({
    columns: ref(['Name', 'Value']),
    rows: ref([['Apples', '42'], ['Bananas', '58']]),
    columnTypes: ref(['string', 'number']),
    sourceLabel: ref('Pasted'),
  }),
}))

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    selectedColumnIndex: ref(-1),
    selectColumn: vi.fn(),
    dataPanelTab: ref('column'),
    dataPanelOpen: ref(true),
    openDataPanel: mockOpenDataPanel,
    closeDataPanel: mockCloseDataPanel,
    setDataView: vi.fn(),
  }),
}))

vi.mock('@/stores/panel', () => ({
  usePanel: () => ({
    mode: ref('docked'),
    close: vi.fn(),
  }),
  usePanelStore: () => ({
    mode: ref('docked'),
    dockedWidth: ref(330),
    floatingPosition: ref({ x: 16, y: 16 }),
    dock: vi.fn(),
    float: vi.fn(),
    close: vi.fn(),
  }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  LayoutBottomDrawer: { template: '<div class="drawer-stub"><slot /></div>', props: ['modelValue'] },
  ButtonIcon: { template: '<button class="btn-icon-stub"><slot /></button>', props: ['iconLeft', 'label', 'variant', 'size'] },
  useBreakpoint: () => ({ isNarrow: ref(false) }),
}))

const commonStubs = {
  DataCheckTable: { template: '<div class="table-stub" />' },
  DataInsightBadges: { template: '<div class="badges-stub" />', props: ['columns', 'rows'] },
  DataSideIconRail: { template: '<div class="icon-rail-stub" />', props: ['horizontal'] },
  PanelShell: { template: '<div class="panel-shell-stub"><slot /></div>', props: ['title', 'containerRef', 'showClose', 'drawerOpen'] },
  DataColumnSettings: { template: '<div class="column-settings-stub" />' },
  DataTransformPipeline: { template: '<div class="transforms-stub" />' },
  DataParseSettings: { template: '<div class="parse-settings-stub" />' },
  DataRecommendations: { template: '<div class="reco-stub" />' },
  PanelTabBar: { template: '<div class="tab-bar-stub" />', props: ['tabs', 'modelValue', 'sticky'] },
  PanelStepperFooter: { template: '<div class="stepper-footer-stub" />' },
}

function mountPanel() {
  return mount(DataStructurePanel, {
    global: {
      plugins: [createPinia()],
      stubs: commonStubs,
    },
  })
}

describe('DataStructurePanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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

  it('renders panel shell on desktop', () => {
    const w = mountPanel()
    expect(w.find('.panel-shell-stub').exists()).toBe(true)
  })

  it('always renders the replace data button', () => {
    const w = mountPanel()
    const buttons = w.findAll('.btn-icon-stub')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  describe('scene mode', () => {
    function mountInSceneMode(sceneOverrides: { data?: string, name?: string | null }[] = [{}], activeIdx = 0) {
      const pinia = createPinia()
      setActivePinia(pinia)
      const scenesStore = useScenesStore()
      for (const s of sceneOverrides) {
        const id = scenesStore.add()
        const idx = scenesStore.scenes.findIndex(sc => sc.id === id)
        if (s.data !== undefined || s.name !== undefined) {
          scenesStore.update(idx, s)
        }
      }
      scenesStore.setActive(activeIdx)
      return mount(DataStructurePanel, {
        global: {
          plugins: [pinia],
          stubs: commonStubs,
        },
      })
    }

    it('shows scene banner instead of badges', () => {
      const w = mountInSceneMode()
      expect(w.find('.data-structure-panel__main__scene-banner').exists()).toBe(true)
      expect(w.find('.badges-stub').exists()).toBe(false)
    })

    it('shows default banner when no scene has custom data', () => {
      const w = mountInSceneMode()
      expect(w.find('.data-structure-panel__main__scene-banner').text()).toContain('Scene override active.')
    })

    it('shows custom data banner when current scene has data', () => {
      const w = mountInSceneMode([{ data: '"A" = 1' }])
      expect(w.find('.data-structure-panel__main__scene-banner').text()).toContain('Custom data on this scene.')
    })

    it('shows inherited data banner when prior scene has data', () => {
      const w = mountInSceneMode([{ data: '"A" = 1', name: 'Intro' }, {}], 1)
      const text = w.find('.data-structure-panel__main__scene-banner').text()
      expect(text).toContain('Data inherited from Intro.')
    })

    it('shows replace data button in scene mode', () => {
      const w = mountInSceneMode()
      const buttons = w.findAll('.btn-icon-stub')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })
})
