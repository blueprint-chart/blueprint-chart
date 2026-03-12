<template>
  <div
    v-if="isEmpty"
    class="data-check-empty"
  >
    <IPhMagnifyingGlass class="data-check-empty-icon" />
    <p>No rows match your filters</p>
  </div>
  <div
    v-else
    class="data-check-table"
  >
    <BTableSimple
      hover
      bordered
    >
      <BThead>
        <BTr>
          <BTh class="data-check-table__row-num">
            #
          </BTh>
          <BTh
            v-for="(col, ci) in displayColumns"
            :key="ci"
            class="data-check-table__col-header"
            :class="{ 'data-check-table__col--selected': ci === selectedColumnIndex }"
            @click="selectColumn(ci)"
          >
            <div class="data-check-table__col-name">
              {{ col }}
            </div>
            <div class="data-check-table__col-type">
              {{ displayColumnTypes[ci] ?? 'string' }}
            </div>
          </BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr
          v-for="(row, ri) in displayRows"
          :key="ri"
        >
          <BTd class="data-check-table__row-num">
            {{ ri + 1 }}
          </BTd>
          <BTd
            v-for="(cell, ci) in row"
            :key="ci"
            :class="{
              'data-check-table__col--selected': ci === selectedColumnIndex,
              'data-check-table__cell--numeric': displayColumnTypes[ci] === 'number',
            }"
          >
            {{ cell }}
          </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BTableSimple, BThead, BTbody, BTr, BTh, BTd } from 'bootstrap-vue-next'
import { useDataTable } from '@/composables/useDataTable'
import { useEditorPanel } from '@/composables/useEditorPanel'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

const { selectColumn, selectedColumnIndex } = useEditorPanel()
const { displayColumns, displayRows, displayColumnTypes } = useDataTable()

const isEmpty = computed(() => displayRows.value.length === 0)
</script>

<style scoped lang="scss">
.data-check-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--bs-secondary-color);
  border: 1px dashed var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  text-align: center;

  .data-check-empty-icon {
    font-size: 2rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: var(--bs-font-size-md);
  }
}

.data-check-table {
  position: relative;
  z-index: 0;
  line-height: 1.5;
  border-radius: var(--bs-border-radius-lg);
  border: 1px solid var(--bs-border-color);
  overflow: hidden;

  :deep(table) {
    margin-bottom: 0;
    --bs-table-border-color: var(--bs-border-color);
  }

  :deep(thead th) {
    background: var(--bc-tile-bg-elevated, var(--bs-tertiary-bg));
    border-bottom-width: 2px;
  }

  :deep(tbody td) {
    background: var(--bc-tile-bg, var(--bs-body-bg));
  }

  :deep(.table-bordered > :not(caption) > *) {
    border-width: 0;
  }

  :deep(.table-bordered > :not(caption) > * > *) {
    border-width: 0 0 1px;

    &:not(:last-child) {
      border-right-width: 1px;
    }
  }

  :deep(.table-hover > tbody > tr:hover > *) {
    background: var(--bc-tile-bg-elevated, var(--bs-tertiary-bg));
  }

  &__row-num {
    color: var(--bs-secondary-color);
    text-align: center;
    width: 3rem;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  &__col-header {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    vertical-align: bottom;
  }

  &__col-name {
    font-weight: 600;
  }

  &__col-type {
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
    font-weight: 400;
  }

  &__col--selected {
    background: var(--bs-primary-bg-subtle) !important;
  }

  &__cell--numeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}
</style>
