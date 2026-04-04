<template>
  <div class="d-flex flex-column gap-4">
    <!-- Point annotations -->
    <SettingsSection
      v-if="!isPieOrDonut"
      title="Points"
      :icon="IPhMapPin"
    >
      <div class="d-flex flex-column gap-2">
        <SectionCard
          v-for="{ ann, index } in pointAnnotations"
          :key="index"
        >
          <template #header>
            <EditorAnnotationHeader
              :kind-label="kindLabel(ann)"
              :summary="summaryText(ann)"
              :collapsed="openIndex !== index"
              :hidden="isHidden(ann)"
              :can-toggle-visibility="canToggleVisibility"
              @duplicate="duplicate(index)"
              @remove="remove(index)"
              @toggle-collapse="toggleCollapse(index)"
              @toggle-visibility="toggleVisibility(ann)"
            />
          </template>
          <template v-if="openIndex === index">
            <EditorAnnotationPoint
              :annotation="ann"
              :labels="labels"
              :chart-width="chartWidth"
              @update:annotation="(v) => update(index, v)"
            />
          </template>
        </SectionCard>
      </div>
      <ButtonAdd
        label="Add"
        @click="addPoint"
      />
    </SettingsSection>

    <!-- Range annotations -->
    <SettingsSection
      v-if="!isPieOrDonut"
      title="Ranges"
      :icon="IPhArrowsOutLineHorizontal"
    >
      <div class="d-flex flex-column gap-2">
        <SectionCard
          v-for="{ ann, index } in rangeAnnotations"
          :key="index"
        >
          <template #header>
            <EditorAnnotationHeader
              :kind-label="kindLabel(ann)"
              :summary="summaryText(ann)"
              :collapsed="openIndex !== index"
              :hidden="isHidden(ann)"
              :can-toggle-visibility="canToggleVisibility"
              @duplicate="duplicate(index)"
              @remove="remove(index)"
              @toggle-collapse="toggleCollapse(index)"
              @toggle-visibility="toggleVisibility(ann)"
            />
          </template>
          <template v-if="openIndex === index">
            <EditorAnnotationRange
              :annotation="ann"
              :labels="labels"
              @update:annotation="(v) => update(index, v)"
            />
          </template>
        </SectionCard>
      </div>
      <ButtonAdd
        label="Add"
        @click="addRange"
      />
    </SettingsSection>

    <!-- Notes (free annotations) -->
    <SettingsSection
      title="Notes"
      :icon="IPhNote"
    >
      <div class="d-flex flex-column gap-2">
        <SectionCard
          v-for="{ ann, index } in freeAnnotations"
          :key="index"
        >
          <template #header>
            <EditorAnnotationHeader
              :kind-label="kindLabel(ann)"
              :summary="summaryText(ann)"
              :collapsed="openIndex !== index"
              :hidden="isHidden(ann)"
              :can-toggle-visibility="canToggleVisibility"
              @duplicate="duplicate(index)"
              @remove="remove(index)"
              @toggle-collapse="toggleCollapse(index)"
              @toggle-visibility="toggleVisibility(ann)"
            />
          </template>
          <template v-if="openIndex === index">
            <EditorAnnotationFree
              :annotation="ann"
              :chart-width="chartWidth"
              :chart-height="chartHeight"
              @update:annotation="(v) => update(index, v)"
            />
          </template>
        </SectionCard>
      </div>
      <ButtonAdd
        label="Add"
        @click="addFree"
      />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import type { AnnotationConfig, PointAnnotationConfig, RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { ButtonAdd, SectionCard, SettingsSection } from '@blueprint-chart/ui'
import IPhMapPin from '~icons/ph/map-pin'
import IPhArrowsOutLineHorizontal from '~icons/ph/arrows-out-line-horizontal'
import IPhNote from '~icons/ph/note'

const props = defineProps<{
  labels: string[]
  chartType?: string
  chartWidth?: number
  chartHeight?: number
  hiddenAnnotationIds?: Set<string>
  canToggleVisibility?: boolean
}>()

const emit = defineEmits<{
  'toggle-visibility': [id: string, kind: 'point' | 'range' | 'free']
}>()

const model = defineModel<AnnotationConfig[]>({ required: true })

const annotations = computed(() => model.value)

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
function generateId(): string {
  let id = ''
  for (let i = 0; i < 5; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}

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

function isHidden(ann: AnnotationConfig): boolean {
  return !!ann.id && !!props.hiddenAnnotationIds?.has(ann.id)
}

function toggleVisibility(ann: AnnotationConfig) {
  if (ann.id) {
    emit('toggle-visibility', ann.id, ann.kind)
  }
}

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
    return ann.text || `${ann.start} - ${
      ann.end}`
  }
  return ann.text || 'Empty'
}

function update(index: number, value: AnnotationConfig) {
  const copy = annotations.value.map(a => ({ ...a }))
  copy[index] = value
  model.value = copy
}

function addPoint() {
  const ann: PointAnnotationConfig = { kind: 'point', id: generateId(), target: props.labels[0] ?? '', text: 'Enter an annotation', showLine: true, showArrow: true }
  const next = [...annotations.value, ann]
  model.value = next
  openIndex.value = next.length - 1
}

function addRange() {
  const hasLabels = props.labels.length > 0
  const ann: RangeAnnotationConfig = {
    kind: 'range',
    id: generateId(),
    start: hasLabels ? props.labels[0] : 0,
    end: hasLabels ? props.labels[props.labels.length - 1] : 100,
  }
  const next = [...annotations.value, ann]
  model.value = next
  openIndex.value = next.length - 1
}

function addFree() {
  const ann: FreeAnnotationConfig = { kind: 'free', id: generateId(), text: 'Enter an annotation', x: 0, y: 0 }
  const next = [...annotations.value, ann]
  model.value = next
  openIndex.value = next.length - 1
}

function duplicate(index: number) {
  const copy = [...annotations.value]
  copy.splice(index + 1, 0, { ...copy[index], id: generateId() })
  model.value = copy
}

function remove(index: number) {
  const copy = [...annotations.value]
  copy.splice(index, 1)
  model.value = copy
  if (openIndex.value === index) {
    openIndex.value = null
  }
  else if (openIndex.value !== null && openIndex.value > index) {
    openIndex.value--
  }
}
</script>
