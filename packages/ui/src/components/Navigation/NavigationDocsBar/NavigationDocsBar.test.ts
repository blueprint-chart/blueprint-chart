import { mount } from '@vue/test-utils'
import NavigationDocsBar from './NavigationDocsBar.vue'

describe('NavigationDocsBar', () => {
  it('renders brand, actions, and cta-primary slots', () => {
    const wrapper = mount(NavigationDocsBar, {
      slots: {
        brand: '<span class="t-brand">Brand</span>',
        actions: '<button class="t-action">A</button>',
        'cta-primary': '<a class="t-cta">Open editor ↗</a>',
      },
    })
    expect(wrapper.find('.t-brand').exists()).toBe(true)
    expect(wrapper.find('.t-action').exists()).toBe(true)
    expect(wrapper.find('.t-cta').exists()).toBe(true)
  })

  it('uses a <header> element as the root', () => {
    const wrapper = mount(NavigationDocsBar)
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  it('orders brand, spacer, actions, cta-primary in the DOM', () => {
    const wrapper = mount(NavigationDocsBar, {
      slots: {
        brand: '<span class="t-brand">Brand</span>',
        actions: '<button class="t-action">A</button>',
        'cta-primary': '<a class="t-cta">CTA</a>',
      },
    })
    const html = wrapper.html()
    expect(html.indexOf('t-brand')).toBeLessThan(html.indexOf('t-action'))
    expect(html.indexOf('t-action')).toBeLessThan(html.indexOf('t-cta'))
  })
})
