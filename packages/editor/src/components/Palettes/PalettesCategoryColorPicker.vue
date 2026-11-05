<script setup lang="ts">
import { listPalettes } from '@blueprint-chart/lib'
import { FormControlColorInput } from '@blueprint-chart/ui'
import { useCustomPalettes } from '@/stores/customPalettes'

const model = defineModel<string>({ required: true })

const { palettes } = useCustomPalettes()
const inputId = useId()

const groups = computed(() => [
  ...palettes.value.map(({ id, label, colors }) => ({ key: id, label, colors })),
  ...listPalettes().map(({ name, label, colors }) => ({ key: name, label, colors })),
])
</script>

<template>
  <div class="palettes-category-color-picker">
    <FormControlColorInput
      :id="inputId"
      v-model="model"
      label="Color"
      class="palettes-category-color-picker__input"
    />
    <div
      v-for="group in groups"
      :key="group.key"
      class="palettes-category-color-picker__group"
    >
      <span class="palettes-category-color-picker__group__title small text-body-secondary">{{ group.label }}</span>
      <button
        v-for="(color, index) in group.colors"
        :key="index"
        type="button"
        class="palettes-category-color-picker__group__swatch"
        :style="{ backgroundColor: color }"
        :aria-label="`${group.label} ${color}`"
        @click="model = color"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.palettes-category-color-picker {
  &__group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.5rem;

    &__title {
      flex-basis: 100%;
    }

    &__swatch {
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: 1px solid var(--bs-border-color);
      border-radius: var(--bs-border-radius-sm);
    }
  }
}
</style>
