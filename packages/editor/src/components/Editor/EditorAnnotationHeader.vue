<template>
  <ListItemRow
    :label="summary"
    :class="{ 'opacity-50': hidden }"
    @click="$emit('toggleCollapse')"
  >
    <template #leading>
      <span class="badge bg-secondary-subtle text-secondary-emphasis">{{ kindLabel }}</span>
    </template>
    <template #actions>
      <BButton
        v-if="canToggleVisibility"
        variant="link"
        size="sm"
        class="annotation-header__btn text-body-secondary"
        :title="hidden ? 'Show in scene' : 'Hide in scene'"
        @click.stop="$emit('toggleVisibility')"
      >
        <AppIcon :name="hidden ? IPhEyeSlash : IPhEye" />
      </BButton>
      <ListItemActions
        @duplicate="$emit('duplicate')"
        @remove="$emit('remove')"
      />
    </template>
  </ListItemRow>
</template>

<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next'
import { ListItemRow, ListItemActions, AppIcon } from '@blueprint-chart/ui'
import IPhEye from '~icons/ph/eye'
import IPhEyeSlash from '~icons/ph/eye-slash'

defineProps<{
  kindLabel: string
  summary: string
  collapsed: boolean
  hidden?: boolean
  canToggleVisibility?: boolean
}>()

defineEmits<{
  duplicate: []
  remove: []
  toggleCollapse: []
  toggleVisibility: []
}>()
</script>

<style scoped lang="scss">
.annotation-header__btn {
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  text-decoration: none;
}
</style>
