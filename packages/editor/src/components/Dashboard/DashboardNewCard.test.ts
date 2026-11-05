import { mount } from '@vue/test-utils'
import DashboardNewCard from './DashboardNewCard.vue'

describe('DashboardNewCard', () => {
  it('labels the card in sentence case', () => {
    const wrapper = mount(DashboardNewCard)
    expect(wrapper.text()).toBe('New chart')
  })
})
