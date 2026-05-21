import { mount } from '@vue/test-utils'
import NavigationStepperTabs from './NavigationStepperTabs.vue'

const steps = [
  { label: 'Data' },
  { label: 'Visualize' },
  { label: 'Export' },
]

describe('NavigationStepperTabs', () => {
  it('renders one [role="tab"] per step inside a [role="tablist"]', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 0 } })
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(steps.length)
  })

  it('marks earlier steps as done, the current step as current, and later ones as pending', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 1 } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].classes()).toContain('navigation-stepper-tabs__step--done')
    expect(tabs[1].classes()).toContain('navigation-stepper-tabs__step--current')
    expect(tabs[2].classes()).toContain('navigation-stepper-tabs__step--pending')
  })

  it('sets aria-selected on every tab and "true" on the current step only', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 2 } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('false')
    expect(tabs[2].attributes('aria-selected')).toBe('true')
  })

  it('emits update:currentStep with the index when an enabled step is clicked', async () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 0 } })
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })

  it('does not emit when a disabled step is clicked', async () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0, disabledSteps: [2] },
    })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[2].classes()).toContain('navigation-stepper-tabs__step--disabled')
    await tabs[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toBeUndefined()
  })
})
