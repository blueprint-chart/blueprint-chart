<template>
  <div class="d-flex flex-column gap-3">
    <h6 class="fw-bold mb-0">
      Annotations
    </h6>

    <!-- Point annotations -->
    <template v-if="!isPieOrDonut">
      <div class="d-flex flex-column gap-2">
        <small class="fw-semibold text-body-secondary">Points</small>
        <div
          v-for="{ ann, index } in pointAnnotations"
          :key="index"
          class="rounded overflow-hidden border bg-body"
        >
          <EditorAnnotationHeader
            :kind-label="kindLabel(ann)"
            :summary="summaryText(ann)"
            :collapsed="openIndex !== index"
            @duplicate="duplicate(index)"
            @remove="remove(index)"
            @toggle-collapse="toggleCollapse(index)"
          />
          <div
            v-if="openIndex === index"
            class="p-2 d-flex flex-column gap-2"
          >
            <EditorAnnotationPoint
              :annotation="ann"
              :labels="labels"
              :chart-width="chartWidth"
              @update:annotation="(v) => update(index, v)"
            />
          </div>
        </div>
      </div>
      <ButtonAdd
        label="Add"
        @click="addPoint"
      />
    </template>

    <!-- Range annotations -->
    <template v-if="!isPieOrDonut">
      <div class="d-flex flex-column gap-2">
        <small class="fw-semibold text-body-secondary">Ranges</small>
        <div
          v-for="{ ann, index } in rangeAnnotations"
          :key="index"
          class="rounded overflow-hidden border bg-body"
        >
          <EditorAnnotationHeader
            :kind-label="kindLabel(ann)"
            :summary="summaryText(ann)"
            :collapsed="openIndex !== index"
            @duplicate="duplicate(index)"
            @remove="remove(index)"
            @toggle-collapse="toggleCollapse(index)"
          />
          <div
            v-if="openIndex === index"
            class="p-2 d-flex flex-column gap-2"
          >
            <EditorAnnotationRange
              :annotation="ann"
              :labels="labels"
              @update:annotation="(v) => update(index, v)"
            />
          </div>
        </div>
      </div>
      <ButtonAdd
        label="Add"
        @click="addRange"
      />
    </template>

    <!-- Notes (free annotations) -->
    <div class="d-flex flex-column gap-2">
      <small class="fw-semibold text-body-secondary">Notes</small>
      <div
        v-for="{ ann, index } in freeAnnotations"
        :key="index"
        class="rounded overflow-hidden border bg-body"
      >
        <EditorAnnotationHeader
          :kind-label="kindLabel(ann)"
          :summary="summaryText(ann)"
          :collapsed="openIndex !== index"
          @duplicate="duplicate(index)"
          @remove="remove(index)"
          @toggle-collapse="toggleCollapse(index)"
        />
        <div
          v-if="openIndex === index"
          class="p-2 d-flex flex-column gap-2"
        >
          <EditorAnnotationFree
            :annotation="ann"
            :chart-width="chartWidth"
            :chart-height="chartHeight"
            @update:annotation="(v) => update(index, v)"
          />
        </div>
      </div>
    </div>
    <ButtonAdd
      label="Add"
      @click="addFree"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnnotationConfig, PointAnnotationConfig, RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { ButtonAdd } from '@blueprint-chart/ui'
import EditorAnnotationHeader from './EditorAnnotationHeader.vue'
import EditorAnnotationPoint from './EditorAnnotationPoint.vue'
import EditorAnnotationRange from './EditorAnnotationRange.vue'
import EditorAnnotationFree from './EditorAnnotationFree.vue'

const props = defineProps<{
  modelValue: AnnotationConfig[]
  labels: string[]
  chartType?: string
  chartWidth?: number
  chartHeight?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AnnotationConfig[]]
}>()

const annotations = computed(() => props.modelValue)

const isPieOrDonut = computed(() => props.chartType === 'pie' || props.chartType === 'donut')

const openIndex = ref<number | null>(null)

function toggleCollapse(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

defineExpose({ openIndex })

const pointAnnotations = computed(() =>
  annotations.value
    .map((ann, index) => ({ ann, index }))
    .filter(({ ann }) => ann.kind === 'point'),
)

const rangeAnnotations = computed(() =>
  annotations.value
    .map((ann, index) => ({ ann, index }))
    .filter(({ ann }) => ann.kind === 'range'),
)

const freeAnnotations = computed(() =>
  annotations.value
    .map((ann, index) => ({ ann, index }))
    .filter(({ ann }) => ann.kind === 'free'),
)

function kindLabel(ann: AnnotationConfig): string {
  if (ann.kind === 'point') {
    return 'Point'
  }
  if (ann.kind === 'range') {
    return 'Range'
  }
  return 'Note'
}

function summaryText(ann: AnnotationConfig): string {
  if (ann.kind === 'point') {
    return ann.text || ann.target || 'Empty'
  }
  if (ann.kind === 'range') {
    return ann.text || `${ann.start} - ${ann.end}`
  }
  return ann.text || 'Empty'
}

function update(index: number, value: AnnotationConfig) {
  const copy = annotations.value.map(a => ({ ...a }))
  copy[index] = value
  emit('update:modelValue', copy)
}

function addPoint() {
  const ann: PointAnnotationConfig = { kind: 'point', target: props.labels[0] ?? '', text: 'Enter an annotation', showLine: true, showArrow: true }
  const next = [...annotations.value, ann]
  emit('update:modelValue', next)
  openIndex.value = next.length - 1
}

function addRange() {
  const hasLabels = props.labels.length > 0
  const ann: RangeAnnotationConfig = {
    kind: 'range',
    start: hasLabels ? props.labels[0] : 0,
    end: hasLabels ? props.labels[props.labels.length - 1] : 100,
  }
  const next = [...annotations.value, ann]
  emit('update:modelValue', next)
  openIndex.value = next.length - 1
}

function addFree() {
  const ann: FreeAnnotationConfig = { kind: 'free', text: 'Enter an annotation', x: 0, y: 0 }
  const next = [...annotations.value, ann]
  emit('update:modelValue', next)
  openIndex.value = next.length - 1
}

function duplicate(index: number) {
  const copy = [...annotations.value]
  copy.splice(index + 1, 0, { ...copy[index] })
  emit('update:modelValue', copy)
}

function remove(index: number) {
  const copy = [...annotations.value]
  copy.splice(index, 1)
  emit('update:modelValue', copy)
  if (openIndex.value === index) {
    openIndex.value = null
  }
  else if (openIndex.value !== null && openIndex.value > index) {
    openIndex.value--
  }
}
</script>
