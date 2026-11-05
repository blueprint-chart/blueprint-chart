<script setup lang="ts">
import { useLazyTooltip } from '@/composables/useLazyTooltip'

export type PalettesCardChipStatus = 'pass' | 'warn' | 'fail'

const props = defineProps<{
  label: string
  status: PalettesCardChipStatus
  detail: string
}>()

const chip = useTemplateRef<HTMLElement>('chip')
const dotClass = computed(() => `palettes-card-chip__dot--${props.status}`)
const tooltip = useLazyTooltip()
</script>

<template>
  <span
    ref="chip"
    class="palettes-card-chip"
    tabindex="0"
    @mouseenter="tooltip.arm"
    @focus="tooltip.arm"
  >
    <span
      class="palettes-card-chip__dot"
      :class="dotClass"
      aria-hidden="true"
    />
    {{ label }}
    <span class="visually-hidden">: {{ detail }}</span>
    <BTooltip
      v-if="tooltip.mounted.value"
      v-model="tooltip.shown.value"
      teleport-to="body"
      :target="chip"
      :title="detail"
      placement="top"
    />
  </span>
</template>
<style scoped lang="scss">
.palettes-card-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  font-size: var(--bs-font-size-xs);
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
  color: var(--bs-secondary-color);
  background: var(--bc-wash-soft);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-pill);
  cursor: default;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: var(--bc-focus-ring);
  }

  &__dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;

    &--pass {
      background: var(--bs-success);
    }

    &--warn {
      background: var(--bs-warning);
    }

    &--fail {
      background: var(--bs-danger);
    }
  }
}
</style>
