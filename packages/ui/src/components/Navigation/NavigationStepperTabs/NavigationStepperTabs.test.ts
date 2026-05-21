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
})
