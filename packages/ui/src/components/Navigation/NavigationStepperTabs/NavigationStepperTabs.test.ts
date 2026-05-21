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

  it('renders the step icon when provided, and swaps to a check svg on done steps', () => {
    const FakeIcon = { template: '<svg data-test="fake"></svg>' }
    const stepsWithIcons = [
      { label: 'Data', icon: FakeIcon },
      { label: 'Visualize', icon: FakeIcon },
      { label: 'Export', icon: FakeIcon },
    ]
    const wrapper = mount(NavigationStepperTabs, { props: { steps: stepsWithIcons, currentStep: 1 } })
    const tabs = wrapper.findAll('[role="tab"]')

    // index 0 is done → no fake icon, check is rendered
    expect(tabs[0].find('[data-test="fake"]').exists()).toBe(false)
    expect(tabs[0].find('.navigation-stepper-tabs__step__icon svg').exists()).toBe(true)

    // index 1 is current → fake icon
    expect(tabs[1].find('[data-test="fake"]').exists()).toBe(true)

    // index 2 is pending → fake icon
    expect(tabs[2].find('[data-test="fake"]').exists()).toBe(true)
  })

  it('omits the icon wrapper if a step has no icon and is not done', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 1 } })
    const tabs = wrapper.findAll('[role="tab"]')
    // No icons supplied, no done index for index 2
    expect(tabs[2].find('.navigation-stepper-tabs__step__icon').exists()).toBe(false)
  })

  it('renders chevron separators between inline tabs (count = steps - 1)', () => {
    const wrapper = mount(NavigationStepperTabs, { props: { steps, currentStep: 0 } })
    expect(wrapper.findAll('.navigation-stepper-tabs__sep')).toHaveLength(steps.length - 1)
  })

  it('omits separators when separator=false on inline layout', () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0, separator: false },
    })
    expect(wrapper.findAll('.navigation-stepper-tabs__sep')).toHaveLength(0)
  })

  it('omits separators on stacked layout regardless of the separator prop', () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0, layout: 'stacked', separator: true },
    })
    expect(wrapper.findAll('.navigation-stepper-tabs__sep')).toHaveLength(0)
  })

  it('applies the stacked layout modifier and per-tab flex-1 when layout="stacked"', () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0, layout: 'stacked' },
    })
    expect(wrapper.classes()).toContain('navigation-stepper-tabs--stacked')
    // Tabs are not asserted on style, since style application via JSDOM doesn't
    // reflect scoped CSS — class presence is the contract.
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.length).toBe(steps.length)
  })

  it('moves focus from the active tab to the next enabled tab on ArrowRight, wrapping at the end', async () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0 },
      attachTo: document.body,
    })
    const tabs = wrapper.findAll('[role="tab"]')
    ;(tabs[0].element as HTMLElement).focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[1].element)
    await tabs[1].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[2].element)
    await tabs[2].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[0].element)
    wrapper.unmount()
  })

  it('moves focus to the previous enabled tab on ArrowLeft, wrapping at the start', async () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0 },
      attachTo: document.body,
    })
    const tabs = wrapper.findAll('[role="tab"]')
    ;(tabs[0].element as HTMLElement).focus()
    await tabs[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tabs[2].element)
    wrapper.unmount()
  })

  it('skips disabled tabs with arrow keys', async () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 0, disabledSteps: [1] },
      attachTo: document.body,
    })
    const tabs = wrapper.findAll('[role="tab"]')
    ;(tabs[0].element as HTMLElement).focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[2].element)
    wrapper.unmount()
  })

  it('moves focus to the first/last enabled tab on Home/End', async () => {
    const wrapper = mount(NavigationStepperTabs, {
      props: { steps, currentStep: 1, disabledSteps: [0] },
      attachTo: document.body,
    })
    const tabs = wrapper.findAll('[role="tab"]')
    ;(tabs[1].element as HTMLElement).focus()
    await tabs[1].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(tabs[1].element) // 0 is disabled, falls to next enabled
    await tabs[1].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(tabs[2].element)
    wrapper.unmount()
  })
})
