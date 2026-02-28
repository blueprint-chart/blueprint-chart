<template>
  <div class="list-item-actions">
    <BButton
      v-if="actions.includes('duplicate')"
      variant="link"
      size="sm"
      class="list-item-actions__btn text-body-secondary"
      title="Duplicate"
      @click.stop="$emit('duplicate')"
    >
      <span aria-hidden="true">&#x29C9;</span>
    </BButton>
    <BButton
      v-if="actions.includes('remove')"
      variant="link"
      size="sm"
      class="list-item-actions__btn text-danger"
      title="Remove"
      @click.stop="$emit('remove')"
    >
      <AppIcon :name="IPhTrash" />
    </BButton>
  </div>
</template>

<script setup lang="ts">
import IPhTrash from '~icons/ph/trash'
import AppIcon from '../../App/AppIcon/AppIcon.vue'

withDefaults(
  defineProps<{
    actions?: ('duplicate' | 'remove')[]
  }>(),
  {
    actions: () => ['duplicate', 'remove'],
  },
)

defineEmits<{
  duplicate: []
  remove: []
}>()
</script>

<style scoped lang="scss">
.list-item-actions {
  display: flex;
  gap: 0.5rem;
}

.list-item-actions__btn {
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  text-decoration: none;
}
</style>
