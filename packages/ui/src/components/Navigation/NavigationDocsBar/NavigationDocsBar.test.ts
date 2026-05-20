import { mount } from '@vue/test-utils'
import NavigationDocsBar from './NavigationDocsBar.vue'

describe('NavigationDocsBar', () => {
  it('renders brand, actions, cta-primary, and cta-secondary slots', () => {
    const wrapper = mount(NavigationDocsBar, {
      slots: {
        'brand': '<span class="t-brand">Brand</span>',
        'actions': '<button class="t-action">A</button>',
        'cta-primary': '<a class="t-cta-primary">Editor</a>',
        'cta-secondary': '<div class="t-cta-secondary">gh+theme</div>',
      },
    })
    expect(wrapper.find('.t-brand').exists()).toBe(true)
    expect(wrapper.find('.t-action').exists()).toBe(true)
    expect(wrapper.find('.t-cta-primary').exists()).toBe(true)
    expect(wrapper.find('.t-cta-secondary').exists()).toBe(true)
  })

  it('uses a <header> element as the root', () => {
    const wrapper = mount(NavigationDocsBar)
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  it('orders brand, actions, cta-primary, cta-secondary in the DOM (spacer between actions and cta-primary)', () => {
    const wrapper = mount(NavigationDocsBar, {
      slots: {
        'brand': '<span class="t-brand">Brand</span>',
        'actions': '<button class="t-action">A</button>',
        'cta-primary': '<a class="t-cta-primary">Editor</a>',
        'cta-secondary': '<div class="t-cta-secondary">gh+theme</div>',
      },
    })
    const html = wrapper.html()
    expect(html.indexOf('t-brand')).toBeLessThan(html.indexOf('t-action'))
    expect(html.indexOf('t-action')).toBeLessThan(html.indexOf('t-cta-primary'))
    expect(html.indexOf('t-cta-primary')).toBeLessThan(html.indexOf('t-cta-secondary'))
    expect(html.indexOf('t-action')).toBeLessThan(html.indexOf('navigation-docs-bar__spacer'))
    expect(html.indexOf('navigation-docs-bar__spacer')).toBeLessThan(html.indexOf('t-cta-primary'))
  })

  it('omits cta-secondary wrapper when no slot content is provided', () => {
    const wrapper = mount(NavigationDocsBar)
    expect(wrapper.find('.navigation-docs-bar__cta-secondary').exists()).toBe(false)
  })
})
