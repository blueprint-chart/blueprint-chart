<template>
  <div
    class="d-flex flex-column"
    :class="isLanding ? 'min-vh-100' : 'vh-100'"
  >
    <LayoutNavbar :transparent="true">
      <template #center>
        <NavigationStepper
          v-if="mode === 'wizard'"
          v-model:current-step="currentIndex"
          :steps="stepLabels"
          :disabled-steps="disabledSteps"
          size="md"
        />
        <div
          v-else
          ref="searchContainer"
          class="shell-navbar__search"
        >
          <BFormInput
            v-model="searchQuery"
            size="sm"
            placeholder="Search charts..."
            @keydown.escape="searchQuery = ''"
          />
          <div
            v-if="searchResults.length"
            class="shell-navbar__search__dropdown"
          >
            <button
              v-for="chart in searchResults"
              :key="chart.id"
              class="shell-navbar__search__result"
              @click="goToChart(chart.id)"
            >
              <div class="d-flex align-items-center gap-2">
                <div
                  v-if="searchThumbnails[chart.id]"
                  class="shell-navbar__search__result__thumb"
                  v-html="searchThumbnails[chart.id]"
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

      <template #right>
        <ButtonIcon
          :icon-left="IPhPlus"
          label="New chart"
          variant="primary"
          size="sm"
          tag="a"
          href="#/new"
        />
      </template>
    </LayoutNavbar>
    <div
      class="d-flex flex-grow-1"
      :class="{ 'overflow-auto': !isLanding }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { BFormInput } from 'bootstrap-vue-next'
import { NavigationStepper, ButtonIcon } from '@blueprint-chart/ui'
import { useChartSession } from '@/stores/chartSession'
import { useNavbar } from '@/stores/navbar'
import { useWizard } from '@/stores/wizard'
import { useDataTable } from '@/stores/dataTable'
import IPhTable from '~icons/ph/table'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhExport from '~icons/ph/export'
import IPhPlus from '~icons/ph/plus'

const route = useRoute()
const router = useRouter()
const { listSavedCharts } = useChartSession()
const { mode } = storeToRefs(useNavbar())

const isLanding = computed(() => route.path === '/')

// Wizard composables (only active when mode === 'wizard')
const { currentIndex, steps } = useWizard()
const dataTable = useDataTable()

const searchQuery = shallowRef('')
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

const searchThumbnails = computed(() => {
  const map: Record<string, string | null> = {}
  for (const chart of searchResults.value) {
    map[chart.id] = localStorage.getItem(`blueprint-chart:${chart.id}:thumbnail`)
  }
  return map
})

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
.shell-navbar {
  &__search {
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

    &__dropdown {
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

    &__result {
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

      &__thumb {
        width: 48px;
        flex-shrink: 0;

        :deep(svg) {
          width: 100%;
          height: auto;
          display: block;
        }
      }
    }
  }
}

</style>
