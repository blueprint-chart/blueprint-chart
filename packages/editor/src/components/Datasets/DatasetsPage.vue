<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useDatasets } from '@/composables/useDatasets'
import type { Dataset } from '@/utils/datasets'
import LayoutPageHeader from '@/components/Layout/LayoutPageHeader.vue'
import DatasetsRow from './DatasetsRow.vue'
import IPhTable from '~icons/ph/table'

const router = useRouter()
const { datasets, startChart } = useDatasets()
const expanded = reactive<Record<string, boolean>>({})

const count = computed(() => `${datasets.value.length} ${datasets.value.length === 1 ? 'dataset' : 'datasets'}`)

function newChart(dataset: Dataset) {
  const id = startChart(dataset)
  if (id) {
    router.push(`/edit/${id}/data`)
  }
}
</script>

<template>
  <div class="datasets-page d-flex flex-column flex-grow-1">
    <LayoutPageHeader class="datasets-page__header">
      <template #start>
        <h1 class="datasets-page__header__title">
          Datasets
        </h1>
        <span class="datasets-page__header__count">{{ count }}</span>
      </template>
    </LayoutPageHeader>
    <div class="datasets-page__body">
      <div
        v-if="datasets.length"
        class="datasets-page__body__list"
      >
        <DatasetsRow
          v-for="dataset in datasets"
          :key="dataset.key"
          v-model:expanded="expanded[dataset.key]"
          :dataset="dataset"
          @new-chart="newChart(dataset)"
        />
      </div>
      <div
        v-else
        class="datasets-page__body__empty"
      >
        <IPhTable
          class="datasets-page__body__empty__icon"
          aria-hidden="true"
        />
        <p class="datasets-page__body__empty__title">
          No datasets yet
        </p>
        <p class="datasets-page__body__empty__text">
          Datasets appear here once a chart has data.
        </p>
        <RouterLink
          to="/new"
          class="datasets-page__body__empty__link"
        >
          New chart
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.datasets-page {
  min-height: 0;
  background: var(--bc-content-bg);

  &__header {
    &__title {
      margin: 0;
      font-size: var(--bs-font-size-md);
      font-weight: 600;
    }

    &__count {
      font-size: 0.8125rem;
      color: var(--bs-secondary-color);
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem;

    @media (min-width: 768px) {
      padding: 1.75rem;
    }

    &__list {
      max-width: 64rem;
      margin: 0 auto;
      background: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: var(--bs-border-radius-lg);
    }

    &__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 4rem 1rem;
      text-align: center;

      &__icon {
        width: 2rem;
        height: 2rem;
        color: var(--bs-secondary-color);
      }

      &__title {
        margin: 0;
        font-weight: 600;
      }

      &__text {
        margin: 0;
        font-size: var(--bs-font-size-sm);
        color: var(--bs-secondary-color);
      }

      &__link {
        font-size: var(--bs-font-size-sm);
      }
    }
  }
}
</style>
