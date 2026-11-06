<template>
  <router-view v-if="route.meta.bare" />
  <LayoutShell v-else>
    <router-view />
  </LayoutShell>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ColorSwatchGroupsKey } from '@blueprint-chart/ui'
import { useCategoryColorSwatchGroups } from '@/stores/categoryColors'

const route = useRoute()

provide(ColorSwatchGroupsKey, useCategoryColorSwatchGroups())
</script>
