<template>
  <div class="d-flex flex-column vh-100">
    <LayoutNavbar :transparent="true">
      <template #center>
        <div
          v-if="isLanding"
          class="shell-navbar__anchors"
        >
          <a
            href="#features"
            @click.prevent="scrollTo('features')"
          >Features</a>
          <a
            href="#transforms"
            @click.prevent="scrollTo('transforms')"
          >Transforms</a>
          <a
            href="#bpc"
            @click.prevent="scrollTo('bpc')"
          >BPC Format</a>
          <a
            href="#stories"
            @click.prevent="scrollTo('stories')"
          >Stories</a>
          <a
            href="#open-source"
            @click.prevent="scrollTo('open-source')"
          >Open Source</a>
        </div>
        <NavigationStepper
          v-else-if="mode === 'wizard'"
          v-model:current-step="currentIndex"
          :steps="stepLabels"
          :disabled-steps="disabledSteps"
          size="md"
        />
      </template>

      <template #right>
        <div
          ref="searchContainer"
          class="shell-navbar__search"
          :class="{ 'shell-navbar__search--compact': mode === 'wizard' }"
        >
          <BFormInput
            v-model="searchQuery"
            size="sm"
            placeholder="Search charts..."
            @keydown.escape="searchQuery = ''"
          />
          <div
            v-if="searchResults.length"
            class="shell-navbar__dropdown"
          >
            <button
              v-for="chart in searchResults"
              :key="chart.id"
              class="shell-navbar__result"
              @click="goToChart(chart.id)"
            >
              <div class="d-flex align-items-center gap-2">
                <div
                  v-if="getThumbnail(chart.id)"
                  class="shell-navbar__result-thumb"
                  v-html="getThumbnail(chart.id)"
                />
                <div class="min-width-0 flex-grow-1">
                  <span class="fw-bold text-truncate d-block">{{ chart.title || 'Untitled' }}</span>
                  <span class="small text-body-secondary text-truncate d-block">{{ chart.description }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </template>
    </LayoutNavbar>
    <div class="d-flex flex-grow-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { BFormInput } from 'bootstrap-vue-next'
import { NavigationStepper } from '@blueprint-chart/ui'
import { useChartSession } from '@/composables/useChartSession'
import { useNavbar } from '@/composables/useNavbar'
import { useWizard } from '@/composables/useWizard'
import { useDataTable } from '@/composables/useDataTable'
import LayoutNavbar from '@/components/Layout/LayoutNavbar.vue'
import IPhTable from '~icons/ph/table'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhExport from '~icons/ph/export'

const route = useRoute()
const router = useRouter()
const { listSavedCharts } = useChartSession()
const { mode } = useNavbar()

const isLanding = computed(() => route.path === '/')

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// Wizard composables (only active when mode === 'wizard')
const { currentIndex, steps } = useWizard()
const dataTable = useDataTable()

const searchQuery = ref('')
const searchContainer = useTemplateRef<HTMLElement>('searchContainer')

// Stepper configuration
const stepIcons: Record<string, typeof IPhTable> = {
  data: IPhTable,
  edit: IPhChartBar,
  export: IPhExport,
}
const stepLabels = steps.map(s => ({ label: s.label, icon: stepIcons[s.key] }))

const disabledSteps = computed(() => {
  const hasParsed = dataTable.rows.value.length > 0
  if (!hasParsed) {
    return [1, 2]
  }
  return []
})

// Search
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) {
    return []
  }
  return listSavedCharts().filter(
    c =>
      (c.title?.toLowerCase().includes(q))
      || (c.description?.toLowerCase().includes(q)),
  )
})

function getThumbnail(id: string): string | null {
  return localStorage.getItem(`blueprint-chart:${id}:thumbnail`)
}

function goToChart(id: string) {
  searchQuery.value = ''
  router.push(`/edit/${id}`)
}

function dismissSearch() {
  searchQuery.value = ''
}

// Dismiss on route change
watch(() => route.path, dismissSearch)

// Dismiss on click outside
onClickOutside(searchContainer, () => {
  searchQuery.value = ''
})
</script>

<style scoped lang="scss">
.shell-navbar__search {
  position: relative;
  width: 320px;
  max-width: 100%;

  :deep(.form-control) {
    background: var(--bc-tile-bg);
    border: var(--bc-tile-border);
    border-radius: 8px;
    box-shadow: var(--bc-tile-shadow);

    &:focus {
      box-shadow: var(--bc-tile-shadow), 0 0 0 0.2rem rgba(37, 99, 160, 0.15);
    }
  }
}

.shell-navbar__search--compact {
  width: 180px;
}

.shell-navbar__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  max-height: 320px;
  overflow-y: auto;
  margin-top: 0.25rem;
}

.shell-navbar__result {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: inherit;

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  & + & {
    border-top: 1px solid var(--bs-border-color);
  }
}

.shell-navbar__result-thumb {
  width: 48px;
  flex-shrink: 0;

  :deep(svg) {
    width: 100%;
    height: auto;
    display: block;
  }
}

.shell-navbar__anchors {
  display: flex;
  align-items: center;
  gap: 0;

  a {
    display: block;
    padding: 0 1rem;
    height: 2.75rem;
    line-height: 2.75rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--bs-secondary-color);
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: var(--bs-body-color);
    }
  }
}

@media (max-width: 48rem) {
  .shell-navbar__anchors {
    display: none;
  }
}
</style>
