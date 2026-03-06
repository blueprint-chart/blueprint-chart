<template>
  <div class="d-flex flex-column vh-100">
    <nav class="shell-navbar">
      <router-link
        to="/"
        class="navbar-brand text-decoration-none mb-0 d-flex align-items-center gap-2"
      >
        <img
          :src="logoSrc"
          alt="Blueprint Chart"
          class="shell-navbar__logo"
        >
        <span class="bc-brand-gradient fw-bold">Blueprint Chart</span>
      </router-link>

      <!-- Center: search (home) or stepper (wizard) -->
      <div
        v-if="mode === 'home'"
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
      <NavigationStepper
        v-else
        v-model:current-step="currentIndex"
        :steps="stepLabels"
        :disabled-steps="disabledSteps"
        size="md"
      />

      <!-- Right: step controls (wizard) + theme toggle -->
      <div class="shell-navbar__right">
        <template v-if="mode === 'wizard'">
          <template v-if="currentStep?.key === 'edit'">
            <ButtonUndo
              :disabled="!canUndo"
              @click="undo"
            />
            <ButtonRedo
              :disabled="!canRedo"
              @click="redo"
            />
            <LayoutToolbarSeparator />
            <NavigationToggle
              v-model="viewModeModel"
              :options="viewModeOptions"
            />
          </template>
          <!-- Data / Export steps: no toolbar controls -->
          <LayoutToolbarSeparator />
          <div
            ref="searchContainer"
            class="shell-navbar__search shell-navbar__search--compact"
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
        <ButtonIcon
          :icon-left="themeIcon"
          label="Toggle theme"
          hide-label
          square
          variant="outline-secondary"
          size="sm"
          @click="cycleTheme"
        />
      </div>
    </nav>
    <div class="d-flex flex-grow-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { BFormInput } from 'bootstrap-vue-next'
import { ButtonIcon, NavigationStepper, NavigationToggle, LayoutToolbarSeparator, ButtonUndo, ButtonRedo } from '@blueprint-chart/ui'
import { useTheme } from '@/composables/useTheme'
import { useChartSession } from '@/composables/useChartSession'
import { useNavbar } from '@/composables/useNavbar'
import { useWizard } from '@/composables/useWizard'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartHistory } from '@/composables/useChartHistory'
import { useDataTable } from '@/composables/useDataTable'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'
import IPhTable from '~icons/ph/table'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhExport from '~icons/ph/export'

const route = useRoute()
const router = useRouter()
const { theme, cycleTheme } = useTheme()
const { listSavedCharts } = useChartSession()
const { mode } = useNavbar()

// Wizard composables (only active when mode === 'wizard')
const { currentIndex, currentStep, steps } = useWizard()
const { viewMode, setViewMode } = useEditorPanel()
const { canUndo, canRedo, undo, redo } = useChartHistory()
const dataTable = useDataTable()

const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const searchQuery = ref('')
const searchContainer = ref<HTMLElement | null>(null)

const themeIcon = computed(() => {
  if (theme.value === 'light') {
    return IPhSun
  }
  if (theme.value === 'dark') {
    return IPhMoon
  }
  return IPhCircleHalf
})

// Stepper configuration
const stepIcons: Record<string, typeof IPhTable> = {
  data: IPhTable,
  edit: IPhChartBar,
  export: IPhExport,
}
const stepLabels = steps.map(s => ({ label: s.label, icon: stepIcons[s.key] }))

const viewModeModel = computed({
  get: () => viewMode.value,
  set: (v: string) => setViewMode(v as 'preview' | 'dsl'),
})

const viewModeOptions = [
  { value: 'preview', text: 'Preview' },
  { value: 'dsl', text: 'DSL' },
]

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
.shell-navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.5rem 1rem;
  min-height: 3rem;
  background: var(--bs-navbar-bg);
  border-bottom: 1px solid var(--bs-border-color);
  flex-shrink: 0;
  gap: 1rem;
  position: relative;
  z-index: 1060;
}

.shell-navbar__logo {
  height: 1.5rem;
  width: auto;
}

.shell-navbar__search {
  position: relative;
  width: 320px;
  max-width: 100%;
}

.shell-navbar__search--compact {
  width: 180px;
}

.shell-navbar__right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}

.shell-navbar__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bs-navbar-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
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
</style>
