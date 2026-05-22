import { mount } from '@vue/test-utils'
import SceneListItem from './SceneListItem.vue'

describe('SceneListItem', () => {
  it('renders the SCENE label, name, and hint', () => {
    const w = mount(SceneListItem, {
      props: {
        index: 2,
        name: 'Stacked view',
        thumbnail: '<svg viewBox="0 0 1 1"></svg>',
        hint: 'inherits scene 1',
      },
    })
    expect(w.find('.scene-list-item__label').text()).toBe('SCENE 2')
    expect(w.find('.scene-list-item__name').text()).toBe('Stacked view')
    expect(w.find('.scene-list-item__hint').text()).toBe('inherits scene 1')
  })

  it('renders the drag handle when removable', () => {
    const w = mount(SceneListItem, {
      props: { index: 1, name: 'A', thumbnail: null, hint: 'custom data', removable: true },
    })
    expect(w.find('.scene-list-item__handle').exists()).toBe(true)
  })

  it('hides the drag handle when not removable (base scene)', () => {
    const w = mount(SceneListItem, {
      props: { index: 0, name: 'Base', thumbnail: null, hint: 'base scene', removable: false },
    })
    expect(w.find('.scene-list-item__handle').exists()).toBe(false)
  })

  it('renders the remove button only when removable', () => {
    const removable = mount(SceneListItem, {
      props: { index: 1, name: 'A', thumbnail: null, hint: 'override', removable: true },
    })
    expect(removable.find('.scene-list-item__remove').exists()).toBe(true)
    const fixed = mount(SceneListItem, {
      props: { index: 0, name: 'Base', thumbnail: null, hint: 'base', removable: false },
    })
    expect(fixed.find('.scene-list-item__remove').exists()).toBe(false)
  })

  it('marks the active row with aria-current and an active modifier class', () => {
    const w = mount(SceneListItem, {
      props: { index: 0, name: 'Base', thumbnail: null, hint: 'base', active: true },
    })
    const button = w.find('button.scene-list-item')
    expect(button.attributes('aria-current')).toBe('true')
    expect(button.classes()).toContain('scene-list-item--active')
  })

  it('emits select when the row body is clicked', async () => {
    const w = mount(SceneListItem, {
      props: { index: 1, name: 'A', thumbnail: null, hint: 'custom data', removable: true },
    })
    await w.find('button.scene-list-item').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })

  it('emits remove and not select when the remove button is clicked', async () => {
    const w = mount(SceneListItem, {
      props: { index: 1, name: 'A', thumbnail: null, hint: 'custom data', removable: true },
    })
    await w.find('.scene-list-item__remove').trigger('click')
    expect(w.emitted('remove')).toHaveLength(1)
    expect(w.emitted('select')).toBeUndefined()
  })
})
