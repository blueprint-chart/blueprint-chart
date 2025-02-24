<template>
  <div class="d-flex flex-column vh-100">
    <nav class="shell-navbar">
      <router-link
        to="/"
        class="navbar-brand bc-brand-gradient fw-bold text-decoration-none mb-0"
      >
        Blueprint Chart
      </router-link>

      <div
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
            <span class="fw-bold text-truncate d-block">{{ chart.title || 'Untitled' }}</span>
            <span class="small text-body-secondary text-truncate d-block">{{ chart.description }}</span>
            <span class="badge text-bg-secondary">{{ chart.chartType }}</span>
          </button>
        </div>
      </div>

      <ButtonIcon
        :icon-left="themeIcon"
        label="Toggle theme"
        hide-label
        square
        variant="outline-secondary"
        size="sm"
        @click="cycleTheme"
      />
    </nav>
    <div class="d-flex flex-grow-1 overflow-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BFormInput } from 'bootstrap-vue-next'
import { ButtonIcon } from '@blueprint-chart/ui'
import { useTheme } from '@/composables/useTheme'
import { useChartSession } from '@/composables/useChartSession'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

const route = useRoute()
const router = useRouter()
const { theme, cycleTheme } = useTheme()
const { listSavedCharts } = useChartSession()

const searchQuery = ref('')
const searchContainer = ref<HTMLElement | null>(null)

const themeIcon = computed(() => {
  if (theme.value === 'light') return IPhSun
  if (theme.value === 'dark') return IPhMoon
  return IPhCircleHalf
})

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return listSavedCharts().filter(
    c =>
      (c.title?.toLowerCase().includes(q))
      || (c.description?.toLowerCase().includes(q)),
  )
})

function goToChart(id: string) {
  searchQuery.value = ''
  router.push(`/edit/${id}`)
}

// Dismiss on route change
watch(() => route.path, () => {
  searchQuery.value = ''
})

// Dismiss on click outside
function onDocumentClick(e: globalThis.MouseEvent) {
  if (searchContainer.value && !searchContainer.value.contains(e.target as globalThis.Node)) {
    searchQuery.value = ''
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<style scoped lang="scss">
.shell-navbar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  min-height: 3rem;
  background: var(--bc-card-bg);
  border-bottom: 1px solid var(--bs-border-color);
  flex-shrink: 0;
  gap: 1rem;

}

.shell-navbar__search {
  position: relative;
  flex: 0 1 320px;
  margin-left: auto;
  margin-right: auto;
}

.shell-navbar__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bc-card-bg);
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
</style>
