import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataInsightBadges from './DataInsightBadges.vue'

function mountBadges(props = {}) {
  return mount(DataInsightBadges, {
    props: {
      columns: ['Name', 'Value'],
      rows: [['Apples', '42'], ['Bananas', '58']],
      ...props,
    },
  })
}

describe('DataInsightBadges', () => {
  it('shows shape badge with col and row count', () => {
    const w = mountBadges()
    const shape = w.find('.data-insight-badge--shape')
    expect(shape.text()).toBe('2 cols · 2 rows')
  })

  it('updates shape when data changes', () => {
    const w = mountBadges({
      columns: ['A', 'B', 'C'],
      rows: [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']],
    })
    expect(w.find('.data-insight-badge--shape').text()).toBe('3 cols · 3 rows')
  })

  it('shows green quality badge when no missing values', () => {
    const w = mountBadges()
    const quality = w.find('.data-insight-badge--quality-ok')
    expect(quality.exists()).toBe(true)
    expect(quality.text()).toContain('No missing values')
  })

  it('shows yellow quality badge when values are missing', () => {
    const w = mountBadges({
      rows: [['Apples', '42'], ['Bananas', '']],
    })
    const quality = w.find('.data-insight-badge--quality-warn')
    expect(quality.exists()).toBe(true)
    expect(quality.text()).toContain('1 missing value')
  })

  it('pluralizes missing values count', () => {
    const w = mountBadges({
      rows: [['', ''], ['Bananas', '']],
    })
    expect(w.find('.data-insight-badge--quality-warn').text()).toContain('3 missing values')
  })

  it('shows check icon when quality is ok', () => {
    const w = mountBadges()
    expect(w.find('.data-insight-badge--quality-ok .data-insight-badge__icon').text()).toBe('✓')
  })

  it('shows warning icon when values are missing', () => {
    const w = mountBadges({ rows: [['', '42']] })
    expect(w.find('.data-insight-badge--quality-warn .data-insight-badge__icon').text()).toBe('⚠')
  })

  it('counts null and undefined as missing', () => {
    const rows = [['Apples', '42']] as string[][]
    rows[0][1] = undefined as unknown as string
    rows.push([null as unknown as string, '10'])
    const w = mountBadges({ rows })
    expect(w.find('.data-insight-badge--quality-warn').text()).toContain('2 missing values')
  })
})
