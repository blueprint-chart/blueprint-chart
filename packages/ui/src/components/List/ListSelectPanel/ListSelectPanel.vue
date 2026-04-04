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

const selected = defineModel<string[]>('selected', { required: true })

const props = withDefaults(defineProps<{
  items: string[]
  maxHeight?: string
  onItemClick?: (item: string, index: number, event: MouseEvent) => void
}>(), {
  maxHeight: '220px',
  onItemClick: undefined,
})

function onClick(item: string, index: number, event: MouseEvent) {
  if (props.onItemClick) {
    props.onItemClick(item, index, event)
  }
  else {
    toggleSelect(item)
  }
}

function toggleSelect(item: string) {
  const idx = selected.value.indexOf(item)
  if (idx >= 0) {
    selected.value = selected.value.filter(i => i !== item)
  }
  else {
    selected.value = [...selected.value, item]
  }
}

function selectAll() {
  selected.value = [...props.items]
}

function selectNone() {
  selected.value = []
}

function selectInvert() {
  selected.value = props.items.filter(i => !selected.value.includes(i))
}
</script>
