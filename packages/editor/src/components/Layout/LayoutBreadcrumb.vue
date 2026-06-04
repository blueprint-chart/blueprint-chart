<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChartConfig } from '@/stores/chartConfig'

type Crumb = { label: string, to?: string }

const route = useRoute()
const config = useChartConfig()

const crumbs = computed<Crumb[]>(() => {
  const path = route.path
  if (path.startsWith('/edit/')) {
    const title = config._base.title.value || 'Untitled'
    return [{ label: 'My Charts', to: '/charts' }, { label: title }]
  }
  if (path.startsWith('/charts')) {
    return [{ label: 'My Charts' }]
  }
  if (path === '/new') {
    return [{ label: 'My Charts', to: '/charts' }, { label: 'New chart' }]
  }
  return []
})
</script>

<template>
  <nav
    v-if="crumbs.length"
    class="layout-breadcrumb"
    aria-label="Breadcrumb"
  >
    <template
      v-for="(crumb, i) in crumbs"
      :key="i"
    >
      <router-link
        v-if="crumb.to"
        :to="crumb.to"
        class="layout-breadcrumb__crumb"
      >
        {{ crumb.label }}
      </router-link>
      <span
        v-else
        class="layout-breadcrumb__crumb layout-breadcrumb__crumb--active"
        :aria-current="i === crumbs.length - 1 ? 'page' : undefined"
      >{{ crumb.label }}</span>
      <span
        v-if="i < crumbs.length - 1"
        class="layout-breadcrumb__crumb-sep"
        aria-hidden="true"
      >/</span>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.layout-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  font-size: var(--bs-font-size-md);
}

.layout-breadcrumb__crumb {
  color: var(--bs-secondary-color);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // Link crumbs are short, fixed wayfinding labels ("My Charts") — keep them
  // whole and let the active crumb (chart title) absorb the truncation.
  flex-shrink: 0;
  transition: color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    color: var(--bs-body-color);
  }
}

.layout-breadcrumb__crumb--active {
  color: var(--bs-body-color);
  font-weight: 500;
  flex-shrink: 1;
}

.layout-breadcrumb__crumb-sep {
  color: var(--bs-tertiary-color);
  opacity: 0.5;
}
</style>
