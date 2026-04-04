<template>
  <div class="data-insight-badges">
    <span class="data-insight-badge data-insight-badge--shape">
      {{ columns.length }} cols · {{ rows.length }} rows
    </span>
    <span
      class="data-insight-badge"
      :class="qualityClass"
    >
      <span class="data-insight-badge__icon">{{ qualityIcon }}</span>
      {{ qualityLabel }}
    </span>
    <span
      v-if="benford"
      ref="benfordBadgeRef"
      class="data-insight-badge"
      :class="benfordClass"
    >
      <span class="data-insight-badge__icon">{{ benfordIcon }}</span>
      Benford's law
      <BTooltip
        teleport-to="body"
        :target="benfordBadgeRef"
        :title="benfordTooltip"
        placement="top"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { BTooltip } from 'bootstrap-vue-next'
import type { ColumnType } from '@/composables/useDataParser'

const props = defineProps<{
  columns: string[]
  rows: string[][]
  columnTypes: ColumnType[]
}>()

const benfordBadgeRef = useTemplateRef<HTMLElement>('benfordBadgeRef')

const missingCount = computed(() => {
  let count = 0
  for (const row of props.rows) {
    for (let i = 0; i < props.columns.length; i++) {
      const v = row[i]
      if (v === undefined || v === null || v === '') {
        count++
      }
    }
  }
  return count
})

const qualityIcon = computed(() => missingCount.value === 0 ? '✓' : '⚠')
const qualityLabel = computed(() => {
  if (missingCount.value === 0) {
    return 'No missing values'
  }
  return `${missingCount.value} missing value${missingCount.value === 1 ? '' : 's'}`
})
const qualityClass = computed(() =>
  missingCount.value === 0 ? 'data-insight-badge--quality-ok' : 'data-insight-badge--quality-warn',
)

const benford = computed(() => {
  const r = checkBenford(props.columns, props.rows, props.columnTypes)
  return r.eligible ? r : null
})

const benfordIcon = computed(() => {
  return benford.value?.pass ? '✓' : '⚠'
})
const benfordClass = computed(() =>
  benford.value?.pass ? 'data-insight-badge--benford-ok' : 'data-insight-badge--benford-warn',
)
const benfordTooltip = computed(() => {
  if (!benford.value) {
    return ''
  }
  if (benford.value.pass) {
    return 'All numeric columns follow Benford\'s Law — the expected distribution of leading digits in real-world data.'
  }
  const cols = benford.value.suspicious.join(', ')
  return `Column(s) ${cols} don't follow Benford's Law — the expected distribution of leading digits. This may indicate fabricated or anomalous data.`
})

</script>

<style scoped lang="scss">
.data-insight-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
}

.data-insight-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: var(--bs-font-size-sm);
  font-weight: 500;
  white-space: nowrap;

  &__icon {
    font-size: var(--bs-font-size-xs);
  }

  &--shape {
    background: var(--bs-secondary-bg);
    color: var(--bs-body-color);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &--quality-ok {
    background: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--quality-warn {
    background: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &--benford-ok {
    background: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--benford-warn {
    background: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }
}
</style>
