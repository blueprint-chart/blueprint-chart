import { describe, it, expect } from 'vitest'
import { applyLayoutConstraints } from './layout-constraints'
import { DslNodeType } from '../enums'
import type { PropertyNode } from '../dsl/types'

function makeProps(entries: Record<string, string | number>): PropertyNode[] {
  return Object.entries(entries).map(([key, value]) => ({
    type: DslNodeType.Property,
    key, value, isPercentage: false,
  }))
}

describe('applyLayoutConstraints', () => {
  it('returns false when no properties', () => {
    const el = document.createElement('div')
    const result = applyLayoutConstraints(el, undefined, {})
    expect(result.constrained).toBe(false)
    expect(el.style.aspectRatio).toBe('')
  })

  it('applies aspect-ratio mode', () => {
    const el = document.createElement('div')
    const props = makeProps({ heightMode: 'aspect-ratio', aspectRatio: '16:9' })
    const result = applyLayoutConstraints(el, props, {})
    expect(result.constrained).toBe(true)
    expect(el.style.aspectRatio).toBe('16 / 9')
    expect(el.style.height).toBe('auto')
    expect(el.style.display).toBe('flex')
  })

  it('applies fixed height mode', () => {
    const el = document.createElement('div')
    const props = makeProps({ heightMode: 'fixed', fixedHeight: 400 })
    const result = applyLayoutConstraints(el, props, {})
    expect(result.constrained).toBe(true)
    expect(el.style.height).toBe('400px')
  })

  it('skips when ignoreLayout is set', () => {
    const el = document.createElement('div')
    const props = makeProps({ heightMode: 'fixed', fixedHeight: 400 })
    const result = applyLayoutConstraints(el, props, { ignoreLayout: true })
    expect(result.constrained).toBe(false)
    expect(el.style.height).toBe('')
  })

  it('ignores invalid aspectRatio', () => {
    const el = document.createElement('div')
    const props = makeProps({ heightMode: 'aspect-ratio', aspectRatio: 'bogus' })
    const result = applyLayoutConstraints(el, props, {})
    expect(result.constrained).toBe(false)
  })

  // L7: dropping the aspectRatio constraint clears the previously-applied inline style
  it('clears previously applied aspect-ratio when next call has no constraint', () => {
    const el = document.createElement('div')
    applyLayoutConstraints(el, makeProps({ heightMode: 'aspect-ratio', aspectRatio: '16:9' }), {})
    expect(el.style.aspectRatio).toBe('16 / 9')

    // Second call: no layout properties. Inline style must be wiped.
    const result = applyLayoutConstraints(el, [], {})
    expect(result.constrained).toBe(false)
    expect(el.style.aspectRatio).toBe('')
    expect(el.style.height).toBe('')
    expect(el.style.display).toBe('')
  })

  // L7: dropping fixed height also clears it
  it('clears previously applied fixed height when next call has no constraint', () => {
    const el = document.createElement('div')
    applyLayoutConstraints(el, makeProps({ heightMode: 'fixed', fixedHeight: 320 }), {})
    expect(el.style.height).toBe('320px')

    applyLayoutConstraints(el, [], {})
    expect(el.style.height).toBe('')
    expect(el.style.display).toBe('')
  })

  // L7: ignoreLayout still clears previously-applied keys
  it('clears applied styles when ignoreLayout is set on a follow-up call', () => {
    const el = document.createElement('div')
    applyLayoutConstraints(el, makeProps({ heightMode: 'fixed', fixedHeight: 400 }), {})
    expect(el.style.height).toBe('400px')

    applyLayoutConstraints(el, makeProps({ heightMode: 'fixed', fixedHeight: 400 }), { ignoreLayout: true })
    expect(el.style.height).toBe('')
  })
})
