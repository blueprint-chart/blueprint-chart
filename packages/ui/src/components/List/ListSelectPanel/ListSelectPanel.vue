<template>
  <div class="border rounded overflow-hidden bg-body-tertiary p-2">
    <div class="d-flex gap-1 mb-2">
      <BButton
        variant="outline-secondary"
        size="sm"
        @click="selectAll"
      >
        All
      </BButton>
      <BButton
        variant="outline-secondary"
        size="sm"
        @click="selectNone"
      >
        None
      </BButton>
      <BButton
        variant="outline-secondary"
        size="sm"
        @click="selectInvert"
      >
        Invert
      </BButton>
    </div>
    <div :style="{ maxHeight, overflowY: 'auto' }">
      <ListItemRow
        v-for="(item, index) in items"
        :key="item"
        :label="item"
        :active="selected.includes(item)"
        @click="onClick(item, index, $event)"
      >
        <template
          v-if="$slots['item-leading']"
          #leading
        >
          <slot
            name="item-leading"
            :item="item"
            :index="index"
          />
        </template>
        <template
          v-if="$slots['item-actions']"
          #actions
        >
          <slot
            name="item-actions"
            :item="item"
            :index="index"
          />
        </template>
      </ListItemRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next'
import ListItemRow from '../ListItemRow/ListItemRow.vue'

const props = withDefaults(defineProps<{
  items: string[]
  selected: string[]
  maxHeight?: string
  onItemClick?: (item: string, index: number, event: MouseEvent) => void
}>(), {
  maxHeight: '220px',
  onItemClick: undefined,
})

const emit = defineEmits<{
  'update:selected': [value: string[]]
}>()

function onClick(item: string, index: number, event: MouseEvent) {
  if (props.onItemClick) {
    props.onItemClick(item, index, event)
  }
  else {
    toggleSelect(item)
  }
}

function toggleSelect(item: string) {
  const idx = props.selected.indexOf(item)
  if (idx >= 0) {
    emit('update:selected', props.selected.filter(i => i !== item))
  }
  else {
    emit('update:selected', [...props.selected, item])
  }
}

function selectAll() {
  emit('update:selected', [...props.items])
}

function selectNone() {
  emit('update:selected', [])
}

function selectInvert() {
  emit('update:selected', props.items.filter(i => !props.selected.includes(i)))
}
</script>
