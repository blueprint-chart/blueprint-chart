import { describe, it, expect, beforeEach } from 'vitest'
import { createTooltipPlugin } from './tooltip'

function cleanupDom(): void {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
  const existing = document.getElementById('bc-tooltip-styles')
  if (existing) {
    existing.remove()
  }
}

describe('createTooltipPlugin: element lifecycle', () => {
  beforeEach(() => {
    cleanupDom()
  })

  it('creates and removes tooltip element', () => {
    const plugin = createTooltipPlugin()
    plugin.install!()
    expect(document.querySelector('.bc-tooltip')).not.toBeNull()
    plugin.destroy!()
    expect(document.querySelector('.bc-tooltip')).toBeNull()
  })
})

describe('createTooltipPlugin: style injection', () => {
  beforeEach(() => {
    cleanupDom()
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
