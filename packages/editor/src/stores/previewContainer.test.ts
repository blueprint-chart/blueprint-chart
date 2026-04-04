import { usePreviewContainer } from './previewContainer'

describe('usePreviewContainer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes containerRef as null', () => {
    const { containerRef } = usePreviewContainer()
    expect(containerRef.value).toBeNull()
  })

  it('allows setting containerRef to an element', () => {
    const { containerRef } = usePreviewContainer()
    const el = document.createElement('div')
    containerRef.value = el
    expect(containerRef.value).toBe(el)
  })

  it('shares state across multiple calls', () => {
    const a = usePreviewContainer()
    const b = usePreviewContainer()
    const el = document.createElement('div')
    a.containerRef.value = el
    expect(b.containerRef.value).toBe(el)
  })

  it('resets between pinias', () => {
    const { containerRef } = usePreviewContainer()
    containerRef.value = document.createElement('div')

    setActivePinia(createPinia())
    const fresh = usePreviewContainer()
    expect(fresh.containerRef.value).toBeNull()
  })
})
