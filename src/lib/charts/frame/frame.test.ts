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
    expect(wrapper.children).toHaveLength(3)
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

  it('renders byline as small', () => {
    const { header } = createFrame(container, { byline: 'By someone' })
    const small = header.querySelector('small.bc-frame-byline')
    expect(small).not.toBeNull()
    expect(small!.textContent).toBe('By someone')
  })

  it('renders source as span when no URL', () => {
    const { footer } = createFrame(container, { source: 'Reuters' })
    const span = footer.querySelector('span.bc-frame-source')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('Reuters')
  })

  it('renders source as link when URL provided', () => {
    const { footer } = createFrame(container, {
      source: 'Reuters',
      sourceUrl: 'https://reuters.com',
    })
    const link = footer.querySelector('a.bc-frame-source') as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.href).toBe('https://reuters.com/')
    expect(link.textContent).toBe('Reuters')
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
