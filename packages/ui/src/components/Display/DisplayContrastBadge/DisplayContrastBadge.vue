<template>
  <span
    ref="badgeRef"
    class="display-contrast-badge"
    :class="badgeClass"
  >
    {{ level }}
    <span class="display-contrast-badge__ratio">{{ ratio }}</span>
    <IconPhInfo class="display-contrast-badge__info" />
    <BTooltip
      teleport-to="body"
      :target="badgeRef"
      :title="tooltipText"
      placement="top"
    />
  </span>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { BTooltip } from 'bootstrap-vue-next'
import IconPhInfo from '~icons/ph/info'

const props = defineProps<{
  level: 'AAA' | 'AA' | 'Fail'
  ratio?: string
}>()

const badgeRef = useTemplateRef<HTMLElement>('badgeRef')

const badgeClass = computed(() => ({
  'display-contrast-badge--aaa': props.level === 'AAA',
  'display-contrast-badge--aa': props.level === 'AA',
  'display-contrast-badge--fail': props.level === 'Fail',
}))

const tooltipText = computed(() => {
  switch (props.level) {
    case 'AAA':
      return 'WCAG AAA \u2014 Ratio \u2265 7:1. Enhanced contrast, meets the highest accessibility standard.'
    case 'AA':
      return 'WCAG AA \u2014 Ratio \u2265 4.5:1. Minimum contrast for normal text. Sufficient for most users.'
    default:
      return 'Below WCAG AA \u2014 Ratio < 4.5:1. Insufficient contrast. May be hard to read for some users.'
  }
})
</script>

<style scoped lang="scss">
.display-contrast-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  padding: 0.15em 0.45em;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: var(--bs-border-radius-sm);
  cursor: default;

  &--aaa {
    background-color: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--aa {
    background-color: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &--fail {
    background-color: var(--bs-danger-bg-subtle);
    color: var(--bs-danger-text-emphasis);
  }
}

.display-contrast-badge__ratio {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.display-contrast-badge__info {
  font-size: 0.75em;
  opacity: 0.7;
}
</style>
