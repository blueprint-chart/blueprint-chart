import { mount } from '@vue/test-utils'
import LayoutBottomDrawer from './LayoutBottomDrawer.vue'

/** #114: the drawer had no role, no Escape handler and no close button. */
describe('LayoutBottomDrawer accessibility (#114)', () => {
  function open() {
    return mount(LayoutBottomDrawer, {
      props: { modelValue: true, title: 'Edit panel' },
      attachTo: document.body,
    })
  }

  it('announces itself as a modal dialog', () => {
    const wrapper = open()
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-label')).toBe('Edit panel')
    wrapper.unmount()
  })

  it('offers a close button', async () => {
    const wrapper = open()
    const close = wrapper.find('[aria-label="Close panel"]')
    expect(close.exists()).toBe(true)
    await close.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('closes on Escape', async () => {
    const wrapper = open()
    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('hides the backdrop from assistive technology', () => {
    const wrapper = open()
    expect(wrapper.find('.layout-bottom-drawer__backdrop').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('moves focus into the drawer when it opens', async () => {
    const wrapper = open()
    await nextTick()
    await nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close panel')
    wrapper.unmount()
  })
})
