import { withoutTransitions } from './withoutTransitions'

describe('withoutTransitions', () => {
  it('removes the freeze style even when apply throws', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => callback())
    expect(() => withoutTransitions(() => {
      throw new Error('boom')
    })).toThrow('boom')
    expect(document.head.querySelector('style')).toBeNull()
    vi.unstubAllGlobals()
  })
})
