<template>
  <div
    class="container py-4"
    style="max-width: 720px;"
  >
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        Your Charts
      </h4>
      <HomeSampleDropdown
        @blank="handleBlank"
        @select="handleSample"
      />
    </div>

    <div
      v-if="charts.length === 0"
      class="text-muted text-center py-5"
    >
      No saved charts yet. Click <strong>New Chart</strong> above to get started.
    </div>

    <HomeChartCard
      v-for="chart in charts"
      :key="chart.id"
      :chart="chart"
      :thumbnail="thumbnails[chart.id]"
      @select="router.push('/edit/' + chart.id)"
      @delete="handleDelete(chart.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChartSession } from '@/composables/useChartSession'
import { getThumbnail, saveThumbnail, renderThumbnailFromPayload } from '@/composables/useChartThumbnail'
import type { SavedChartSummary } from '@/composables/useChartSession'
import type { ChartSample } from '@blueprint-chart/lib'
import HomeChartCard from './HomeChartCard.vue'
import HomeSampleDropdown from './HomeSampleDropdown.vue'

const router = useRouter()
const { listSavedCharts, deleteChart, createSession, loadSample } = useChartSession()

function handleBlank() {
  router.push('/new')
}

function handleSample(sample: ChartSample) {
  const id = createSession()
  loadSample(sample)
  router.push(`/edit/${id}`)
}

const charts = ref<SavedChartSummary[]>([])
const thumbnails = reactive<Record<string, string>>({})

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

    // Generate missing thumbnail on the fly
    const raw = localStorage.getItem(`blueprint-chart:${chart.id}`)
    if (!raw) { continue }
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

function handleDelete(id: string) {
  deleteChart(id)
  delete thumbnails[id]
  refresh()
}

onMounted(refresh)
</script>
