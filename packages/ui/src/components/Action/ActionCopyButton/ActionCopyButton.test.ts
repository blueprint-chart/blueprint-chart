import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionCopyButton from './ActionCopyButton.vue'

describe('ActionCopyButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders with default label', () => {
    const wrapper = mount(ActionCopyButton, { props: { text: 'hello' } })
    expect(wrapper.text()).toContain('Copy')
  })

  it('renders with custom label', () => {
    const wrapper = mount(ActionCopyButton, { props: { text: 'hello', label: 'Copy code' } })
    expect(wrapper.text()).toContain('Copy code')
  })

  it('copies text to clipboard on click', async () => {
    const wrapper = mount(ActionCopyButton, { props: { text: 'hello world' } })
    await wrapper.find('button').trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world')
  })

  it('shows Copied! after click', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ActionCopyButton, { props: { text: 'hello' } })
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Copied!')
    vi.advanceTimersByTime(1500)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Copy')
    vi.useRealTimers()
  })
})
