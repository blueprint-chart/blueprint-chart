import { describe, it, expect, beforeEach } from 'vitest'
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
})
