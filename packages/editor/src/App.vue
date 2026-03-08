<template>
  <router-view v-if="route.meta.bare" />
  <LayoutShell v-else>
    <router-view />
  </LayoutShell>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import LayoutShell from '@/components/Layout/LayoutShell.vue'

const route = useRoute()
</script>
