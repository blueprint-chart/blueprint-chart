import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createFrame } from './frame'

describe('createFrame', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
  })

  it('creates a wrapper with bc-frame class', () => {
    const { wrapper } = createFrame(container)
    expect(wrapper.className).toBe('bc-frame')
    expect(container.contains(wrapper)).toBe(true)
  })

  it('creates header, body, and footer sections', () => {
    const { wrapper, header, body, footer } = createFrame(container)
    expect(header.className).toBe('bc-frame-header')
    expect(body.className).toBe('bc-frame-body')
    expect(footer.className).toBe('bc-frame-footer')
    expect(wrapper.children).toHaveLength(4)
  })

  it('renders title as h3', () => {
    const { header } = createFrame(container, { title: 'Test Title' })
    const h3 = header.querySelector('h3.bc-frame-title')
    expect(h3).not.toBeNull()
    expect(h3!.textContent).toBe('Test Title')
  })

  it('renders description as p', () => {
    const { header } = createFrame(container, { description: 'A description' })
    const p = header.querySelector('p.bc-frame-description')
    expect(p).not.toBeNull()
    expect(p!.textContent).toBe('A description')
  })

  it('renders byline in footer', () => {
    const { footer } = createFrame(container, { byline: 'By someone' })
    const span = footer.querySelector('span.bc-frame-byline')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('By someone')
  })

  it('renders source with prefix when no URL', () => {
    const { footer } = createFrame(container, { source: 'Reuters' })
    const span = footer.querySelector('span.bc-frame-source')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('Source: Reuters')
  })

  it('renders source with prefix and link when URL provided', () => {
    const { footer } = createFrame(container, {
      source: 'Reuters',
      sourceUrl: 'https://reuters.com',
    })
    const span = footer.querySelector('span.bc-frame-source')
    expect(span).not.toBeNull()
    const link = span!.querySelector('a.bc-frame-source-link') as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.href).toBe('https://reuters.com/')
    expect(link.textContent).toBe('Reuters')
    expect(span!.textContent).toBe('Source: Reuters')
  })

  it('renders the credit as a clickable link', () => {
    const { footer } = createFrame(container)
    const credit = footer.querySelector('.bc-frame-credit')
    expect(credit).not.toBeNull()
    expect(credit!.tagName).toBe('A')
    expect(credit!.getAttribute('href')).toBe(import.meta.env.BASE_URL)
    expect(credit!.getAttribute('target')).toBe('_blank')
    expect(credit!.getAttribute('rel')).toBe('noopener noreferrer')
    expect(credit!.textContent).toBe('Blueprint Chart')
    expect(credit!.querySelector('svg')).not.toBeNull()
  })

  it('renders empty header when no header options', () => {
    const { header } = createFrame(container)
    expect(header.children).toHaveLength(0)
  })

  it('updates header text on second draw', () => {
    createFrame(container, { title: 'First' })
    createFrame(container, { title: 'Second' })
    const titles = container.querySelectorAll('.bc-frame-title')
    expect(titles.length).toBeGreaterThan(0)
  })

  describe('constrained-frame mode', () => {
    let host: HTMLElement

    beforeEach(() => {
      host = document.createElement('div')
      host.style.display = 'flex'
      host.style.flexDirection = 'column'
      document.body.appendChild(host)
    })

    afterEach(() => {
      host.remove()
    })

    const stubHeight = (el: HTMLElement, h: number) => {
      Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => h })
    }

    const stubHeights = (container: HTMLElement, headerH: number, footerH: number, noteH = 0) => {
      const header = container.querySelector('.bc-frame-header') as HTMLElement
      const footer = container.querySelector('.bc-frame-footer') as HTMLElement
      const note = container.querySelector('.bc-frame-note') as HTMLElement
      stubHeight(header, headerH)
      stubHeight(footer, footerH)
      if (note) {
        stubHeight(note, noteH)
        if (noteH > 0) {
          note.style.display = 'block'
        }
      }
    }

    it('shrinks headerH dataset when description shrinks across renders', () => {
      createFrame(host, { title: 'T', description: 'Long multi-line description that wraps' })
      stubHeights(host, 80, 20)
      createFrame(host, { title: 'T', description: 'Long multi-line description that wraps' })
      const body1 = host.querySelector('.bc-frame-body') as HTMLElement
      const firstHeaderH = Number(body1.dataset.headerH)

      stubHeights(host, 30, 20)
      createFrame(host, { title: 'T' })
      const body2 = host.querySelector('.bc-frame-body') as HTMLElement
      const secondHeaderH = Number(body2.dataset.headerH)

      expect(secondHeaderH).toBeLessThan(firstHeaderH)
      expect(secondHeaderH).toBe(30)
    })

    const flushRaf = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

    it('uses synchronous footer measurement on first render', () => {
      createFrame(host, { source: 'S' })
      stubHeights(host, 30, 20, 0)
      createFrame(host, { source: 'S' })
      const body = host.querySelector('.bc-frame-body') as HTMLElement
      expect(Number(body.dataset.footerH)).toBe(20)
    })

    it('uses previous render post-paint footer height (handles teleport-into-footer)', async () => {
      createFrame(host, { source: 'S' })
      // Simulate post-paint footer growth (e.g. scene-player buttons teleported in)
      stubHeights(host, 30, 80, 0)
      await flushRaf()

      // Subsequent render: synchronous read would give a smaller value, but
      // the cached post-paint measurement from the previous render is 80.
      stubHeights(host, 30, 20, 0)
      createFrame(host, { source: 'S' })
      const body = host.querySelector('.bc-frame-body') as HTMLElement
      expect(Number(body.dataset.footerH)).toBe(80)
    })

    it('footerH dataset settles to a smaller value after note is removed (one-render lag)', async () => {
      createFrame(host, { note: 'A footnote', source: 'S' })
      stubHeights(host, 30, 20, 24)
      createFrame(host, { note: 'A footnote', source: 'S' })
      await flushRaf()

      // Scene change: note removed. First render after the change uses the
      // cached value (44) from the previous post-paint, since the chart
      // layout is committed synchronously. After this render's post-paint,
      // the cache is refreshed.
      stubHeights(host, 30, 20, 0)
      createFrame(host, { source: 'S' })
      await flushRaf()

      // Next render now sees the refreshed (smaller) cache.
      stubHeights(host, 30, 20, 0)
      createFrame(host, { source: 'S' })
      const body = host.querySelector('.bc-frame-body') as HTMLElement
      expect(Number(body.dataset.footerH)).toBe(20)
    })

    it('grows headerH dataset when description grows across renders', () => {
      createFrame(host, { title: 'T' })
      stubHeights(host, 30, 20)
      createFrame(host, { title: 'T' })
      const body1 = host.querySelector('.bc-frame-body') as HTMLElement
      const firstHeaderH = Number(body1.dataset.headerH)

      stubHeights(host, 80, 20)
      createFrame(host, { title: 'T', description: 'A long description' })
      const body2 = host.querySelector('.bc-frame-body') as HTMLElement
      const secondHeaderH = Number(body2.dataset.headerH)

      expect(secondHeaderH).toBeGreaterThan(firstHeaderH)
      expect(secondHeaderH).toBe(80)
    })
  })
})

describe('frame padding shorthand', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
  })

  const sides = (wrapper: HTMLElement) => ({
    top: wrapper.style.getPropertyValue('--bc-frame-padding-top'),
    right: wrapper.style.getPropertyValue('--bc-frame-padding-right'),
    bottom: wrapper.style.getPropertyValue('--bc-frame-padding-bottom'),
    left: wrapper.style.getPropertyValue('--bc-frame-padding-left'),
  })

  it('expands a single value to all four sides', () => {
    const { wrapper } = createFrame(container, { padding: '16px' })
    expect(sides(wrapper)).toEqual({ top: '16px', right: '16px', bottom: '16px', left: '16px' })
  })

  it('expands a two-value shorthand to block and inline sides', () => {
    const { wrapper } = createFrame(container, { padding: '24px 32px' })
    expect(sides(wrapper)).toEqual({ top: '24px', right: '32px', bottom: '24px', left: '32px' })
  })

  it('expands a three-value shorthand', () => {
    const { wrapper } = createFrame(container, { padding: '1px 2px 3px' })
    expect(sides(wrapper)).toEqual({ top: '1px', right: '2px', bottom: '3px', left: '2px' })
  })

  it('expands a four-value shorthand', () => {
    const { wrapper } = createFrame(container, { padding: '1px 2px 3px 4px' })
    expect(sides(wrapper)).toEqual({ top: '1px', right: '2px', bottom: '3px', left: '4px' })
  })

  it('collapses repeated whitespace between values', () => {
    const { wrapper } = createFrame(container, { padding: '  24px   32px ' })
    expect(sides(wrapper)).toEqual({ top: '24px', right: '32px', bottom: '24px', left: '32px' })
  })
})
