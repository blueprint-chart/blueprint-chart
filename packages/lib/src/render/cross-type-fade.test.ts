import { describe, it, expect, beforeEach } from 'vitest'
import { snapshotIfTypeChanged, commitCrossTypeFade, clearCrossTypeMarker } from './cross-type-fade'

describe('cross-type-fade', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('returns null on first render (no prior type)', () => {
    const overlay = snapshotIfTypeChanged(container, 'bar-vertical', true)
    expect(overlay).toBeNull()
  })

  it('returns null when transition is false', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    const overlay = snapshotIfTypeChanged(container, 'line', false)
    expect(overlay).toBeNull()
  })

  it('returns null when chart type unchanged', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    container.appendChild(document.createElement('svg'))
    const overlay = snapshotIfTypeChanged(container, 'bar-vertical', true)
    expect(overlay).toBeNull()
  })

  it('returns overlay when chart type changes and transition is true', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    container.appendChild(document.createElement('svg'))
    const overlay = snapshotIfTypeChanged(container, 'line', true)
    expect(overlay).not.toBeNull()
  })

  it('clearCrossTypeMarker removes the WeakMap entry', () => {
    commitCrossTypeFade(container, 'bar-vertical', null)
    clearCrossTypeMarker(container)
    container.appendChild(document.createElement('svg'))
    const overlay = snapshotIfTypeChanged(container, 'line', true)
    expect(overlay).toBeNull()
  })
})
