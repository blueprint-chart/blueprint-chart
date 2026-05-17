import { mount } from '@vue/test-utils'
import NavigationStepperChevron from './NavigationStepperChevron.vue'

const steps = [
  { label: 'Data' },
  { label: 'Visualize' },
  { label: 'Export' },
]

describe('NavigationStepperChevron', () => {
  it('marks the current step and earlier ones as done', () => {
    const wrapper = mount(NavigationStepperChevron, { props: { steps, currentStep: 1 } })
    const items = wrapper.findAll('[role="tab"]')
    expect(items[0].classes()).toContain('navigation-stepper-chevron__step--done')
    expect(items[1].classes()).toContain('navigation-stepper-chevron__step--current')
    expect(items[2].classes()).toContain('navigation-stepper-chevron__step--pending')
  })

  it('reflects aria-selected on the current step', () => {
    const wrapper = mount(NavigationStepperChevron, { props: { steps, currentStep: 2 } })
    const items = wrapper.findAll('[role="tab"]')
    expect(items[2].attributes('aria-selected')).toBe('true')
    expect(items[0].attributes('aria-selected')).toBe('false')
  })

  it('emits update:currentStep with the index when a step is clicked', async () => {
    const wrapper = mount(NavigationStepperChevron, { props: { steps, currentStep: 0 } })
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toEqual([[2]])
  })

  it('does not emit when clicking a disabled step', async () => {
    const wrapper = mount(NavigationStepperChevron, {
      props: { steps, currentStep: 0, disabledSteps: [2] },
    })
    const items = wrapper.findAll('[role="tab"]')
    expect(items[2].classes()).toContain('navigation-stepper-chevron__step--disabled')
    await items[2].trigger('click')
    expect(wrapper.emitted('update:currentStep')).toBeUndefined()
  })

  it('renders a check glyph on done steps and the step number elsewhere', () => {
    const wrapper = mount(NavigationStepperChevron, { props: { steps, currentStep: 1 } })
    const chips = wrapper.findAll('.navigation-stepper-chevron__step__chip')
    expect(chips[0].find('svg').exists()).toBe(true)
    expect(chips[1].text()).toBe('2')
    expect(chips[2].text()).toBe('3')
  })

  it('renders chevron separators between steps but not after the last one', () => {
    const wrapper = mount(NavigationStepperChevron, { props: { steps, currentStep: 0 } })
    expect(wrapper.findAll('.navigation-stepper-chevron__sep')).toHaveLength(steps.length - 1)
  })
})
