<template>
  <div class="border rounded p-2 d-flex flex-column gap-2">
    <BFormGroup
      label="Target"
      :label-for="`ann-target-${index}`"
    >
      <BFormSelect
        :id="`ann-target-${index}`"
        :model-value="annotation.target"
        :options="targetOptions"
        @update:model-value="(v: string) => update('target', v)"
      />
    </BFormGroup>
    <BFormGroup
      label="Text"
      :label-for="`ann-text-${index}`"
    >
      <BFormInput
        :id="`ann-text-${index}`"
        :model-value="annotation.text"
        placeholder="Annotation text"
        @update:model-value="(v: string) => update('text', v)"
      />
    </BFormGroup>
    <div class="d-flex gap-2">
      <BFormGroup
        label="X offset"
        :label-for="`ann-dx-${index}`"
        class="flex-fill"
      >
        <BFormInput
          :id="`ann-dx-${index}`"
          :model-value="String(annotation.dx ?? 40)"
          type="number"
          @update:model-value="(v: string) => update('dx', Number(v))"
        />
      </BFormGroup>
      <BFormGroup
        label="Y offset"
        :label-for="`ann-dy-${index}`"
        class="flex-fill"
      >
        <BFormInput
          :id="`ann-dy-${index}`"
          :model-value="String(annotation.dy ?? -40)"
          type="number"
          @update:model-value="(v: string) => update('dy', Number(v))"
        />
      </BFormGroup>
    </div>
    <BButton
      variant="outline-danger"
      size="sm"
      @click="$emit('remove')"
    >
      Remove
    </BButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnnotationConfig } from '@blueprint-chart/lib'

const props = defineProps<{
  annotation: AnnotationConfig
  index: number
  labels: string[]
}>()

const emit = defineEmits<{
  'update:annotation': [value: AnnotationConfig]
  'remove': []
}>()

const targetOptions = computed(() =>
  props.labels.map(l => ({ value: l, text: l })),
)

function update(key: keyof AnnotationConfig, value: unknown) {
  const copy = { ...props.annotation }
  ;(copy as Record<string, unknown>)[key] = value
  emit('update:annotation', copy)
}
</script>
