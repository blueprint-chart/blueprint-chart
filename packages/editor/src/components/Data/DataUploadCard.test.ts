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
})
