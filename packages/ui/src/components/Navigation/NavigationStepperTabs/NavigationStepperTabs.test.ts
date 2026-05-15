import { mount } from '@vue/test-utils'
import NavigationStepperTabs from './NavigationStepperTabs.vue'

const steps = [
  { label: 'Data' },
  { label: 'Visualize' },
  { label: 'Export' },
]

describe('NavigationStepperTabs', () => {
  it('marks the current step and earlier ones as done', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 1 } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].classes()).toContain('navigation-stepper-tabs__step--done')
    expect(tabs[1].classes()).toContain('navigation-stepper-tabs__step--current')
    expect(tabs[2].classes()).toContain('navigation-stepper-tabs__step--pending')
  })

  it('reflects aria-selected on the current tab', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 2 } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[2].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
  })

  it('emits update:currentStep with the index when a tab is clicked', async () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 0 } })
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })

  it('does not emit when clicking a disabled step', async () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 0, disabledSteps: [2] } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[2].classes()).toContain('navigation-stepper-tabs__step--disabled')
    await tabs[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toBeUndefined()
  })

  it('renders a check icon marker for done steps and a number for others', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 1 } })
    const markers = wrapper.findAll('.navigation-stepper-tabs__step__marker')
    expect(markers[0].find('svg').exists()).toBe(true)
    expect(markers[1].text()).toBe('2')
    expect(markers[2].text()).toBe('3')
  })
})
