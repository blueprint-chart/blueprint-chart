import { mount } from '@vue/test-utils'
import AddButton from './ButtonAdd.vue'

describe('AddButton', () => {
  it('emits click on click', async () => {
    const wrapper = mount(AddButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('renders label text', () => {
    const wrapper = mount(AddButton, { props: { label: 'Add item' } })
    expect(wrapper.text()).toContain('Add item')
  })

  it('slot overrides default text', () => {
    const wrapper = mount(AddButton, { slots: { default: 'Custom action' } })
    expect(wrapper.text()).toContain('Custom action')
  })
})
