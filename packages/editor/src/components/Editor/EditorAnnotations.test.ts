import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { AnnotationKind } from '@blueprint-chart/lib'
import EditorAnnotations from './EditorAnnotations.vue'

vi.mock('./EditorAnnotationHeader.vue', () => ({
  default: {
    name: 'EditorAnnotationHeader',
    template: '<div class="stub-annotation-header" @click="$emit(\'toggleCollapse\')"><slot /></div>',
    props: ['kindLabel', 'summary', 'collapsed', 'hidden', 'canToggleVisibility'],
    emits: ['duplicate', 'remove', 'toggleCollapse', 'toggleVisibility'],
  },
}))

vi.mock('./EditorAnnotationPoint.vue', () => ({
  default: {
    name: 'EditorAnnotationPoint',
    template: '<div class="stub-point" />',
    props: ['annotation', 'labels', 'chartWidth'],
    emits: ['update:annotation'],
  },
}))

vi.mock('@blueprint-chart/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/ui')>()
  return {
    ...actual,
    NavigationSegmentedControl: {
      name: 'NavigationSegmentedControl',
      template: '<nav class="stub-segmented-control"><button v-for="item in items" :key="item.key" :data-key="item.key" @click="$emit(\'select\', item.key)">{{ item.text }}</button></nav>',
      props: ['items', 'ariaLabel', 'size'],
      emits: ['select'],
    },
  }
})

function mountWith(annotations: object[], showRepeat: boolean) {
  return mount(EditorAnnotations, {
    props: {
      'labels': ['a', 'b'],
      'showRepeat': showRepeat,
      'modelValue': annotations,
      'onUpdate:modelValue': () => {},
    },
  })
}

describe('EditorAnnotations', () => {
  describe('Repeat control visibility', () => {
    it('hides the Repeat control when showRepeat is false', () => {
      const w = mountWith([{ kind: AnnotationKind.Point, target: 'a', text: 't' }], false)
      expect(w.text()).not.toContain('Always')
    })

    it('shows Once/Always/For N when showRepeat is true and annotation is open', async () => {
      const w = mountWith([{ kind: AnnotationKind.Point, target: 'a', text: 't' }], true)
      // The forms start collapsed; open the first annotation by clicking its header
      const header = w.find('.stub-annotation-header')
      await header.trigger('click')
      expect(w.text()).toContain('Always')
    })
  })
})
