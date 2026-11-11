<script setup lang="ts">
import type { OverlayConfig } from '@blueprint-chart/lib'
import { ButtonAdd } from '@blueprint-chart/ui'
import { nextOverlayColumn } from '@/utils/chart/overlayColumns'
import EditorOverlayItem from './EditorOverlayItem.vue'

const props = defineProps<{
  columns: string[]
  targetsSeries: boolean
  barColumn?: string
}>()

const model = defineModel<OverlayConfig[]>({ required: true })

const claimed = computed(() => model.value.flatMap(overlay => overlay.columns))
const unclaimed = computed(() => props.columns.filter(name => !claimed.value.includes(name)))
const bars = computed(() => props.targetsSeries ? unclaimed.value : undefined)

function updateAt(index: number, value: OverlayConfig) {
  const copy = [...model.value]
  copy[index] = value
  model.value = copy
}

function add() {
  const onlyColumn = props.columns.length === 1 ? props.columns[0] : undefined
  const column = nextOverlayColumn(props.columns, claimed.value, props.barColumn) ?? onlyColumn
  if (!column) {
    return
  }
  const overlay: OverlayConfig = { columns: [column] }
  const bar = unclaimed.value.find(name => name !== column)
  if (props.targetsSeries && bar) {
    overlay.bar = bar
  }
  model.value = [...model.value, overlay]
}

function remove(index: number) {
  const copy = [...model.value]
  copy.splice(index, 1)
  model.value = copy
}
</script>

<template>
  <div class="editor-overlays">
    <div class="editor-overlays__list">
      <EditorOverlayItem
        v-for="(overlay, i) in model"
        :id="i"
        :key="i"
        :overlay="overlay"
        :columns="columns"
        :claimed="claimed"
        :bars="bars"
        :bar-column="barColumn"
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
