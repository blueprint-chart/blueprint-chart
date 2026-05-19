import { mount } from '@vue/test-utils'
import NavigationMarketingBar from './NavigationMarketingBar.vue'

describe('NavigationMarketingBar', () => {
  it('renders all named slots', () => {
    const wrapper = mount(NavigationMarketingBar, {
      slots: {
        brand: '<span class="t-brand">Brand</span>',
        menu: '<a class="t-menu">Link</a>',
        actions: '<button class="t-action">A</button>',
        'cta-secondary': '<a class="t-cta2">My charts</a>',
        'cta-primary': '<a class="t-cta1">New chart</a>',
      },
    })
    expect(wrapper.find('.t-brand').exists()).toBe(true)
    expect(wrapper.find('.t-menu').exists()).toBe(true)
    expect(wrapper.find('.t-action').exists()).toBe(true)
    expect(wrapper.find('.t-cta2').exists()).toBe(true)
    expect(wrapper.find('.t-cta1').exists()).toBe(true)
  })

  it('renders without secondary CTA', () => {
    const wrapper = mount(NavigationMarketingBar, {
      slots: {
        brand: '<span>Brand</span>',
        'cta-primary': '<a>Primary</a>',
      },
    })
    expect(wrapper.html()).not.toContain('cta-secondary')
  })

  it('uses a <header> element as the root', () => {
    const wrapper = mount(NavigationMarketingBar)
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  it('orders brand, menu, spacer, actions, cta in the DOM', () => {
    const wrapper = mount(NavigationMarketingBar, {
      slots: {
        brand: '<span class="t-brand">Brand</span>',
        menu: '<a class="t-menu">Menu</a>',
        actions: '<button class="t-action">A</button>',
        'cta-primary': '<a class="t-cta1">CTA</a>',
      },
    })
    const html = wrapper.html()
    expect(html.indexOf('t-brand')).toBeLessThan(html.indexOf('t-menu'))
    expect(html.indexOf('t-menu')).toBeLessThan(html.indexOf('t-action'))
    expect(html.indexOf('t-action')).toBeLessThan(html.indexOf('t-cta1'))
  })
})
