import { mount } from '@vue/test-utils'
import PalettesCardChip from './PalettesCardChip.vue'

function mountChip() {
  return mount(PalettesCardChip, {
    props: { label: 'Light 4.5:1', status: 'pass', detail: 'Meets WCAG AA.' },
    global: { stubs: { teleport: true } },
  })
}

describe('PalettesCardChip', () => {
  it('is reachable with the keyboard', () => {
    expect(mountChip().attributes('tabindex')).toBe('0')
  })

  it('mounts its tooltip on focus', async () => {
    const wrapper = mountChip()
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(false)
    await wrapper.trigger('focus')
    expect(wrapper.findComponent({ name: 'BTooltip' }).exists()).toBe(true)
  })
})
