import { mount } from '@vue/test-utils'
import PanelOpenButton from './PanelOpenButton.vue'

describe('PanelOpenButton', () => {
  it('renders the label', () => {
    const wrapper = mount(PanelOpenButton, {
      props: { label: 'Edit panel' },
    })
    expect(wrapper.text()).toContain('Edit panel')
  })

  it('emits open on click', async () => {
    const wrapper = mount(PanelOpenButton, {
      props: { label: 'Edit panel' },
    })
    await wrapper.find('.panel-open-button').trigger('click')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('does not emit open when disabled', async () => {
    const wrapper = mount(PanelOpenButton, {
      props: { label: 'Edit panel', disabled: true },
    })
    await wrapper.find('.panel-open-button').trigger('click')
    expect(wrapper.emitted('open')).toBeUndefined()
  })

  it('sets aria-label to the prop label', () => {
    const wrapper = mount(PanelOpenButton, {
      props: { label: 'Edit panel' },
    })
    expect(wrapper.find('.panel-open-button').attributes('aria-label')).toBe('Edit panel')
  })

  it('sets aria-disabled when disabled', () => {
    const wrapper = mount(PanelOpenButton, {
      props: { label: 'Edit panel', disabled: true },
    })
    expect(wrapper.find('.panel-open-button').attributes('aria-disabled')).toBe('true')
  })
})
