import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DataInsightBadges from './DataInsightBadges.vue'
import type { ColumnType } from '@/composables/useDataParser'

function mountBadges(props = {}) {
  return mount(DataInsightBadges, {
    props: {
      columns: ['Name', 'Value'],
      rows: [['Apples', '42'], ['Bananas', '58']],
      columnTypes: ['string', 'number'] as ColumnType[],
      ...props,
    },
    global: {
      stubs: {
        BTooltip: true,
      },
    },
  })
}

// Generate data that follows Benford's distribution
function benfordRows(n: number): string[][] {
  const expected = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046]
  const rows: string[][] = []
  let idx = 0
  for (let d = 1; d <= 9; d++) {
    const count = Math.round(expected[d] * n)
    for (let i = 0; i < count; i++) {
      rows.push([`item${idx}`, `${d}${idx}`])
      idx++
    }
  }
  while (rows.length < n) {
    rows.push([`item${idx}`, `1${idx}`])
    idx++
  }
  return rows.slice(0, n)
}

// Generate uniform leading digits
function uniformRows(n: number): string[][] {
  return Array.from({ length: n }, (_, i) => [`item${i}`, `${(i % 9) + 1}00`])
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
      columnTypes: ['number', 'number', 'number'] as ColumnType[],
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

  it('shows green Benford badge when data passes', () => {
    const rows = benfordRows(100)
    const w = mountBadges({
      columns: ['Name', 'Value'],
      rows,
      columnTypes: ['string', 'number'] as ColumnType[],
    })
    const badge = w.find('.data-insight-badge--benford-ok')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain("Benford's law")
  })

  it('shows yellow Benford badge when column is suspicious', () => {
    const rows = uniformRows(90)
    const w = mountBadges({
      columns: ['Name', 'Value'],
      rows,
      columnTypes: ['string', 'number'] as ColumnType[],
    })
    const badge = w.find('.data-insight-badge--benford-warn')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain("Benford's law")
  })

  it('hides Benford badge when not enough numeric data', () => {
    const w = mountBadges({
      columns: ['Name', 'Value'],
      rows: [['A', '1'], ['B', '2']],
      columnTypes: ['string', 'number'] as ColumnType[],
    })
    expect(w.find('.data-insight-badge--benford-ok').exists()).toBe(false)
    expect(w.find('.data-insight-badge--benford-warn').exists()).toBe(false)
  })

  it('Benford badge has tooltip element', () => {
    const rows = benfordRows(100)
    const w = mountBadges({
      columns: ['Name', 'Value'],
      rows,
      columnTypes: ['string', 'number'] as ColumnType[],
    })
    const badge = w.find('.data-insight-badge--benford-ok')
    expect(badge.exists()).toBe(true)
    expect(badge.findComponent({ name: 'BTooltip' }).exists()).toBe(true)
  })
})
