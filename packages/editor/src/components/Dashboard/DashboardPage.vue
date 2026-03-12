<template>
  <div
    class="dashboard-page"
    :class="pageClassList"
  >
    <div
      ref="galleryRef"
      class="dashboard-page__gallery"
    >
      <DashboardToolbar
        :chart-count="sortedCharts.length"
        :sort-value="sortValue"
        :layout="viewLayout"
        @update:sort-value="sortValue = $event"
        @update:layout="viewLayout = $event"
      />

      <GalleryGrid :layout="viewLayout">
        <GalleryCard
          v-for="chart in sortedCharts"
          :key="chart.id"
          :title="chart.title || 'Untitled'"
          :subtitle="chart.description"
          :selected="selectedChartId === chart.id"
          :layout="viewLayout"
          @click="selectChart(chart.id)"
        >
          <template #thumb>
            <div
              v-if="thumbnails[chart.id]"
              v-html="thumbnails[chart.id]"
            />
          </template>
          <template #footer>
            <DisplayDate
              v-if="chart.savedAt"
              :value="chart.savedAt"
            />
          </template>
        </GalleryCard>

        <DashboardNewCard
          :layout="viewLayout"
          @click="router.push('/new')"
        />

        <FeedbackEmptyState
          v-if="sortedCharts.length === 0"
          message="No saved charts yet. Create a new chart to get started."
        />
      </GalleryGrid>

      <PanelFloating
        v-if="panelMode === 'floating' && !isNarrow"
        :container-ref="galleryRef"
        title="Chart details"
        :position="floatingPosition"
        @dock="dock"
        @close="collapse"
      >
        <DashboardDetailContent
          v-if="selectedChart"
          :title="selectedChart.title || 'Untitled'"
          :subtitle="selectedChart.description"
          :thumbnail-html="selectedChartId ? thumbnails[selectedChartId] : undefined"
          :chart-type="selectedChart.chartType"
          :saved-at="selectedChart.savedAt ?? undefined"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
      </PanelFloating>
    </div>

    <template v-if="isNarrow">
      <LayoutBottomDrawer v-model="drawerOpen">
        <DashboardDetailContent
          v-if="selectedChart"
          :title="selectedChart.title || 'Untitled'"
          :subtitle="selectedChart.description"
          :thumbnail-html="selectedChartId ? thumbnails[selectedChartId] : undefined"
          :chart-type="selectedChart.chartType"
          :saved-at="selectedChart.savedAt ?? undefined"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
      </LayoutBottomDrawer>
    </template>
    <template v-else>
      <PanelDocked
        v-model="dockedPanelWidth"
        :collapsed="panelMode !== 'docked'"
        title="Chart details"
        @float="float"
        @close="collapse"
      >
        <DashboardDetailContent
          v-if="selectedChart"
          :title="selectedChart.title || 'Untitled'"
          :subtitle="selectedChart.description"
          :thumbnail-html="selectedChartId ? thumbnails[selectedChartId] : undefined"
          :chart-type="selectedChart.chartType"
          :saved-at="selectedChart.savedAt ?? undefined"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
      </PanelDocked>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  GalleryCard,
  GalleryGrid,
  DisplayDate,
  FeedbackEmptyState,
  LayoutBottomDrawer,
  useBreakpoint,
} from '@blueprint-chart/ui'
import { useChartSession, generateId } from '@/composables/useChartSession'
import { getThumbnail, saveThumbnail, renderThumbnailFromPayload } from '@/composables/useChartThumbnail'
import { useDashboardPanel } from '@/composables/useDashboardPanel'
import type { SavedChartSummary } from '@/composables/useChartSession'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import PanelFloating from '@/components/Panel/PanelFloating.vue'
import DashboardToolbar from './DashboardToolbar.vue'
import DashboardDetailContent from './DashboardDetailContent.vue'
import DashboardNewCard from './DashboardNewCard.vue'

const router = useRouter()
const { listSavedCharts, deleteChart } = useChartSession()
const { isNarrow } = useBreakpoint()
const {
  panelMode,
  selectedChartId,
  dockedPanelWidth,
  floatingPosition,
  selectChart,
  dock,
  float,
  collapse,
} = useDashboardPanel()

const galleryRef = ref<HTMLElement | null>(null)
const charts = ref<SavedChartSummary[]>([])
const thumbnails = reactive<Record<string, string>>({})
const sortValue = ref('date-desc')
const viewLayout = ref<'grid' | 'row'>('grid')

const sortedCharts = computed(() => {
  const list = [...charts.value]
  if (sortValue.value === 'date-desc') {
    list.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''))
  }
  else if (sortValue.value === 'date-asc') {
    list.sort((a, b) => (a.savedAt ?? '').localeCompare(b.savedAt ?? ''))
  }
  else if (sortValue.value === 'name-asc') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  return list
})

const selectedChart = computed(() =>
  charts.value.find(c => c.id === selectedChartId.value) ?? null,
)

const pageClassList = computed(() => ({
  'dashboard-page--narrow': isNarrow.value,
}))

const drawerOpen = computed({
  get: () => panelMode.value !== 'collapsed' && selectedChartId.value !== null,
  set: (open) => {
    if (!open) {
      collapse()
    }
  },
})

watch(isNarrow, (narrow) => {
  if (narrow && panelMode.value !== 'collapsed') {
    collapse()
  }
}, { immediate: true })

function refresh() {
  charts.value = listSavedCharts()
  loadThumbnails()
}

function loadThumbnails() {
  for (const chart of charts.value) {
    const cached = getThumbnail(chart.id)
    if (cached) {
      thumbnails[chart.id] = cached
      continue
    }
    const raw = localStorage.getItem(`blueprint-chart:${chart.id}`)
    if (!raw) {
      continue
    }
    try {
      const payload = JSON.parse(raw)
      const svg = renderThumbnailFromPayload(payload)
      if (svg) {
        saveThumbnail(chart.id, svg)
        thumbnails[chart.id] = svg
      }
    }
    catch {
      // skip corrupt entries
    }
  }
}

function editSelected() {
  if (selectedChartId.value) {
    router.push(`/edit/${selectedChartId.value}`)
  }
}

function duplicateSelected() {
  if (!selectedChartId.value) {
    return
  }
  const raw = localStorage.getItem(`blueprint-chart:${selectedChartId.value}`)
  if (!raw) {
    return
  }
  const newId = generateId()
  localStorage.setItem(`blueprint-chart:${newId}`, raw)
  const meta = localStorage.getItem(`blueprint-chart:${selectedChartId.value}:meta`)
  if (meta) {
    localStorage.setItem(`blueprint-chart:${newId}:meta`, meta)
  }
  const thumb = getThumbnail(selectedChartId.value)
  if (thumb) {
    saveThumbnail(newId, thumb)
  }
  refresh()
}

function deleteSelected() {
  if (!selectedChartId.value) {
    return
  }
  const id = selectedChartId.value
  collapse()
  deleteChart(id)
  delete thumbnails[id]
  refresh()
}

function handleKeydown(e: globalThis.KeyboardEvent) {
  if (e.key === 'Escape') {
    collapse()
  }
}

onMounted(() => {
  refresh()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: var(--bc-tile-gap);
  background: var(--bc-void-bg);

  &--narrow {
    flex-direction: column;
    gap: 0;
  }
}

.dashboard-page__gallery {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 1.75rem;
  background: var(--bc-tile-bg);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  border: var(--bc-tile-border);
  position: relative;

  .dashboard-page--narrow & {
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}

:deep(.layout-panel) {
  background: var(--bc-tile-bg);
}
</style>
