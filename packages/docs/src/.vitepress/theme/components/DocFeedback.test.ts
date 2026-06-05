import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

// VitePress is not booted under vitest. Stub `useData` so the component can
// read `page.relativePath`. A mutable holder lets each test pick the path.
const page = { value: { relativePath: 'guide/index.md' } as { relativePath?: string } }
vi.mock('vitepress', () => ({
  useData: () => ({ page }),
}))

// The icon is a virtual unplugin-icons module; alias it to a stub component.
vi.mock('~icons/ph/github-logo', () => ({
  default: { name: 'IconStub', render: () => null },
}))

import DocFeedback from './DocFeedback.vue'

function hrefFor() {
  return mount(DocFeedback).get('a.doc-feedback__link').attributes('href')!
}

describe('DocFeedback', () => {
  it('builds an issue-new URL carrying the page path and the docs label', () => {
    page.value = { relativePath: 'guide/index.md' }
    const href = hrefFor()

    expect(href).toContain('https://github.com/blueprint-chart/blueprint-chart/issues/new?')
    // The component builds params via URLSearchParams, so spaces encode as `+`.
    // Title is `docs feedback: <path>`; read it back through URLSearchParams to
    // assert on the decoded value rather than a brittle encoded literal.
    const params = new URL(href).searchParams
    expect(params.get('title')).toBe('docs feedback: guide/index.md')
    expect(params.get('labels')).toBe('docs')
  })

  it('falls back to an empty path when relativePath is undefined', () => {
    page.value = { relativePath: undefined }
    const href = hrefFor()

    // The `|| ''` fallback keeps the URL valid and parseable.
    expect(href).toContain('https://github.com/blueprint-chart/blueprint-chart/issues/new?')
    expect(() => new URL(href)).not.toThrow()
    expect(new URL(href).searchParams.get('title')).toBe('docs feedback: ')
  })

  it('opens the issue in a new tab with safe rel attributes', () => {
    page.value = { relativePath: 'guide/index.md' }
    const link = mount(DocFeedback).get('a.doc-feedback__link')

    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })
})
