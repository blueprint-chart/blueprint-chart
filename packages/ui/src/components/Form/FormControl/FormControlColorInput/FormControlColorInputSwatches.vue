<script setup lang="ts">
import { ColorSwatchGroupsKey } from '../../../../composables/injection-keys'

const emit = defineEmits<{ pick: [color: string] }>()

const groups = inject(ColorSwatchGroupsKey, ref([]))
const nonEmptyGroups = computed(() => groups.value.filter(group => group.swatches.length > 0))
</script>

<template>
  <div
    v-if="nonEmptyGroups.length"
    class="form-control-color-input-swatches"
  >
    <div
      v-for="(group, groupIndex) in nonEmptyGroups"
      :key="groupIndex"
      class="form-control-color-input-swatches__group"
    >
      <span class="form-control-color-input-swatches__group__title">{{ group.label }}</span>
      <button
        v-for="(swatch, swatchIndex) in group.swatches"
        :key="swatchIndex"
        type="button"
        class="form-control-color-input-swatches__group__swatch"
        :style="{ backgroundColor: swatch.color }"
        :title="swatch.name"
        :aria-label="`${swatch.name} ${swatch.color}`"
        @click="emit('pick', swatch.color)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-control-color-input-swatches {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;

    &__title {
      flex-basis: 100%;
      font-size: var(--bs-font-size-xs);
      color: var(--bs-secondary-color);
    }

    &__swatch {
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-xs);

      &:hover {
        border-color: var(--bs-body-color);
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--bc-focus-ring);
      }
    }
  }
}
</style>
