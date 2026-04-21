<template>
  <LayoutBottomDrawer
    v-model="open"
    :title="title"
  >
    <slot name="header" />
    <div class="panel-drawer__body">
      <slot />
    </div>
  </LayoutBottomDrawer>
</template>

<script setup lang="ts">
import { LayoutBottomDrawer } from '@blueprint-chart/ui'

defineProps<{
  title?: string
}>()

const open = defineModel<boolean>({ required: true })
</script>

<style scoped lang="scss">
.panel-drawer__body {
  padding: 0.5rem 0;
}
</style>
