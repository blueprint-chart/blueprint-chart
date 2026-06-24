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
              @duplicate="duplicate(index)"
              @remove="remove(index)"
              @toggle-collapse="toggleCollapse(index)"
            />
          </template>
          <template v-if="openIndex === index">
            <EditorAnnotationPoint
              :annotation="ann"
              :labels="labels"
              :chart-width="chartWidth"
              @update:annotation="(v) => update(index, v)"
            />
            <BFormGroup
              v-if="showRepeat"
              label="Repeat"
            >
              <div class="d-flex align-items-center gap-2">
                <NavigationSegmentedControl
                  :items="repeatItems(ann)"
                  aria-label="Repeat"
                  size="sm"
                  @select="key => setRepeat(index, key)"
                />
                <input
                  v-if="repeatMode(ann) === 'n'"
                  type="number"
                  min="2"
                  :value="typeof ann.repeat === 'number' ? ann.repeat : 2"
                  @input="e => setRepeatN(index, Number((e.target as HTMLInputElement).value))"
                >
              </div>
            </BFormGroup>
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
              @duplicate="duplicate(index)"
              @remove="remove(index)"
              @toggle-collapse="toggleCollapse(index)"
            />
          </template>
          <template v-if="openIndex === index">
            <EditorAnnotationRange
              :annotation="ann"
              :labels="labels"
              @update:annotation="(v) => update(index, v)"
            />
            <BFormGroup
              v-if="showRepeat"
              label="Repeat"
            >
              <div class="d-flex align-items-center gap-2">
                <NavigationSegmentedControl
                  :items="repeatItems(ann)"
                  aria-label="Repeat"
                  size="sm"
                  @select="key => setRepeat(index, key)"
                />
                <input
                  v-if="repeatMode(ann) === 'n'"
                  type="number"
                  min="2"
                  :value="typeof ann.repeat === 'number' ? ann.repeat : 2"
                  @input="e => setRepeatN(index, Number((e.target as HTMLInputElement).value))"
                >
              </div>
            </BFormGroup>
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
              @duplicate="duplicate(index)"
              @remove="remove(index)"
              @toggle-collapse="toggleCollapse(index)"
            />
          </template>
          <template v-if="openIndex === index">
            <EditorAnnotationFree
              :annotation="ann"
              :chart-width="chartWidth"
              :chart-height="chartHeight"
              @update:annotation="(v) => update(index, v)"
            />
            <BFormGroup
              v-if="showRepeat"
              label="Repeat"
            >
              <div class="d-flex align-items-center gap-2">
                <NavigationSegmentedControl
                  :items="repeatItems(ann)"
                  aria-label="Repeat"
                  size="sm"
                  @select="key => setRepeat(index, key)"
                />
                <input
                  v-if="repeatMode(ann) === 'n'"
                  type="number"
                  min="2"
                  :value="typeof ann.repeat === 'number' ? ann.repeat : 2"
                  @input="e => setRepeatN(index, Number((e.target as HTMLInputElement).value))"
                >
              </div>
            </BFormGroup>
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
import { ChartType, AnnotationKind } from '@blueprint-chart/lib'
import type { AnnotationConfig, PointAnnotationConfig, RangeAnnotationConfig, FreeAnnotationConfig } from '@blueprint-chart/lib'
import { ButtonAdd, SectionCard, SettingsSection, NavigationSegmentedControl } from '@blueprint-chart/ui'
import IPhMapPin from '~icons/ph/map-pin'
import IPhArrowsOutLineHorizontal from '~icons/ph/arrows-out-line-horizontal'
import IPhNote from '~icons/ph/note'

const props = defineProps<{
  labels: string[]
  chartType?: string
  chartWidth?: number
  chartHeight?: number
  showRepeat?: boolean
}>()

const model = defineModel<AnnotationConfig[]>({ required: true })

const annotations = computed(() => model.value)

const isPieOrDonut = computed(() => props.chartType === ChartType.Pie || props.chartType === ChartType.Donut)

const openIndex = ref<number | null>(null)

function toggleCollapse(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

defineExpose({ openIndex })

const pointAnnotations = computed(() =>
  annotations.value
    .map((ann, index) => ({ ann, index }))
    .filter(({ ann }) => ann.kind === AnnotationKind.Point),
)

const rangeAnnotations = computed(() =>
  annotations.value
    .map((ann, index) => ({ ann, index }))
    .filter(({ ann }) => ann.kind === AnnotationKind.Range),
)

const freeAnnotations = computed(() =>
  annotations.value
    .map((ann, index) => ({ ann, index }))
    .filter(({ ann }) => ann.kind === AnnotationKind.Free),
)

function repeatMode(ann: AnnotationConfig): 'never' | 'always' | 'n' {
  if (ann.repeat === 'always') {
    return 'always'
  }
  if (typeof ann.repeat === 'number' && ann.repeat > 1) {
    return 'n'
  }
  return 'never'
}

function repeatItems(ann: AnnotationConfig) {
  const mode = repeatMode(ann)
  return [
    { key: 'never', text: 'Never', active: mode === 'never' },
    { key: 'always', text: 'Always', active: mode === 'always' },
    { key: 'n', text: 'For N', active: mode === 'n' },
  ]
}

function updateAnnotation(index: number, patch: Partial<AnnotationConfig>) {
  const next = model.value.map((a, i) => (i === index ? { ...a, ...patch } as AnnotationConfig : a))
  model.value = next
}

function setRepeat(index: number, key: string) {
  if (key === 'always') {
    updateAnnotation(index, { repeat: 'always' })
  }
  else if (key === 'n') {
    const cur = model.value[index].repeat
    updateAnnotation(index, { repeat: typeof cur === 'number' && cur > 1 ? cur : 2 })
  }
  else {
    updateAnnotation(index, { repeat: undefined })
  }
}

function setRepeatN(index: number, value: number) {
  updateAnnotation(index, { repeat: Math.max(2, Math.floor(value) || 2) })
}

function kindLabel(ann: AnnotationConfig): string {
  if (ann.kind === AnnotationKind.Point) {
    return 'Point'
  }
  if (ann.kind === AnnotationKind.Range) {
    return 'Range'
  }
  return 'Note'
}

function summaryText(ann: AnnotationConfig): string {
  if (ann.kind === AnnotationKind.Point) {
    return ann.text || ann.target || 'Empty'
  }
  if (ann.kind === AnnotationKind.Range) {
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
  const ann: PointAnnotationConfig = { kind: AnnotationKind.Point, target: props.labels[0] ?? '', text: 'Enter an annotation', showLine: true, showArrow: true }
  const next = [...annotations.value, ann]
  model.value = next
  openIndex.value = next.length - 1
}

function addRange() {
  const hasLabels = props.labels.length > 0
  const ann: RangeAnnotationConfig = {
    kind: AnnotationKind.Range,
    start: hasLabels ? props.labels[0] : 0,
    end: hasLabels ? props.labels[props.labels.length - 1] : 100,
  }
  const next = [...annotations.value, ann]
  model.value = next
  openIndex.value = next.length - 1
}

function addFree() {
  const ann: FreeAnnotationConfig = { kind: AnnotationKind.Free, text: 'Enter an annotation', x: 0, y: 0 }
  const next = [...annotations.value, ann]
  model.value = next
  openIndex.value = next.length - 1
}

function duplicate(index: number) {
  const copy = [...annotations.value]
  copy.splice(index + 1, 0, { ...copy[index] })
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
