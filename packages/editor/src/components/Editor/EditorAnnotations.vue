<template>
  <div class="d-flex flex-column gap-3">
    <h6 class="fw-bold mb-0">
      Annotations
    </h6>

    <EditorAnnotationItem
      v-for="(ann, i) in annotations"
      :key="i"
      :annotation="ann"
      :index="i"
      :labels="labels"
      @update:annotation="(v) => update(i, v)"
      @remove="remove(i)"
    />

    <BButton
      variant="outline-primary"
      size="sm"
      @click="add"
    >
      Add annotation
    </BButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnnotationConfig } from '@blueprint-chart/lib'
import EditorAnnotationItem from './EditorAnnotationItem.vue'

const props = defineProps<{
  modelValue: AnnotationConfig[]
  labels: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AnnotationConfig[]]
}>()

const annotations = computed(() => props.modelValue)

function update(index: number, value: AnnotationConfig) {
  const copy = annotations.value.map(a => ({ ...a }))
  copy[index] = value
  emit('update:modelValue', copy)
}

function add() {
  emit('update:modelValue', [
    ...annotations.value,
    { target: props.labels[0] ?? '', text: '', dx: 40, dy: -40, showArrow: true },
  ])
}

function remove(index: number) {
  const copy = [...annotations.value]
  copy.splice(index, 1)
  emit('update:modelValue', copy)
}
</script>
