import { describe, it, expect } from 'vitest'
import { createFrame } from './frame'

describe('createFrame structure', () => {
  it('creates a wrapper with bc-frame class', () => {
    const container = document.createElement('div')
    const { wrapper } = createFrame(container)
    expect(wrapper.className).toBe('bc-frame')
    expect(container.contains(wrapper)).toBe(true)
  })

  it('creates header, body, and footer sections', () => {
    const container = document.createElement('div')
    const { wrapper, header, body, footer } = createFrame(container)
    expect(header.className).toBe('bc-frame-header')
    expect(body.className).toBe('bc-frame-body')
    expect(footer.className).toBe('bc-frame-footer')
    expect(wrapper.children).toHaveLength(4)
  })

  it('renders empty header when no header options', () => {
    const container = document.createElement('div')
    const { header } = createFrame(container)
    expect(header.children).toHaveLength(0)
  })
})

describe('createFrame header content', () => {
  it('renders title as h3', () => {
    const container = document.createElement('div')
    const { header } = createFrame(container, { title: 'Test Title' })
    const h3 = header.querySelector('h3.bc-frame-title')
    expect(h3).not.toBeNull()
    expect(h3!.textContent).toBe('Test Title')
  })

  it('renders description as p', () => {
    const container = document.createElement('div')
    const { header } = createFrame(container, { description: 'A description' })
    const p = header.querySelector('p.bc-frame-description')
    expect(p).not.toBeNull()
    expect(p!.textContent).toBe('A description')
  })
})

describe('createFrame footer byline and source', () => {
  it('renders byline in footer', () => {
    const container = document.createElement('div')
    const { footer } = createFrame(container, { byline: 'By someone' })
    const span = footer.querySelector('span.bc-frame-byline')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('By someone')
  })

  it('renders source with prefix when no URL', () => {
    const container = document.createElement('div')
    const { footer } = createFrame(container, { source: 'Reuters' })
    const span = footer.querySelector('span.bc-frame-source')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('Source: Reuters')
  })
})

describe('createFrame footer source link and credit', () => {
  it('renders source with prefix and link when URL provided', () => {
    const container = document.createElement('div')
    const { footer } = createFrame(container, { source: 'Reuters', sourceUrl: 'https://reuters.com' })
    const span = footer.querySelector('span.bc-frame-source')
    expect(span).not.toBeNull()
    const link = span!.querySelector('a.bc-frame-source-link') as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.href).toBe('https://reuters.com/')
    expect(link.textContent).toBe('Reuters')
    expect(span!.textContent).toBe('Source: Reuters')
  })

  it('always renders credit', () => {
    const container = document.createElement('div')
    const { footer } = createFrame(container)
    const credit = footer.querySelector('span.bc-frame-credit')
    expect(credit).not.toBeNull()
    expect(credit!.textContent).toBe('Blueprint Chart')
  })
})
