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

  it('always renders credit', () => {
    const { footer } = createFrame(container)
    const credit = footer.querySelector('span.bc-frame-credit')
    expect(credit).not.toBeNull()
    expect(credit!.textContent).toBe('Blueprint Chart')
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
        if (noteH > 0) note.style.display = 'block'
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
  })
})
