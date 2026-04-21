import { mount } from '@vue/test-utils'
import PanelDrawer from './PanelDrawer.vue'

vi.mock('@blueprint-chart/ui', () => ({
  LayoutBottomDrawer: {
    template: '<div v-if="modelValue" class="layout-bottom-drawer"><div v-if="title" class="layout-bottom-drawer__title">{{ title }}</div><slot /><button class="stub-backdrop" @click="$emit(\'update:modelValue\', false)" /></div>',
    props: ['modelValue', 'title'],
    emits: ['update:modelValue'],
  },
}))

describe('PanelDrawer', () => {
  it('renders the sheet when modelValue is true', () => {
    const w = mount(PanelDrawer, { props: { modelValue: true } })
    expect(w.find('.layout-bottom-drawer').exists()).toBe(true)
  })

  it('renders nothing when modelValue is false', () => {
    const w = mount(PanelDrawer, { props: { modelValue: false } })
    expect(w.find('.layout-bottom-drawer').exists()).toBe(false)
  })

  it('forwards the title prop to LayoutBottomDrawer', () => {
    const w = mount(PanelDrawer, { props: { modelValue: true, title: 'Drawer title' } })
    expect(w.find('.layout-bottom-drawer__title').text()).toBe('Drawer title')
  })

  it('renders default slot inside the drawer body', () => {
    const w = mount(PanelDrawer, {
      props: { modelValue: true },
      slots: { default: '<div class="content">Body</div>' },
    })
    expect(w.find('.panel-drawer__body .content').exists()).toBe(true)
    expect(w.find('.content').text()).toBe('Body')
  })

  it('renders header slot above the body', () => {
    const w = mount(PanelDrawer, {
      props: { modelValue: true },
      slots: {
        header: '<div class="header">Header</div>',
        default: '<div class="body">Body</div>',
      },
    })
    const html = w.html()
    expect(html.indexOf('class="header"')).toBeLessThan(html.indexOf('class="body"'))
  })

  it('emits update:modelValue false when the backdrop closes the drawer', async () => {
    const w = mount(PanelDrawer, { props: { modelValue: true } })
    await w.find('.stub-backdrop').trigger('click')
    expect(w.emitted('update:modelValue')).toBeTruthy()
    expect(w.emitted('update:modelValue')![0]).toEqual([false])
  })
})
