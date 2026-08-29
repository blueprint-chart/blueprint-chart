<template>
  <div class="d-flex flex-column gap-2">
    <BFormGroup label="Text">
      <BFormInput
        ref="textRef"
        :model-value="annotation.text ?? ''"
        placeholder="Optional label"
        @update:model-value="(v) => update('text', v || undefined)"
      />
    </BFormGroup>

    <BFormGroup label="Orientation">
      <BFormSelect
        :model-value="annotation.orientation ?? 'vertical'"
        :options="orientationOptions"
        @update:model-value="(v) => update('orientation', v)"
      />
    </BFormGroup>

    <div class="d-flex gap-2">
      <BFormGroup
        label="Start"
        class="flex-fill"
      >
        <BFormSelect
          v-if="isDiscrete"
          :model-value="String(annotation.start)"
          :options="labelOptions"
          @update:model-value="(v) => update('start', v)"
        />
        <BFormInput
          v-else
          :model-value="String(annotation.start)"
          @update:model-value="(v) => update('start', isNaN(Number(v)) ? v : Number(v))"
        />
      </BFormGroup>

      <BFormGroup
        label="End"
        class="flex-fill"
      >
        <BFormSelect
          v-if="isDiscrete"
          :model-value="String(annotation.end)"
          :options="labelOptions"
          @update:model-value="(v) => update('end', v)"
        />
        <BFormInput
          v-else
          :model-value="String(annotation.end)"
          @update:model-value="(v) => update('end', isNaN(Number(v)) ? v : Number(v))"
        />
      </BFormGroup>
    </div>

    <div
      v-if="isDiscrete"
      class="d-flex gap-2"
    >
      <FormControlDropdown
        :id="`ann-range-start-anchor-${$.uid}`"
        :model-value="annotation.startAnchor ?? 'center'"
        label="Start anchor"
        light-label
        block
        class="flex-fill"
        @update:model-value="(v: string) => update('startAnchor', v)"
      >
        <FormControlDropdownEntry
          value="start"
          label="Start"
        >
          <template #icon>
            <IPhAlignLeft />
          </template>
        </FormControlDropdownEntry>
        <FormControlDropdownEntry
          value="center"
          label="Center"
        >
          <template #icon>
            <IPhAlignCenterHorizontal />
          </template>
        </FormControlDropdownEntry>
        <FormControlDropdownEntry
          value="end"
          label="End"
        >
          <template #icon>
            <IPhAlignRight />
          </template>
        </FormControlDropdownEntry>
      </FormControlDropdown>

      <FormControlDropdown
        :id="`ann-range-end-anchor-${$.uid}`"
        :model-value="annotation.endAnchor ?? 'center'"
        label="End anchor"
        light-label
        block
        class="flex-fill"
        @update:model-value="(v: string) => update('endAnchor', v)"
      >
        <FormControlDropdownEntry
          value="start"
          label="Start"
        >
          <template #icon>
            <IPhAlignLeft />
          </template>
        </FormControlDropdownEntry>
        <FormControlDropdownEntry
          value="center"
          label="Center"
        >
          <template #icon>
            <IPhAlignCenterHorizontal />
          </template>
        </FormControlDropdownEntry>
        <FormControlDropdownEntry
          value="end"
          label="End"
        >
          <template #icon>
            <IPhAlignRight />
          </template>
        </FormControlDropdownEntry>
      </FormControlDropdown>
    </div>

    <FormControlColorInput
      id="ann-range-bg-color"
      :model-value="annotation.bgColor ?? '#cccccc'"
      label="Background color"
      @update:model-value="(v: string) => update('bgColor', v)"
    />

    <FormControlSliderInput
      id="ann-range-bg-opacity"
      :model-value="String(annotation.bgOpacity ?? 20)"
      label="Background opacity"
      min="0"
      max="100"
      suffix="%"
      @update:model-value="(v) => update('bgOpacity', Number(v))"
    />

    <template v-if="annotation.text">
      <FormControlColorInput
        id="ann-range-text-color"
        :model-value="annotation.textColor ?? '#000000'"
        label="Text color"
        @update:model-value="(v: string) => update('textColor', v)"
      />

      <FormControlDirectionPicker
        :model-value="annotation.direction ?? 'center'"
        label="Direction"
        @update:model-value="(v) => update('direction', v)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { RangeAnnotationConfig } from '@blueprint-chart/lib'
import { FormControlColorInput, FormControlSliderInput, FormControlDirectionPicker, FormControlDropdown, FormControlDropdownEntry } from '@blueprint-chart/ui'
import IPhAlignLeft from '~icons/ph/align-left'
import IPhAlignCenterHorizontal from '~icons/ph/align-center-horizontal'
import IPhAlignRight from '~icons/ph/align-right'

const props = defineProps<{
  labels: string[]
}>()

const annotation = defineModel<RangeAnnotationConfig>('annotation', { required: true })

const orientationOptions = [
  { value: 'vertical', text: 'Vertical' },
  { value: 'horizontal', text: 'Horizontal' },
]

const isDiscrete = computed(() =>
  (annotation.value.orientation ?? 'vertical') === 'vertical' && props.labels.length > 0,
)

const labelOptions = computed(() => props.labels.map(l => ({ value: l, text: l })))

function update(key: string, value: unknown) {
  const copy = { ...annotation.value }
  if (value === undefined) {
    delete (copy as Record<string, unknown>)[key]
  }
  else { (copy as Record<string, unknown>)[key] = value }
  annotation.value = copy as RangeAnnotationConfig
}

const textRef = ref<ComponentPublicInstance | null>(null)

onMounted(() => {
  const el = textRef.value?.$el as HTMLInputElement | undefined
  if (el) {
    el.focus()
    el.select()
  }
})
</script>
