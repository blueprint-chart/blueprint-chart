<script setup lang="ts">
import type { OverlayConfig } from '@blueprint-chart/lib'
import { ButtonAdd } from '@blueprint-chart/ui'
import { leastUsedColumn, nextOverlayColumn, numberedTitle } from '@/utils/chart/overlayColumns'
import EditorOverlayItem from './EditorOverlayItem.vue'

const props = defineProps<{
  columns: string[]
  targetsSeries: boolean
  barColumn?: string
  showRepeat?: boolean
  reserved?: string[]
  legendHidden?: boolean
}>()

const model = defineModel<OverlayConfig[]>({ required: true })

const claimed = computed(() => [...model.value.flatMap(overlay => overlay.columns), ...(props.reserved ?? [])])
const unclaimed = computed(() => props.columns.filter(name => !claimed.value.includes(name)))
const bars = computed(() => props.targetsSeries ? unclaimed.value : undefined)
const freeColumn = computed(() => nextOverlayColumn(props.columns, claimed.value, props.barColumn))
const nextColumn = computed(() => freeColumn.value ?? leastUsedColumn(props.columns, claimed.value))

const keys = new WeakMap<OverlayConfig, number>()
let lastKey = 0

function keyOf(overlay: OverlayConfig): number {
  const raw = toRaw(overlay)
  const known = keys.get(raw)
  if (known !== undefined) {
    return known
  }
  lastKey += 1
  keys.set(raw, lastKey)
  return lastKey
}

const items = computed(() => model.value.map(overlay => ({ overlay, key: keyOf(overlay) })))

function updateAt(index: number, value: OverlayConfig) {
  keys.set(toRaw(value), keyOf(model.value[index]))
  const copy = [...model.value]
  copy[index] = value
  model.value = copy
}

function add() {
  const column = nextColumn.value
  if (!column) {
    return
  }
  const overlay: OverlayConfig = { columns: [column] }
  const listed = model.value.some(existing => existing.columns.includes(column))
  if (listed) {
    const titles = model.value.flatMap(existing => existing.title ?? [])
    overlay.title = numberedTitle(column, titles)
  }
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
        v-for="({ overlay, key }, i) in items"
        :id="i"
        :key="key"
        :overlay="overlay"
        :columns="columns"
        :claimed="claimed"
        :bars="bars"
        :bar-column="barColumn"
        :show-repeat="showRepeat"
        :legend-hidden="legendHidden"
        @update:overlay="(value) => updateAt(i, value)"
        @remove="remove(i)"
      />
    </div>
    <ButtonAdd
      label="Add"
      :disabled="!nextColumn"
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
