import { ChartType } from '@blueprint-chart/lib'
import { mount } from '@vue/test-utils'
import DataUploadCard from './DataUploadCard.vue'

vi.mock('@blueprint-chart/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/lib')>()
  return {
    ...actual,
    samples: [],
  }
})

const columnsRef = ref<string[]>([])
const rowsRef = ref<string[][]>([])
const displayColumnsRef = ref<string[]>([])
const displayRowsRef = ref<string[][]>([])
const mockDataTable = {
  rawInput: { value: '' },
  sourceFormat: { value: 'delimited' as string },
  columns: columnsRef,
  rows: rowsRef,
  displayColumns: displayColumnsRef,
  displayRows: displayRowsRef,
}

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => mockDataTable,
}))

const activeIndexRef = ref(-1)
const scenesRef = ref<{ id: string, data?: string }[]>([])

vi.mock('@/stores/scenes', () => ({
  useScenes: () => ({
    activeIndex: activeIndexRef,
    scenes: scenesRef,
  }),
}))

vi.mock('@/utils/scenes', () => ({
  resolveScene: (scenes: { data?: string }[], index: number) => {
    if (index < 0 || index >= scenes.length) {
      return null
    }
    const resolved: { data?: string } = {}
    for (let i = 0; i <= index; i++) {
      if (scenes[i]?.data !== undefined) {
        resolved.data = scenes[i].data
      }
    }
    return resolved
  },
}))

const fakeSample = { id: 'test', title: 'Test', tsvData: 'a\tb\n1\t2', dsl: 'bar-vertical {}', chartType: ChartType.BarVertical, serializedData: '', description: '' }

function mountCard() {
  return mount(DataUploadCard, {
    global: {
      stubs: {
        DataUploadFileDrop: { template: '<div class="file-drop" />' },
        DataUploadSamples: { template: '<div class="samples" />' },
      },
    },
  })
}

describe('DataUploadCard', () => {
  beforeEach(() => {
    mockDataTable.rawInput.value = ''
    mockDataTable.sourceFormat.value = 'delimited'
    columnsRef.value = []
    rowsRef.value = []
    displayColumnsRef.value = []
    displayRowsRef.value = []
    activeIndexRef.value = -1
    scenesRef.value = []
  })

  it('renders heading', () => {
    const w = mountCard()
    expect(w.find('.upload-card__title').text()).toBe('Add your data')
  })

  it('shows paste area by default', () => {
    const w = mountCard()
    expect(w.find('.upload-card__paste').exists()).toBe(true)
  })

  it('has centered container', () => {
    const w = mountCard()
    expect(w.find('.upload-card').exists()).toBe(true)
  })

  it('shows load button disabled when paste is empty', () => {
    const w = mountCard()
    const btn = w.find('.upload-card__paste__footer__btn')
    expect(btn.exists()).toBe(true)
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows TSV instead of BPC when source format is bpc', () => {
    mockDataTable.rawInput.value = '_series = "New York","Detroit"\n"2000" = 5,3.8'
    mockDataTable.sourceFormat.value = 'bpc'
    columnsRef.value = ['label', 'New York', 'Detroit']
    rowsRef.value = [['2000', '5', '3.8']]

    const w = mountCard()
    const textarea = w.find('.upload-card__paste__wrap__area')
    const value = (textarea.element as HTMLTextAreaElement).value
    expect(value).not.toContain('=')
    expect(value).toBe('label\tNew York\tDetroit\n2000\t5\t3.8')
  })

  it('shows raw input when source format is delimited', () => {
    mockDataTable.rawInput.value = 'Name\tValue\nApples\t42'
    mockDataTable.sourceFormat.value = 'delimited'
    columnsRef.value = ['Name', 'Value']
    rowsRef.value = [['Apples', '42']]

    const w = mountCard()
    const textarea = w.find('.upload-card__paste__wrap__area')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Name\tValue\nApples\t42')
  })

  it('shows back button when data is already loaded', () => {
    columnsRef.value = ['Name', 'Value']
    const w = mountCard()
    expect(w.find('.upload-card__back').exists()).toBe(true)
  })

  it('hides back button when no data is loaded', () => {
    const w = mountCard()
    expect(w.find('.upload-card__back').exists()).toBe(false)
  })

  it('shows scene display data in paste area when scene has custom data', () => {
    mockDataTable.rawInput.value = 'Name\tValue\nApples\t42'
    columnsRef.value = ['Name', 'Value']
    rowsRef.value = [['Apples', '42']]
    // Scene provides different data — displayColumns/displayRows reflect scene data
    displayColumnsRef.value = ['label', 'X', 'Y']
    displayRowsRef.value = [['2020', '5', '10'], ['2021', '8', '12']]
    // Set up scene with custom data so hasSceneData() returns true
    scenesRef.value = [{ id: '1', data: '"X" = 5\n"Y" = 10' }]
    activeIndexRef.value = 0

    const w = mountCard()
    const textarea = w.find('.upload-card__paste__wrap__area')
    const value = (textarea.element as HTMLTextAreaElement).value
    expect(value).toContain('label\tX\tY')
    expect(value).toContain('2020\t5\t10')
  })

  it('emits cancel when back button is clicked', async () => {
    columnsRef.value = ['Name', 'Value']
    const w = mountCard()
    await w.find('.upload-card__back').trigger('click')
    expect(w.emitted('cancel')).toBeTruthy()
  })

  it('emits sample event when DataUploadSamples emits select', async () => {
    const w = mount(DataUploadCard, {
      global: {
        stubs: {
          DataUploadFileDrop: { template: '<div class="file-drop" />' },
          DataUploadSamples: {
            template: '<div class="samples" />',
            emits: ['select'],
            setup(_: unknown, { emit }: { emit: (e: string, v: unknown) => void }) {
              emit('select', fakeSample)
            },
          },
        },
      },
    })
    // Switch to samples tab
    const tabs = w.findAll('.input-card__tabs__tab')
    await tabs[2].trigger('click')
    // Re-mount with samples visible — the stub auto-emits on setup
    await w.vm.$nextTick()
    const emitted = w.emitted('sample')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(fakeSample)
  })
})
