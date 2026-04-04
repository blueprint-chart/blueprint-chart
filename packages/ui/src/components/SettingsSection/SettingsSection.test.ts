import { mount } from '@vue/test-utils'
import SettingsSection from './SettingsSection.vue'
import SettingsSectionIcon from './SettingsSectionIcon.vue'
import SettingsSectionTitle from './SettingsSectionTitle.vue'
import SettingsSectionDescription from './SettingsSectionDescription.vue'

const StubIcon = markRaw(defineComponent({ render: () => h('svg') }))

describe('SettingsSection', () => {
  it('renders title text', () => {
    const wrapper = mount(SettingsSection, { props: { title: 'Appearance' } })
    expect(wrapper.find('.settings-section-title').text()).toBe('Appearance')
  })

  it('renders icon when provided', () => {
    const wrapper = mount(SettingsSection, { props: { title: 'Test', icon: StubIcon } })
    expect(wrapper.find('.settings-section-icon').exists()).toBe(true)
  })

  it('hides icon when not provided', () => {
    const wrapper = mount(SettingsSection, { props: { title: 'Test' } })
    expect(wrapper.find('.settings-section-icon').exists()).toBe(false)
  })

  it('renders default slot content', () => {
    const wrapper = mount(SettingsSection, {
      props: { title: 'Test' },
      slots: { default: '<p>Content</p>' },
    })
    expect(wrapper.find('.settings-section__body').text()).toBe('Content')
  })

  it('renders description prop', () => {
    const wrapper = mount(SettingsSection, {
      props: { title: 'Test', description: 'Some info' },
    })
    expect(wrapper.find('.settings-section-description').text()).toBe('Some info')
  })

  it('renders description slot over prop', () => {
    const wrapper = mount(SettingsSection, {
      props: { title: 'Test', description: 'Prop text' },
      slots: { description: 'Slot text' },
    })
    expect(wrapper.find('.settings-section-description').text()).toBe('Slot text')
  })

  it('hides body when no default slot', () => {
    const wrapper = mount(SettingsSection, { props: { title: 'Test' } })
    expect(wrapper.find('.settings-section__body').exists()).toBe(false)
  })

  it('hides description when neither prop nor slot provided', () => {
    const wrapper = mount(SettingsSection, { props: { title: 'Test' } })
    expect(wrapper.find('.settings-section-description').exists()).toBe(false)
  })
})

describe('SettingsSectionIcon', () => {
  it('renders the icon component', () => {
    const wrapper = mount(SettingsSectionIcon, { props: { icon: StubIcon } })
    expect(wrapper.find('.settings-section-icon').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})

describe('SettingsSectionTitle', () => {
  it('renders slot content', () => {
    const wrapper = mount(SettingsSectionTitle, { slots: { default: 'My Title' } })
    expect(wrapper.find('.settings-section-title').text()).toBe('My Title')
  })
})

describe('SettingsSectionDescription', () => {
  it('renders slot content', () => {
    const wrapper = mount(SettingsSectionDescription, { slots: { default: 'Some description' } })
    expect(wrapper.find('.settings-section-description').text()).toBe('Some description')
  })
})
