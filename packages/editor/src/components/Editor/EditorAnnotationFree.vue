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

    <div class="d-flex gap-2">
      <FormControlUnitsInput
        id="ann-free-x"
        :model-value="formatPosition(annotation.x)"
        label="X position"
        min="-50"
        :max="String(chartWidth ?? 600)"
        step="0.1"
        :units="['%', 'px']"
        no-slider
        center-relative
        class="flex-fill"
        @update:model-value="(v: string) => update('x', v)"
      />

      <FormControlUnitsInput
        id="ann-free-y"
        :model-value="formatPosition(annotation.y)"
        label="Y position"
        min="-50"
        :max="String(chartHeight ?? 400)"
        step="0.1"
        :units="['%', 'px']"
        no-slider
        center-relative
        class="flex-fill"
        @update:model-value="(v: string) => update('y', v)"
      />
    </div>

    <FormControlColorInput
      id="ann-free-text-color"
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
      id="ann-free-max-width"
      :model-value="formatMaxWidth(annotation.maxWidth)"
      label="Max width"
      min="0"
      :max="String(chartWidth ?? 600)"
      :units="['px', '%']"
      @update:model-value="(v: string) => update('maxWidth', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type ComponentPublicInstance } from 'vue'
import type { FreeAnnotationConfig } from '@blueprint-chart/lib'
import { FormControlColorInput, FormControlUnitsInput, FormControlCheckbox } from '@blueprint-chart/ui'

const props = defineProps<{
  annotation: FreeAnnotationConfig
  chartWidth?: number
  chartHeight?: number
}>()

const emit = defineEmits<{
  'update:annotation': [value: FreeAnnotationConfig]
}>()

function formatPosition(v: number | string): string {
  if (typeof v === 'number') { return `${v}%` }
  return String(v)
}

function formatMaxWidth(v: number | string | undefined): string {
  if (v == null) { return '150px' }
  if (typeof v === 'number') { return `${v}px` }
  return String(v)
}

function update(key: string, value: unknown) {
  const copy = { ...props.annotation }
  if (value === undefined) { delete (copy as Record<string, unknown>)[key] }
  else { (copy as Record<string, unknown>)[key] = value }
  emit('update:annotation', copy as FreeAnnotationConfig)
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
