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

const mockDataTable = {
  rawInput: { value: '' },
  sourceFormat: { value: 'delimited' as string },
  columns: { value: [] as string[] },
  rows: { value: [] as string[][] },
}

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => mockDataTable,
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
    mockDataTable.columns.value = []
    mockDataTable.rows.value = []
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
    mockDataTable.columns.value = ['label', 'New York', 'Detroit']
    mockDataTable.rows.value = [['2000', '5', '3.8']]

    const w = mountCard()
    const textarea = w.find('.upload-card__paste__wrap__area')
    const value = (textarea.element as HTMLTextAreaElement).value
    expect(value).not.toContain('=')
    expect(value).toBe('label\tNew York\tDetroit\n2000\t5\t3.8')
  })

  it('shows raw input when source format is delimited', () => {
    mockDataTable.rawInput.value = 'Name\tValue\nApples\t42'
    mockDataTable.sourceFormat.value = 'delimited'
    mockDataTable.columns.value = ['Name', 'Value']
    mockDataTable.rows.value = [['Apples', '42']]

    const w = mountCard()
    const textarea = w.find('.upload-card__paste__wrap__area')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Name\tValue\nApples\t42')
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
