<script setup lang="ts">
import { ref } from 'vue'
import NavigationSegmentedControl from './NavigationSegmentedControl.vue'
import type { NavigationSegmentedControlItem } from './NavigationSegmentedControl.vue'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhRows from '~icons/ph/rows'

const active = ref('grid')

function itemsWith(activeKey: string): NavigationSegmentedControlItem[] {
  return [
    { key: 'grid', text: 'Grid', icon: IPhSquaresFour, active: activeKey === 'grid' },
    { key: 'list', text: 'List', icon: IPhRows, active: activeKey === 'list' },
  ]
}
</script>

<template>
  <Story title="Navigation/NavigationSegmentedControl">
    <Variant title="Default (md, .btn-sized)">
      <NavigationSegmentedControl
        :items="itemsWith(active)"
        aria-label="Layout"
        @select="active = $event"
      />
    </Variant>

    <Variant title="Small (.btn-sm-sized)">
      <NavigationSegmentedControl
        :items="itemsWith(active)"
        size="sm"
        aria-label="Layout"
        @select="active = $event"
      />
    </Variant>

    <Variant title="Text only">
      <NavigationSegmentedControl
        :items="[
          { key: 'preview', text: 'Preview', active: true },
          { key: 'dsl', text: 'DSL', active: false },
        ]"
        aria-label="Mode"
      />
    </Variant>

    <Variant title="With disabled">
      <NavigationSegmentedControl
        :items="[
          { key: 'now', text: 'Now', active: true },
          { key: 'soon', text: 'Soon', active: false, disabled: true },
        ]"
        aria-label="When"
      />
    </Variant>
  </Story>
</template>
