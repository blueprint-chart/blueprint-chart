<template>
  <div class="border rounded overflow-hidden bg-body-tertiary">
    <div class="d-flex align-items-center justify-content-between px-2 py-1 border-bottom">
      <small class="fw-medium">{{ fill.from }} – {{ fill.to }}</small>
      <BButton
        variant="link"
        size="sm"
        class="text-danger p-0"
        @click="$emit('remove')"
      >
        <span aria-hidden="true">&times;</span>
      </BButton>
    </div>

    <div class="p-2 d-flex flex-column gap-2">
      <BFormGroup
        label="From"
        :label-for="`af-from-${id}`"
      >
        <BFormSelect
          :id="`af-from-${id}`"
          :model-value="fill.from"
          :options="seriesOptions"
          @update:model-value="(v: string) => update('from', v)"
        />
      </BFormGroup>

      <BFormGroup
        label="To"
        :label-for="`af-to-${id}`"
      >
        <BFormSelect
          :id="`af-to-${id}`"
          :model-value="fill.to"
          :options="seriesOptions"
          @update:model-value="(v: string) => update('to', v)"
        />
      </BFormGroup>

      <BFormGroup
        label="Color"
        :label-for="`af-color-${id}`"
      >
        <BFormInput
          :id="`af-color-${id}`"
          type="color"
          :model-value="fill.color ?? '#cccccc'"
          @update:model-value="(v: string) => update('color', v)"
        />
      </BFormGroup>

      <BFormGroup>
        <BFormCheckbox
          :model-value="!!fill.negativeColor"
          switch
          @update:model-value="(v: boolean) => update('negativeColor', v ? '#f28e2b' : undefined)"
        >
          Use different color for negative differences
        </BFormCheckbox>
      </BFormGroup>

      <BFormGroup
        v-if="fill.negativeColor"
        label="Negative color"
        :label-for="`af-neg-color-${id}`"
      >
        <BFormInput
          :id="`af-neg-color-${id}`"
          type="color"
          :model-value="fill.negativeColor"
          @update:model-value="(v: string) => update('negativeColor', v)"
        />
      </BFormGroup>

      <BFormGroup
        label="Opacity"
        :label-for="`af-opacity-${id}`"
      >
        <div class="d-flex align-items-center gap-2">
          <BFormInput
            :id="`af-opacity-${id}`"
            type="range"
            :model-value="String(fill.opacity ?? 30)"
            min="0"
            max="100"
            class="flex-grow-1"
            @update:model-value="(v: string) => update('opacity', Number(v))"
          />
          <small
            class="text-nowrap"
            style="width: 3em;"
          >{{ fill.opacity ?? 30 }}%</small>
        </div>
      </BFormGroup>

      <BFormGroup
        label="Interpolation"
        :label-for="`af-interp-${id}`"
      >
        <BFormSelect
          :id="`af-interp-${id}`"
          :model-value="fill.interpolation ?? 'linear'"
          :options="interpolationChoices"
          @update:model-value="(v: string) => update('interpolation', v)"
        />
      </BFormGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AreaFillConfig } from '@blueprint-chart/lib'

const props = defineProps<{
  id: number
  seriesNames: string[]
}>()

defineEmits<{
  remove: []
}>()

const fill = defineModel<AreaFillConfig>('fill', { required: true })

const seriesOptions = computed(() =>
  props.seriesNames.map(n => ({ value: n, text: n })),
)

const interpolationChoices = [
  { value: 'linear', text: 'Linear' },
  { value: 'monotoneX', text: 'Monotone' },
  { value: 'step', text: 'Step' },
  { value: 'basis', text: 'Basis' },
  { value: 'cardinal', text: 'Cardinal' },
  { value: 'catmullRom', text: 'Catmull-Rom' },
]

function update(key: keyof AreaFillConfig, value: unknown) {
  const copy = { ...fill.value }
  if (value === undefined) {
    delete (copy as Record<string, unknown>)[key]
  }
  else {
    (copy as Record<string, unknown>)[key] = value
  }
  fill.value = copy
}
</script>
