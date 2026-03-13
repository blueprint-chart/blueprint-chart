import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DataPanel from './DataPanel.vue'

const mockSetDataView = vi.fn()
const mockLoadParsed = vi.fn()
const mockApplyDsl = vi.fn()
const mockNext = vi.fn()
const dataViewRef = ref('upload')
const rawInputRef = ref('')

vi.mock('@/composables/useEditorPanel', () => ({
  useEditorPanel: () => ({
    dataView: dataViewRef,
    setDataView: mockSetDataView,
  }),
}))

const columnsRef = ref<string[]>([])

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    rawInput: rawInputRef,
    loadParsed: mockLoadParsed,
    columns: columnsRef,
    rows: { value: [] },
    columnTypes: { value: [] },
    sourceFormat: ref('delimited'),
  }),
}))

vi.mock('@/composables/useDslSync', () => ({
  useDslSync: () => ({
    applyDsl: mockApplyDsl,
  }),
}))

vi.mock('@/composables/useChartConfig', () => ({
  useChartConfig: () => ({
    data: ref(''),
  }),
}))

vi.mock('@/composables/useWizard', () => ({
  useWizard: () => ({
    next: mockNext,
  }),
}))

vi.mock('@/composables/useDataParser', () => ({
  parseDelimited: vi.fn(() => ({ columns: ['A'], rows: [['1']], columnTypes: ['number'] })),
  parseBpcData: vi.fn(() => ({ columns: ['label', 'value'], rows: [['A', '1']], columnTypes: ['string', 'number'] })),
}))

vi.mock('@/composables/useParseOptions', () => ({
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

vi.mock('@blueprint-chart/lib', () => ({
  samples: [],
}))

vi.mock('@/composables/useChartSession', () => ({
  useChartSession: () => ({
    loadSample: vi.fn(),
  }),
}))

function mountPanel() {
  dataViewRef.value = 'upload'
  rawInputRef.value = ''
  columnsRef.value = []
  mockSetDataView.mockClear()
  mockLoadParsed.mockClear()
  return mount(DataPanel, {
    global: {
      stubs: {
        DataUploadCard: { template: '<div class="upload-card" />', emits: ['loaded', 'bpc'] },
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
})
