<template>
  <div
    class="dashboard-page"
    :class="pageClassList"
  >
    <div class="dashboard-page__inner">
      <DashboardToolbar
        :chart-count="sortedCharts.length"
        :sort-value="sortValue"
        :layout="layout"
        @update:sort-value="sortValue = $event"
        @update:layout="layout = $event"
      />

      <GalleryGrid :layout="layout">
        <GalleryCard
          v-for="chart in sortedCharts"
          :key="chart.id"
          :title="chart.title || 'Untitled'"
          :subtitle="chart.description"
          :selected="selectedId === chart.id"
          :layout="layout"
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
          :layout="layout"
          @click="router.push('/new')"
        />

        <FeedbackEmptyState
          v-if="sortedCharts.length === 0"
          message="No saved charts yet. Create a new chart to get started."
        />
      </GalleryGrid>
    </div>

    <DashboardDetailPanel
      :open="panelOpen"
      :title="selectedChart?.title || 'Untitled'"
      :subtitle="selectedChart?.description"
      :thumbnail-html="selectedId ? thumbnails[selectedId] : undefined"
      :chart-type="selectedChart?.chartType || ''"
      :saved-at="selectedChart?.savedAt ?? undefined"
      :scene-count="0"
      @close="closePanel"
      @edit="editSelected"
      @duplicate="duplicateSelected"
      @delete="deleteSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GalleryCard, GalleryGrid, DisplayDate, FeedbackEmptyState } from '@blueprint-chart/ui'
import { useChartSession, generateId } from '@/composables/useChartSession'
import { getThumbnail, saveThumbnail, renderThumbnailFromPayload } from '@/composables/useChartThumbnail'
import type { SavedChartSummary } from '@/composables/useChartSession'
import DashboardToolbar from './DashboardToolbar.vue'
import DashboardDetailPanel from './DashboardDetailPanel.vue'
import DashboardNewCard from './DashboardNewCard.vue'

const router = useRouter()
const { listSavedCharts, deleteChart } = useChartSession()

const charts = ref<SavedChartSummary[]>([])
const thumbnails = reactive<Record<string, string>>({})
const selectedId = ref<string | null>(null)
const sortValue = ref('date-desc')
const layout = ref<'grid' | 'row'>('grid')

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
  charts.value.find(c => c.id === selectedId.value) ?? null,
)

const panelOpen = computed(() => selectedId.value !== null)

const pageClassList = computed(() => ({
  'dashboard-page--panel-open': panelOpen.value,
}))

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

function selectChart(id: string) {
  selectedId.value = selectedId.value === id ? null : id
}

function closePanel() {
  selectedId.value = null
}

function editSelected() {
  if (selectedId.value) {
    router.push(`/edit/${selectedId.value}`)
  }
}

function duplicateSelected() {
  // Duplicate by copying localStorage entry with new ID
  if (!selectedId.value) {
    return
  }
  const raw = localStorage.getItem(`blueprint-chart:${selectedId.value}`)
  if (!raw) {
    return
  }
  const newId = generateId()
  localStorage.setItem(`blueprint-chart:${newId}`, raw)
  const meta = localStorage.getItem(`blueprint-chart:${selectedId.value}:meta`)
  if (meta) {
    localStorage.setItem(`blueprint-chart:${newId}:meta`, meta)
  }
  const thumb = getThumbnail(selectedId.value)
  if (thumb) {
    saveThumbnail(newId, thumb)
  }
  refresh()
}

function deleteSelected() {
  if (!selectedId.value) {
    return
  }
  const id = selectedId.value
  selectedId.value = null
  deleteChart(id)
  delete thumbnails[id]
  refresh()
}

function handleKeydown(e: globalThis.KeyboardEvent) {
  if (e.key === 'Escape') {
    closePanel()
  }
}

onMounted(() => {
  refresh()
  document.addEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  background: var(--bc-void-bg);
  min-height: 100%;
  padding: 1.75rem 1.75rem 3.75rem;
  transition: padding-right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-page--panel-open {
  padding-right: calc(380px + 1.75rem);
}

.dashboard-page__inner {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
