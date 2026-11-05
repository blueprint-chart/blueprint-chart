import { mount } from '@vue/test-utils'
import ExportDownloadFormatCard from './ExportDownloadFormatCard.vue'

function mountCard(selected: boolean) {
  return mount(ExportDownloadFormatCard, {
    props: { selected, icon: { template: '<i />' }, label: 'PNG', description: 'Raster', iconBg: '#000', iconColor: '#fff' },
    slots: { default: '<div class="opts">opts</div>' },
  })
}

describe('ExportDownloadFormatCard', () => {
  it.each([true, false])('header is a button with aria-expanded=%s', (selected) => {
    const header = mountCard(selected).find('button.format-card__header__select')
    expect(header.attributes('type')).toBe('button')
    expect(header.attributes('aria-expanded')).toBe(String(selected))
  })

  it('emits select when the header button is clicked', async () => {
    const w = mountCard(false)
    await w.find('button.format-card__header__select').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })

  it('emits download without select', async () => {
    const w = mountCard(false)
    await w.find('.format-card__header button:not(.format-card__header__select)').trigger('click')
    expect(w.emitted('download')).toHaveLength(1)
    expect(w.emitted('select')).toBeUndefined()
  })
})
