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

      <!-- Center: landing anchors, search (home), or stepper (wizard) -->
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
      <div
        v-else-if="mode === 'home'"
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

      <!-- Right: landing CTA, step controls (wizard) + theme toggle -->
      <div class="shell-navbar__right">
        <template v-if="isLanding && hasCharts">
          <router-link
            to="/charts"
            class="shell-navbar__cta shell-navbar__cta--ghost"
          >
            My Charts
          </router-link>
          <router-link
            to="/new"
            class="shell-navbar__cta shell-navbar__cta--primary"
          >
            New
          </router-link>
        </template>
        <router-link
          v-else-if="isLanding"
          to="/new"
          class="shell-navbar__cta shell-navbar__cta--primary"
        >
          Get started
        </router-link>
        <template v-if="mode === 'wizard'">
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
import { ButtonIcon, NavigationStepper } from '@blueprint-chart/ui'
import { useTheme } from '@/composables/useTheme'
import { useChartSession } from '@/composables/useChartSession'
import { useNavbar } from '@/composables/useNavbar'
import { useWizard } from '@/composables/useWizard'
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

const isLanding = computed(() => route.path === '/')
const hasCharts = computed(() => listSavedCharts().length > 0)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// Wizard composables (only active when mode === 'wizard')
const { currentIndex, steps } = useWizard()
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
  padding: 0.375rem 1rem;
  min-height: 2.75rem;
  background: transparent;
  border: none;
  box-shadow: none;
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

.shell-navbar__cta {
  padding: 0.375rem 1rem;
  border-radius: 5px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
}

.shell-navbar__cta--primary {
  background: var(--bs-primary);
  color: #fff;

  &:hover {
    filter: brightness(1.1);
    color: #fff;
  }
}

.shell-navbar__cta--ghost {
  background: transparent;
  color: var(--bs-secondary-color);
  border: 1px solid var(--bs-border-color);

  &:hover {
    border-color: var(--bs-body-color);
    color: var(--bs-body-color);
  }
}

@media (max-width: 48rem) {
  .shell-navbar__anchors {
    display: none;
  }
}
</style>
