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
      sticky-header
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
    font-size: 0.875rem;
  }
}

.data-check-table {
  overflow: auto;
  max-height: 500px;
  position: relative;
  z-index: 0;
  font-size: 0.8125rem;
  line-height: 1.5;

  :deep(table) {
    margin-bottom: 0;
  }

  :deep(thead th) {
    background: var(--bs-tertiary-bg);
    border-bottom-width: 2px;
  }
}

.data-check-table__row-num {
  color: var(--bs-secondary-color);
  text-align: center;
  width: 3rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.data-check-table__col-header {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  vertical-align: bottom;
}

.data-check-table__col-name {
  font-weight: 600;
}

.data-check-table__col-type {
  font-size: 0.6875rem;
  color: var(--bs-secondary-color);
  font-weight: 400;
}

.data-check-table__col--selected {
  background: var(--bs-primary-bg-subtle) !important;
}

.data-check-table__cell--numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
