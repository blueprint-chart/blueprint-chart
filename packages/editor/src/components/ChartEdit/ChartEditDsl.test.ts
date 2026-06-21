import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ChartEditDsl from './ChartEditDsl.vue'

const useDslEditorMock = vi.fn()
vi.mock('@/composables/useDslEditor', () => ({
  useDslEditor: (el: unknown) => useDslEditorMock(el),
}))

describe('ChartEditDsl', () => {
  it('renders the editor mount point and wires useDslEditor', () => {
    const wrapper = shallowMount(ChartEditDsl)
    expect(wrapper.find('div.flex-grow-1').exists()).toBe(true)
    expect(useDslEditorMock).toHaveBeenCalledTimes(1)
  })

  it('no longer renders the legacy inline error block', () => {
    const wrapper = shallowMount(ChartEditDsl)
    expect(wrapper.find('.text-danger').exists()).toBe(false)
  })
})
