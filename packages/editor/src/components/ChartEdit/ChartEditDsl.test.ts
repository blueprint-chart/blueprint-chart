import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import ChartEditDsl from './ChartEditDsl.vue'

const useDslEditorMock = vi.fn()
vi.mock('@/composables/useDslEditor', () => ({
  useDslEditor: (el: unknown) => useDslEditorMock(el),
}))

describe('ChartEditDsl', () => {
  it('renders the editor mount point and wires useDslEditor', () => {
    useDslEditorMock.mockReturnValue({ purge: vi.fn(), canPurge: ref(false) })
    const wrapper = shallowMount(ChartEditDsl)
    expect(wrapper.find('div.flex-grow-1').exists()).toBe(true)
    expect(useDslEditorMock).toHaveBeenCalledTimes(1)
  })

  it('no longer renders the legacy inline error block', () => {
    useDslEditorMock.mockReturnValue({ purge: vi.fn(), canPurge: ref(false) })
    const wrapper = shallowMount(ChartEditDsl)
    expect(wrapper.find('.text-danger').exists()).toBe(false)
  })

  it('renders a purge button, disabled when canPurge is false', async () => {
    useDslEditorMock.mockReturnValue({ purge: vi.fn(), canPurge: ref(false) })
    const wrapper = shallowMount(ChartEditDsl)
    const purgeBtn = wrapper.find('.chart-edit-dsl__purge')
    expect(purgeBtn.exists()).toBe(true)
    // useDslEditor is mocked to return canPurge=false; this asserts the disabled binding renders.
    expect(purgeBtn.attributes('disabled')).toBeDefined()
  })
})
