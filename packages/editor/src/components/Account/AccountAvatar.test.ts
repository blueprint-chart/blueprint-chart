import { mount } from '@vue/test-utils'
import AccountAvatar from './AccountAvatar.vue'

describe('AccountAvatar', () => {
  it('shows the uppercased first character of the email', () => {
    const wrapper = mount(AccountAvatar, { props: { email: 'hello@pirhoo.com' } })
    expect(wrapper.text()).toBe('H')
  })

  it('falls back to "?" when the email is empty', () => {
    const wrapper = mount(AccountAvatar, { props: { email: '' } })
    expect(wrapper.text()).toBe('?')
  })

  it('applies the size modifier class', () => {
    const wrapper = mount(AccountAvatar, { props: { email: 'a@b.co', size: 'sm' } })
    expect(wrapper.classes()).toContain('account-avatar--sm')
  })

  it('applies the md modifier class by default', () => {
    const wrapper = mount(AccountAvatar, { props: { email: 'a@b.co' } })
    expect(wrapper.classes()).toContain('account-avatar--md')
  })

  it('is hidden from assistive technology', () => {
    const wrapper = mount(AccountAvatar, { props: { email: 'a@b.co' } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
