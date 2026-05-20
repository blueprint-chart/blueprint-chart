import { mount } from '@vue/test-utils'
import NavigationSectionTabs from './NavigationSectionTabs.vue'

const SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Charts', link: '/charts/' },
  { text: 'Handbook', link: '/handbook/' },
  { text: 'Reference', link: '/reference/' },
]

describe('NavigationSectionTabs', () => {
  it('renders one <a> per section, in order', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS },
    })
    const tabs = wrapper.findAll('a')
    expect(tabs).toHaveLength(4)
    expect(tabs.map(t => t.text())).toEqual([
      'Guide', 'Charts', 'Handbook', 'Reference',
    ])
  })

  it('sets href to each section link', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS },
    })
    const tabs = wrapper.findAll('a')
    expect(tabs[0].attributes('href')).toBe('/guide/getting-started')
    expect(tabs[3].attributes('href')).toBe('/reference/')
  })

  it('marks the tab whose link matches activeLink as active', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS, activeLink: '/charts/' },
    })
    const active = wrapper.findAll('.navigation-section-tabs__tab--active')
    expect(active).toHaveLength(1)
    expect(active[0].text()).toBe('Charts')
  })

  it('sets aria-current="page" on the active tab and nothing on the rest', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS, activeLink: '/charts/' },
    })
    const tabs = wrapper.findAll('a')
    expect(tabs[1].attributes('aria-current')).toBe('page')
    expect(tabs[0].attributes('aria-current')).toBeUndefined()
    expect(tabs[2].attributes('aria-current')).toBeUndefined()
  })

  it('renders no active tab when activeLink does not match any section', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS, activeLink: '/nowhere/' },
    })
    expect(wrapper.find('.navigation-section-tabs__tab--active').exists()).toBe(false)
  })

  it('uses a <nav> element with aria-label="Documentation sections" by default', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS },
    })
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Documentation sections')
  })

  it('accepts a custom aria-label', () => {
    const wrapper = mount(NavigationSectionTabs, {
      props: { sections: SECTIONS, ariaLabel: 'Top-level docs' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Top-level docs')
  })
})
