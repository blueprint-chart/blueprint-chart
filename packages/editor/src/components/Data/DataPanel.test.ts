import { mount, type VueWrapper } from '@vue/test-utils'
import DataPanel from './DataPanel.vue'

const uploadCard = (w: VueWrapper) => w.findComponent('.upload-card') as VueWrapper

const mockSetDataView = vi.fn()
const mockLoadParsed = vi.fn()
const mockApplyDsl = vi.fn()
const mockNext = vi.fn()
const mockUpdateScene = vi.fn()
const dataViewRef = ref('upload')
const rawInputRef = ref('')
const activeSceneRef = ref<{ id: string, name: string | null } | null>(null)
const activeIndexRef = ref(-1)

vi.mock('@/stores/editorPanel', () => ({
  useEditorPanel: () => ({
    dataView: dataViewRef,
    setDataView: mockSetDataView,
  }),
}))

const columnsRef = ref<string[]>([])
const baseDataRef = ref('')

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({
    rawInput: rawInputRef,
    loadParsed: mockLoadParsed,
    columns: columnsRef,
    rows: { value: [] },
    columnTypes: { value: [] },
    sourceFormat: ref('delimited'),
    sourceLabel: ref(''),
    serialize: () => '"A" = 1',
  }),
  serializeTableData: vi.fn(() => '"A" = 1'),
}))

vi.mock('@/stores/scenes', () => ({
  useScenes: () => ({
    activeScene: activeSceneRef,
    activeIndex: activeIndexRef,
    update: mockUpdateScene,
    scenes: ref([]),
  }),
}))

vi.mock('@/composables/useDslSync', () => ({
  useDslSync: () => ({
    applyDsl: mockApplyDsl,
  }),
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({
    data: baseDataRef,
    _base: { data: baseDataRef },
  }),
}))

vi.mock('@/stores/wizard', () => ({
  useWizard: () => ({
    next: mockNext,
  }),
}))

vi.mock('@/composables/useDataParser', () => ({
  parseDelimited: vi.fn(() => ({ columns: ['A'], rows: [['1']], columnTypes: ['number'] })),
  parseBpcData: vi.fn(() => ({ columns: ['label', 'value'], rows: [['A', '1']], columnTypes: ['string', 'number'] })),
}))

vi.mock('@/stores/parseOptions', () => ({
  useParseOptions: () => ({
    firstRowIsHeader: ref(true),
    delimiter: ref('auto'),
    decimalSeparator: ref('.'),
    treatEmptyAsNull: ref(true),
    trimWhitespace: ref(true),
    setOption: vi.fn(),
    reset: vi.fn(),
  }),
}))

vi.mock('@blueprint-chart/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/lib')>()
  return {
    ...actual,
    samples: [],
  }
})

vi.mock('@/stores/chartSession', () => ({
  useChartSession: () => ({
    loadSample: vi.fn(),
  }),
}))

function mountPanel() {
  dataViewRef.value = 'upload'
  rawInputRef.value = ''
  columnsRef.value = []
  activeSceneRef.value = null
  activeIndexRef.value = -1
  mockSetDataView.mockClear()
  mockLoadParsed.mockClear()
  mockUpdateScene.mockClear()
  return mount(DataPanel, {
    global: {
      stubs: {
        DataUploadCard: { template: '<div class="upload-card" />', emits: ['loaded', 'bpc', 'sample', 'cancel'] },
        DataStructurePanel: { template: '<div class="structure-panel" />' },
      },
    },
  })
}

describe('DataPanel', () => {
  it('shows upload card when dataView is upload', () => {
    const w = mountPanel()
    expect(w.find('.upload-card').exists()).toBe(true)
    expect(w.find('.structure-panel').exists()).toBe(false)
  })

  it('switches to structure view on mount when data exists', () => {
    columnsRef.value = ['A', 'B']
    mount(DataPanel, {
      global: {
        stubs: {
          DataUploadCard: { template: '<div class="upload-card" />' },
          DataStructurePanel: { template: '<div class="structure-panel" />' },
        },
      },
    })
    expect(mockSetDataView).toHaveBeenCalledWith('structure')
  })

  it('resets to upload view on mount when no data exists', () => {
    dataViewRef.value = 'structure'
    columnsRef.value = []
    mockSetDataView.mockClear()
    mount(DataPanel, {
      global: {
        stubs: {
          DataUploadCard: { template: '<div class="upload-card" />' },
          DataStructurePanel: { template: '<div class="structure-panel" />' },
        },
      },
    })
    expect(mockSetDataView).toHaveBeenCalledWith('upload')
  })

  it('shows structure panel when dataView is structure', () => {
    dataViewRef.value = 'structure'
    const w = mount(DataPanel, {
      global: {
        stubs: {
          DataUploadCard: { template: '<div class="upload-card" />' },
          DataStructurePanel: { template: '<div class="structure-panel" />' },
        },
      },
    })
    expect(w.find('.structure-panel').exists()).toBe(true)
    expect(w.find('.upload-card').exists()).toBe(false)
  })

  it('syncs loaded data into the chart data block, so a save reaches storage', async () => {
    baseDataRef.value = '"old" = 1'
    const w = mountPanel()

    uploadCard(w).vm.$emit('loaded', 'A\n1', 'test.csv')
    await nextTick()

    expect(baseDataRef.value).toBe('"A" = 1')
  })

  it('switches to structure view when cancel is emitted', async () => {
    dataViewRef.value = 'upload'
    columnsRef.value = ['A']
    mockSetDataView.mockClear()
    const w = mountPanel()
    uploadCard(w).vm.$emit('cancel')
    await nextTick()
    expect(mockSetDataView).toHaveBeenCalledWith('structure')
  })

  describe('scene mode data loading', () => {
    it('stores serialized data on scene when onLoaded fires in scene mode', async () => {
      activeSceneRef.value = { id: 'abc', name: null }
      activeIndexRef.value = 0
      dataViewRef.value = 'upload'
      columnsRef.value = []
      mockUpdateScene.mockClear()
      mockSetDataView.mockClear()

      const w = mount(DataPanel, {
        global: {
          stubs: {
            DataUploadCard: { template: '<div class="upload-card" />', emits: ['loaded', 'bpc', 'sample'] },
            DataStructurePanel: { template: '<div class="structure-panel" />' },
          },
        },
      })

      uploadCard(w).vm.$emit('loaded', 'A\n1', 'test.csv')
      await nextTick()
      expect(mockUpdateScene).toHaveBeenCalledWith(0, { data: '"A" = 1' })
      expect(mockSetDataView).toHaveBeenCalledWith('structure')
      expect(mockLoadParsed).not.toHaveBeenCalled()
    })

    it('stores sample serializedData on scene when onSampleLoaded fires in scene mode', async () => {
      activeSceneRef.value = { id: 'abc', name: null }
      activeIndexRef.value = 0
      dataViewRef.value = 'upload'
      mockUpdateScene.mockClear()
      mockSetDataView.mockClear()

      const w = mount(DataPanel, {
        global: {
          stubs: {
            DataUploadCard: { template: '<div class="upload-card" />', emits: ['loaded', 'bpc', 'sample'] },
            DataStructurePanel: { template: '<div class="structure-panel" />' },
          },
        },
      })

      const sample = { id: 's1', title: 'Test', description: '', chartType: 'bar', tsvData: '', serializedData: '"X" = 5', dsl: '', source: '' }
      uploadCard(w).vm.$emit('sample', sample)
      await nextTick()
      expect(mockUpdateScene).toHaveBeenCalledWith(0, { data: '"X" = 5' })
      expect(mockSetDataView).toHaveBeenCalledWith('structure')
    })
  })
})
