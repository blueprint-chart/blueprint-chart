<template>
  <div class="d-flex flex-column gap-2">
    <BFormGroup label="Text">
      <BFormTextarea
        ref="textRef"
        :model-value="annotation.text"
        placeholder="Annotation text"
        rows="2"
        @update:model-value="(v: string) => update('text', v)"
      />
    </BFormGroup>

    <BFormGroup label="Target">
      <BFormSelect
        :model-value="annotation.target"
        :options="targetOptions"
        @update:model-value="(v: string) => update('target', v)"
      />
    </BFormGroup>

    <FormControlColorInput
      id="ann-point-text-color"
      :model-value="annotation.textColor ?? '#000000'"
      label="Text color"
      @update:model-value="(v: string) => update('textColor', v)"
    />

    <FormControlCheckbox
      :model-value="annotation.textOutline ?? true"
      label="Text outline"
      @update:model-value="(v: boolean) => update('textOutline', v)"
    />

    <FormControlUnitsInput
      id="ann-point-max-width"
      :model-value="formatMaxWidth(annotation.maxWidth)"
      label="Max width"
      min="0"
      :max="String(chartWidth ?? 600)"
      :units="['px', '%']"
      @update:model-value="(v: string) => update('maxWidth', v)"
    />

    <FormControlCheckbox
      :model-value="annotation.showLine ?? true"
      label="Show line"
      @update:model-value="(v: boolean) => update('showLine', v)"
    >
      <template
        v-if="annotation.showLine"
        #section
      >
        <div class="d-flex flex-column gap-2 mt-2">
          <FormControlButtonGroup
            :model-value="annotation.lineStyle ?? 'direct'"
            label="Line style"
            block
            @update:model-value="(v: string) => update('lineStyle', v)"
          >
            <FormControlButtonGroupEntry
              value="direct"
              text="Direct"
              :icon-left="IFluentLine"
            />
            <FormControlButtonGroupEntry
              value="curve-left"
              text="Curve left"
              :icon-left="IFluentCurveLeft"
            />
            <FormControlButtonGroupEntry
              value="curve-right"
              text="Curve right"
              :icon-left="IFluentCurveRight"
            />
            <FormControlButtonGroupEntry
              value="elbow"
              text="Elbow"
              :icon-left="IFluentElbow"
            />
          </FormControlButtonGroup>

          <BFormGroup label="Line weight">
            <BFormInput
              :model-value="String(annotation.lineWeight ?? 1)"
              type="number"
              min="1"
              max="10"
              @update:model-value="(v: string) => update('lineWeight', Number(v))"
            />
          </BFormGroup>

          <FormControlDirectionPicker
            :model-value="annotation.anchorDirection ?? 'N'"
            label="Anchor position"
            @update:model-value="(v: CompassDirection) => update('anchorDirection', v)"
          />

          <BFormGroup>
            <BFormCheckbox
              :model-value="annotation.showArrow ?? true"
              @update:model-value="(v: boolean) => update('showArrow', v)"
            >
              Show arrow
            </BFormCheckbox>
          </BFormGroup>

          <BFormGroup label="Line target distance">
            <BFormInput
              :model-value="String(annotation.lineTargetDistance ?? 0)"
              type="number"
              @update:model-value="(v: string) => update('lineTargetDistance', Number(v))"
            />
          </BFormGroup>
        </div>
      </template>
    </FormControlCheckbox>

    <FormControlCheckbox
      :model-value="annotation.showCircle ?? false"
      label="Show circle"
      @update:model-value="(v: boolean) => update('showCircle', v)"
    >
      <template
        v-if="annotation.showCircle"
        #section
      >
        <div class="d-flex flex-column gap-2 mt-2">
          <BFormGroup label="Circle size">
            <BFormInput
              :model-value="String(annotation.circleSize ?? 4)"
              type="number"
              min="1"
              @update:model-value="(v: string) => update('circleSize', Number(v))"
            />
          </BFormGroup>

          <BFormGroup label="Circle style">
            <BFormSelect
              :model-value="annotation.circleStyle ?? 'solid'"
              :options="strokeStyleOptions"
              @update:model-value="(v: string) => update('circleStyle', v)"
            />
          </BFormGroup>
        </div>
      </template>
    </FormControlCheckbox>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, type ComponentPublicInstance } from 'vue'
import type { PointAnnotationConfig, CompassDirection } from '@blueprint-chart/lib'
import { FormControlColorInput, FormControlUnitsInput, FormControlDirectionPicker, FormControlCheckbox, FormControlButtonGroup, FormControlButtonGroupEntry } from '@blueprint-chart/ui'
import IFluentLine from '~icons/fluent/line-horizontal-1-20-filled'
import IFluentCurveLeft from '~icons/fluent/arrow-hook-up-left-20-filled'
import IFluentCurveRight from '~icons/fluent/arrow-hook-up-right-20-filled'
import IFluentElbow from '~icons/fluent/arrow-turn-right-down-20-filled'

const props = defineProps<{
  annotation: PointAnnotationConfig
  labels: string[]
  chartWidth?: number
}>()

const emit = defineEmits<{
  'update:annotation': [value: PointAnnotationConfig]
}>()

const targetOptions = computed(() => props.labels.map(l => ({ value: l, text: l })))

const strokeStyleOptions = [
  { value: 'solid', text: 'Solid' },
  { value: 'dotted', text: 'Dotted' },
  { value: 'dashed', text: 'Dashed' },
]

function formatMaxWidth(v: number | string | undefined): string {
  if (v == null) {
    return '150px'
  }
  if (typeof v === 'number') {
    return `${
      v}px`
  }
  return String(v)
}

function update(key: string, value: unknown) {
  const copy = { ...props.annotation }
  if (value === undefined) {
    delete (copy as Record<string, unknown>)[key]
  }
  else {
    (copy as Record<string, unknown>)[key] = value
  }
  emit('update:annotation', copy as PointAnnotationConfig)
}

const textRef = ref<ComponentPublicInstance | null>(null)

onMounted(() => {
  const el = textRef.value?.$el as HTMLTextAreaElement | undefined
  if (el) {
    el.focus()
    el.select()
  }
})
</script>
