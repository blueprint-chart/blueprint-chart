import { mount } from '@vue/test-utils'
import DataColumnPills from './DataColumnPills.vue'

function mountPills(props = {}) {
  return mount(DataColumnPills, {
    props: {
      columns: ['Name', 'Value', 'Date'],
      columnTypes: ['string', 'number', 'date'] as ('string' | 'number' | 'date')[],
      ...props,
    },
  })
}

describe('DataColumnPills', () => {
  it('renders a pill for each column', () => {
    const w = mountPills()
    const pills = w.findAll('.data-column-pill')
    expect(pills.length).toBe(3)
  })

  it('displays column name', () => {
    const w = mountPills()
    const pills = w.findAll('.data-column-pill')
    expect(pills[0].text()).toContain('Name')
    expect(pills[1].text()).toContain('Value')
  })

  it('applies correct dot class per type', () => {
    const w = mountPills()
    const dots = w.findAll('.data-column-pill__dot')
    expect(dots[0].classes()).toContain('data-column-pill__dot--string')
    expect(dots[1].classes()).toContain('data-column-pill__dot--number')
    expect(dots[2].classes()).toContain('data-column-pill__dot--date')
  })

  it('applies correct chip background class per type', () => {
    const w = mountPills()
    const pills = w.findAll('.data-column-pill')
    expect(pills[0].classes()).toContain('data-column-pill--string')
    expect(pills[1].classes()).toContain('data-column-pill--number')
    expect(pills[2].classes()).toContain('data-column-pill--date')
  })

  it('marks selected pill', () => {
    const w = mountPills({ selected: 1 })
    const pills = w.findAll('.data-column-pill')
    expect(pills[1].classes()).toContain('data-column-pill--selected')
    expect(pills[0].classes()).not.toContain('data-column-pill--selected')
  })

  it('displays type label', () => {
    const w = mountPills()
    const pills = w.findAll('.data-column-pill')
    expect(pills[0].text()).toContain('· string')
    expect(pills[1].text()).toContain('· number')
    expect(pills[2].text()).toContain('· date')
  })

  it('emits select with column index on click', async () => {
    const w = mountPills()
    await w.findAll('.data-column-pill')[2].trigger('click')
    expect(w.emitted('select')).toEqual([[2]])
  })
})
