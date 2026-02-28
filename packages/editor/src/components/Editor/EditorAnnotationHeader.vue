<template>
  <ListItemRow :label="summary" @click="$emit('toggleCollapse')">
    <template #leading>
      <span class="badge bg-secondary-subtle text-secondary-emphasis">{{ kindLabel }}</span>
    </template>
    <template #actions>
      <ListItemActions @duplicate="$emit('duplicate')" @remove="$emit('remove')" />
    </template>
  </ListItemRow>
</template>

<script setup lang="ts">
import { ListItemRow, ListItemActions } from '@blueprint-chart/ui'

defineProps<{
  kindLabel: string
  summary: string
  collapsed: boolean
}>()

defineEmits<{
  duplicate: []
  remove: []
  toggleCollapse: []
}>()
</script>
