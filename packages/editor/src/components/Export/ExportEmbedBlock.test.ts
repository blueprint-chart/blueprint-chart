import { mount } from '@vue/test-utils'
import ExportEmbedBlock from './ExportEmbedBlock.vue'

vi.mock('@blueprint-chart/ui', () => ({
  ActionCopyButton: {
    template: '<button class="copy-stub" :data-text="text">{{ label }}</button>',
    props: ['text', 'label', 'variant', 'size'],
  },
  AppIcon: { template: '<i />', props: ['name', 'size'] },
}))

function mountBlock(props = {}) {
  return mount(ExportEmbedBlock, {
    props: {
      label: 'Live link',
      note: 'A note about this embed.',
      snippet: '<iframe src="https://x/#/render?id=abc"></iframe>',
      permalink: 'https://x/#/render?id=abc',
      copyEmbedLabel: 'Copy live embed',
      ...props,
    },
  })
}

describe('ExportEmbedBlock', () => {
  it('renders the label and the iframe snippet', () => {
    const wrapper = mountBlock()
    expect(wrapper.text()).toContain('Live link')
    expect(wrapper.find('pre').text()).toContain('render?id=abc')
  })

  it('shows the Recommended badge only when recommended', () => {
    expect(mountBlock().text()).not.toContain('Recommended')
    expect(mountBlock({ recommended: true }).text()).toContain('Recommended')
  })

  it('points "Open in new tab" at the permalink in a new tab', () => {
    const link = mountBlock().find('a.export-embed-block__open')
    expect(link.attributes('href')).toBe('https://x/#/render?id=abc')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
  })

  it('exposes copy-embed (with the snippet) and copy-permalink (with the permalink)', () => {
    const buttons = mountBlock().findAll('button.copy-stub')
    const texts = buttons.map(b => b.attributes('data-text'))
    expect(texts).toContain('<iframe src="https://x/#/render?id=abc"></iframe>')
    expect(texts).toContain('https://x/#/render?id=abc')
  })

  it('renders the header-action slot', () => {
    const w = mount(ExportEmbedBlock, {
      props: {
        label: 'Live link',
        note: 'n',
        snippet: '<iframe />',
        permalink: 'p',
        copyEmbedLabel: 'Copy',
      },
      slots: { 'header-action': '<button class="unpub">Unpublish</button>' },
    })
    expect(w.find('button.unpub').exists()).toBe(true)
  })
})
