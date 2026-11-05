<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBreakpoint } from '@blueprint-chart/ui'
import { useDatasets } from '@/composables/useDatasets'
import { useSavedChartThumbnails } from '@/composables/useSavedChartThumbnails'
import { groupDatasets } from '@/utils/datasets'
import type { Dataset, DatasetGroup } from '@/utils/datasets'
import LayoutPageHeader from '@/components/Layout/LayoutPageHeader.vue'
import PanelShell from '@/components/Panel/PanelShell.vue'
import DatasetsCard from './DatasetsCard.vue'
import DatasetsDetail from './DatasetsDetail.vue'
import IPhTable from '~icons/ph/table'

const router = useRouter()
const { isNarrow } = useBreakpoint()
const { datasets, startChart } = useDatasets()
const { thumbnails, loadThumbnails } = useSavedChartThumbnails()

const groups = computed(() => groupDatasets(datasets.value))
const selectedKey = shallowRef<string | null>(null)
const pipelineKey = shallowRef('')
const selected = computed(() => groups.value.find(g => g.key === selectedKey.value) ?? null)
const count = computed(() => `${groups.value.length} ${groups.value.length === 1 ? 'dataset' : 'datasets'}`)
const panelTitle = computed(() => selected.value ? (selected.value.variants[0].charts[0].title || 'Untitled') : 'Dataset')
const pageClass = computed(() => ({ 'datasets-page__main--narrow': isNarrow.value }))
const galleryRef = useTemplateRef<HTMLElement>('galleryRef')

const drawerOpen = computed({
  get: () => selectedKey.value !== null,
  set: (open) => {
    if (!open) {
      selectedKey.value = null
    }
  },
})

watch(selected, (group) => {
  if (group) {
    loadThumbnails(group.variants.flatMap(v => v.charts.map(c => c.id)))
  }
})

function select(group: DatasetGroup) {
  selectedKey.value = group.key
  pipelineKey.value = group.variants[0].key
}

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
    <div
      class="datasets-page__main"
      :class="pageClass"
    >
      <div
        ref="galleryRef"
        class="datasets-page__main__gallery"
      >
        <div
          v-if="groups.length"
          class="datasets-page__main__gallery__grid"
        >
          <DatasetsCard
            v-for="group in groups"
            :key="group.key"
            :group="group"
            :selected="group.key === selectedKey"
            @select="select(group)"
            @new-chart="newChart"
          />
        </div>
        <div
          v-else
          class="datasets-page__main__gallery__empty"
        >
          <IPhTable
            class="datasets-page__main__gallery__empty__icon"
            aria-hidden="true"
          />
          <p class="datasets-page__main__gallery__empty__title">
            No datasets yet
          </p>
          <p class="datasets-page__main__gallery__empty__text">
            Datasets appear here once a chart has data.
          </p>
          <RouterLink
            to="/new"
            class="datasets-page__main__gallery__empty__link"
          >
            New chart
          </RouterLink>
        </div>
      </div>
      <PanelShell
        v-if="groups.length"
        v-model:drawer-open="drawerOpen"
        :title="panelTitle"
        :container-ref="galleryRef"
        :show-close="false"
      >
        <DatasetsDetail
          v-if="selected"
          v-model:pipeline="pipelineKey"
          :group="selected"
          :thumbnails="thumbnails"
          @new-chart="newChart"
        />
        <p
          v-else
          class="datasets-page__main__hint"
        >
          Select a dataset to see its data, steps and charts.
        </p>
      </PanelShell>
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

  &__main {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;

    &--narrow {
      flex-direction: column;
    }

    &__gallery {
      flex: 1;
      min-width: 0;
      min-height: 0;
      overflow-y: auto;
      padding: 1.75rem;

      .datasets-page__main--narrow & {
        padding: 1rem;
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
        gap: 1rem;
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

    &__hint {
      margin: 0;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-secondary-color);
    }
  }
}

:deep(.layout-panel__header) {
  border-bottom: 1px solid var(--bc-hairline);
}
</style>
