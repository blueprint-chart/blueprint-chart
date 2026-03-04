import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DataUploadCard from './DataUploadCard.vue'

vi.mock('@blueprint-chart/lib', () => ({
  samples: [],
}))

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    rawInput: { value: '' },
  }),
}))

const fakeSample = { id: 'test', title: 'Test', tsvData: 'a\tb\n1\t2', dsl: 'bar-vertical {}', chartType: 'bar-vertical', serializedData: '', description: '' }

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
    const btn = w.find('.upload-card__paste-btn')
    expect(btn.exists()).toBe(true)
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
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
    const tabs = w.findAll('.input-card__tab')
    await tabs[2].trigger('click')
    // Re-mount with samples visible — the stub auto-emits on setup
    await w.vm.$nextTick()
    const emitted = w.emitted('sample')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(fakeSample)
  })
})
