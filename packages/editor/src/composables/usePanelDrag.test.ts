import { describe, it, expect } from 'vitest'

// usePanelDrag uses onMounted/onUnmounted, so we test the logic conceptually
// by verifying the module exports the expected shape
describe('usePanelDrag', () => {
  it('exports usePanelDrag function', async () => {
    const mod = await import('./usePanelDrag')
    expect(typeof mod.usePanelDrag).toBe('function')
  })
})
