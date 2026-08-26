import { describe, it, expect, beforeEach } from 'vitest'
import { createTooltipPlugin, makeDefaultFormat } from './tooltip'

describe('makeDefaultFormat', () => {
  it('formats value with numberFormat for label+value datum', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ label: 'A', value: 1234 })).toBe('A: 1,234')
  })

  it('formats value with numberFormat for series+value datum', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ series: 'S1', value: 1234 })).toBe('S1: 1,234')
  })

  it('formats value with pipe-delimited numberFormat', () => {
    const fmt = makeDefaultFormat('$|,.0f|')
    expect(fmt({ label: 'A', value: 1234 })).toBe('A: $1,234')
  })

  it('formats value with suffix via pipe syntax', () => {
    const fmt = makeDefaultFormat('|.1f|%')
    expect(fmt({ label: 'Jan 2023', value: 6.4 })).toBe('Jan 2023: 6.4%')
  })

  it('formats pie arc datum with numberFormat', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ data: 5000 })).toBe('5,000')
  })

  it('formats value-only datum with numberFormat', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ value: 9999 })).toBe('9,999')
  })

  it('falls back to String() without numberFormat', () => {
    const fmt = makeDefaultFormat()
    expect(fmt({ label: 'A', value: 1234 })).toBe('A: 1234')
  })

  it('falls back to String() for non-numeric values', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ label: 'A', value: 'text' })).toBe('A: text')
  })
})

describe('createTooltipPlugin', () => {
  beforeEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    const existing = document.getElementById('bc-tooltip-styles')
    if (existing) {
      existing.remove()
    }
  })

  it('creates and removes tooltip element', () => {
    const plugin = createTooltipPlugin()
    plugin.install!()

    expect(document.querySelector('.bc-tooltip')).not.toBeNull()

    plugin.destroy!()
    expect(document.querySelector('.bc-tooltip')).toBeNull()
  })

  it('injects styles once', () => {
    const plugin = createTooltipPlugin()
    plugin.install!()
    const plugin2 = createTooltipPlugin()
    plugin2.install!()

    const styles = document.querySelectorAll('#bc-tooltip-styles')
    expect(styles).toHaveLength(1)

    plugin.destroy!()
    plugin2.destroy!()
  })
})

describe('makeDefaultFormat multi-series data', () => {
  it('names the series on a datum carrying both label and series', () => {
    const fmt = makeDefaultFormat(',.0f')
    const bar = { label: 'USA', series: 'Gold', seriesName: 'Gold', value: 40 }
    expect(fmt(bar)).toBe('Gold – USA: 40')
  })

  it('keeps the label-only format when there is no series', () => {
    const fmt = makeDefaultFormat(',.0f')
    expect(fmt({ label: 'USA', value: 40 })).toBe('USA: 40')
  })
})
