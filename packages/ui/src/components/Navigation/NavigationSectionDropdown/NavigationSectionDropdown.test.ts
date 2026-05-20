import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NavigationSectionDropdown from './NavigationSectionDropdown.vue'

const SECTIONS = [
  { text: 'Guide', link: '/guide/getting-started' },
  { text: 'Charts', link: '/charts/' },
  { text: 'Handbook', link: '/handbook/' },
  { text: 'Reference', link: '/reference/' },
]

describe('NavigationSectionDropdown', () => {
  it('renders a button trigger labelled with the active section text', () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/charts/' },
    })
    const trigger = wrapper.find('button.navigation-section-dropdown__trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toContain('Charts')
  })

  it('falls back to the triggerLabel prop when no section matches', () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, triggerLabel: 'Switch section' },
    })
    expect(wrapper.find('button').text()).toContain('Switch section')
  })

  it('has aria-haspopup="menu" and aria-expanded="false" when closed', () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
    })
    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('opens the panel and flips aria-expanded when the trigger is clicked', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('menu.navigation-section-dropdown__panel').exists()).toBe(true)
  })

  it('renders one <a role="menuitem"> per section in the open panel', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
    })
    await wrapper.find('button').trigger('click')
    const items = wrapper.findAll('a[role="menuitem"]')
    expect(items).toHaveLength(4)
    expect(items[0].attributes('href')).toBe('/guide/getting-started')
    expect(items[3].attributes('href')).toBe('/reference/')
  })

  it('marks the active item with aria-current="page"', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/charts/' },
    })
    await wrapper.find('button').trigger('click')
    const items = wrapper.findAll('a[role="menuitem"]')
    expect(items[1].attributes('aria-current')).toBe('page')
    expect(items[0].attributes('aria-current')).toBeUndefined()
  })

  it('closes the panel and returns focus to the trigger when Escape is pressed', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
      attachTo: document.body,
    })
    const trigger = wrapper.find('button').element as HTMLButtonElement
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('menu').exists()).toBe(true)

    // Move focus away from the trigger first so we can prove focus returns to it.
    trigger.blur()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(wrapper.find('menu').exists()).toBe(false)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
  })

  it('Escape works when focus is on the trigger (not inside the panel)', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
      attachTo: document.body,
    })
    const trigger = wrapper.find('button').element as HTMLButtonElement
    await wrapper.find('button').trigger('click')
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(wrapper.find('menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('closes the panel when a click happens outside the dropdown', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('menu').exists()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('closes the panel when a menuitem is selected', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('menu').exists()).toBe(true)

    // Prevent the test runner from following the link; we only care about
    // the close behaviour.
    const items = wrapper.findAll('a[role="menuitem"]')
    await items[1].trigger('click', { preventDefault: true })

    expect(wrapper.find('menu').exists()).toBe(false)

    wrapper.unmount()
  })

  it('clicking the trigger a second time closes the panel', async () => {
    const wrapper = mount(NavigationSectionDropdown, {
      props: { sections: SECTIONS, activeLink: '/guide/getting-started' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('menu').exists()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('menu').exists()).toBe(false)
  })
})
