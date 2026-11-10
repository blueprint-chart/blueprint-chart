<template>
  <div class="editor-overlays">
    <div class="editor-overlays__list">
      <EditorOverlayItem
        v-for="(overlay, i) in model"
        :id="i"
        :key="i"
        :overlay="overlay"
        :columns="columns"
        @update:overlay="(value) => updateAt(i, value)"
        @remove="remove(i)"
      />
    </div>
    <ButtonAdd
      label="Add"
      :disabled="!columns.length"
      @click="add"
    />
  </div>
</template>

<script setup lang="ts">
import type { OverlayConfig } from '@blueprint-chart/lib'
import { ButtonAdd } from '@blueprint-chart/ui'
import EditorOverlayItem from './EditorOverlayItem.vue'

const props = defineProps<{
  columns: string[]
}>()

const model = defineModel<OverlayConfig[]>({ required: true })

function updateAt(index: number, value: OverlayConfig) {
  const copy = [...model.value]
  copy[index] = value
  model.value = copy
}

function add() {
  const column = props.columns[1] ?? props.columns[0]
  if (!column) {
    return
  }
  model.value = [...model.value, { columns: [column] }]
}

function remove(index: number) {
  const copy = [...model.value]
  copy.splice(index, 1)
  model.value = copy
}
</script>

<style scoped lang="scss">
.editor-overlays {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
