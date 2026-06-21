import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
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
    // The positioned wrapper is a native div (so scoped CSS reliably applies);
    // the ButtonIcon lives inside it.
    expect(wrapper.find('.chart-edit-dsl__purge').exists()).toBe(true)
    // useDslEditor is mocked to return canPurge=false; assert the disabled binding reached the button.
    // (`disabled` is a fall-through attr on ButtonIcon, not a declared prop, so check the attribute.)
    const btn = wrapper.findComponent(ButtonIcon)
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('disabled')).toBeDefined()
  })
})
