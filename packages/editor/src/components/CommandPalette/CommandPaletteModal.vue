<script setup lang="ts">
import { BFormInput, BModal } from 'bootstrap-vue-next'
import { useRouter, useRoute } from 'vue-router'
import IconPhMagnifyingGlass from '~icons/ph/magnifying-glass'
import { useChartSession, type SavedChartSummary } from '@/stores/chartSession'
import { getThumbnail, svgToDataUrl } from '@/composables/useChartThumbnail'

const open = defineModel<boolean>('open', { required: true })

const router = useRouter()
const route = useRoute()
const { listSavedCharts } = useChartSession()

const query = ref('')
const selectedIndex = ref(0)
const inputRef = useTemplateRef<{ focus: () => void } | null>('inputRef')

const charts = ref<SavedChartSummary[]>([])

const results = computed<SavedChartSummary[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    return charts.value.slice(0, 5)
  }
  return charts.value.filter(
    c => (c.title?.toLowerCase().includes(q)) || (c.description?.toLowerCase().includes(q)),
  )
})

const thumbnails = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const chart of charts.value) {
    const svg = getThumbnail(chart.id)
    if (svg) {
      map[chart.id] = svgToDataUrl(svg)
    }
  }
  return map
})

watch(query, () => {
  selectedIndex.value = 0
})

watch(() => route.path, () => {
  if (open.value) {
    open.value = false
  }
})

watch(open, (value) => {
  if (value) {
    charts.value = listSavedCharts()
  }
  else {
    query.value = ''
    selectedIndex.value = 0
  }
}, { immediate: true })

function onShown() {
  inputRef.value?.focus()
}

function moveSelection(delta: number) {
  const max = results.value.length - 1
  if (max < 0) {
    return
  }
  let next = selectedIndex.value + delta
  if (next < 0) {
    next = max
  }
  if (next > max) {
    next = 0
  }
  selectedIndex.value = next
}

function selectHighlighted() {
  const chart = results.value[selectedIndex.value]
  if (chart) {
    goTo(chart.id)
  }
}

function goTo(id: string) {
  open.value = false
  router.push(`/edit/${id}`)
}

function resultClass(index: number) {
  return {
    'command-palette-modal__result': true,
    'command-palette-modal__result--active': index === selectedIndex.value,
  }
}
</script>

<template>
  <BModal
    v-model="open"
    size="lg"
    centered
    no-header
    no-footer
    :autofocus="false"
    body-class="command-palette-modal__body"
    no-close-on-esc
    @shown="onShown"
  >
    <div class="command-palette-modal">
      <div class="command-palette-modal__input-row">
        <IconPhMagnifyingGlass class="command-palette-modal__icon" />
        <BFormInput
          ref="inputRef"
          v-model="query"
          aria-label="Search charts"
          placeholder="Search charts…"
          autofocus
          @keydown.escape.prevent="open = false"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
          @keydown.enter.prevent="selectHighlighted"
        />
      </div>
      <div
        v-if="results.length > 0"
        class="command-palette-modal__results"
        role="listbox"
        aria-label="Chart results"
      >
        <div
          v-for="(chart, index) in results"
          :key="chart.id"
          :class="resultClass(index)"
          role="option"
          tabindex="-1"
          :aria-selected="index === selectedIndex"
          @click="goTo(chart.id)"
          @mousemove="selectedIndex = index"
        >
          <img
            v-if="thumbnails[chart.id]"
            :src="thumbnails[chart.id]"
            class="command-palette-modal__thumb"
            alt=""
          >
          <div class="command-palette-modal__meta">
            <span class="command-palette-modal__title">{{ chart.title || 'Untitled' }}</span>
            <span class="command-palette-modal__desc">{{ chart.description }}</span>
          </div>
        </div>
      </div>
      <div
        v-else-if="query.trim()"
        class="command-palette-modal__empty"
      >
        No charts match "{{ query }}"
      </div>
    </div>
  </BModal>
</template>

<style scoped lang="scss">
.command-palette-modal {
  &__input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--bs-border-color);

    :deep(.form-control) {
      background: transparent;
      border: none;
      box-shadow: none;

      &:focus {
        background: transparent;
        border: none;
        box-shadow: none;
      }
    }
  }

  &__icon {
    flex-shrink: 0;
    color: var(--bs-secondary-color);
  }

  &__results {
    max-height: 24rem;
    overflow-y: auto;
    padding: 0.25rem 0;
  }

  &__result {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: inherit;

    &--active {
      background: var(--bs-tertiary-bg);
    }
  }

  &__thumb {
    width: 3rem;
    height: auto;
    flex-shrink: 0;
    display: block;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  &__title {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  &__desc {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  &__empty {
    padding: 1.5rem;
    text-align: center;
    color: var(--bs-secondary-color);
  }
}
</style>
