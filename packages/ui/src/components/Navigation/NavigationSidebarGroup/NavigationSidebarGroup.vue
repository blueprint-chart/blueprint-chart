<script setup lang="ts">
defineProps<{
  eyebrow?: string
}>()
</script>

<template>
  <div class="navigation-sidebar-group">
    <div
      v-if="eyebrow"
      class="navigation-sidebar-group__eyebrow"
    >
      {{ eyebrow }}
    </div>
    <div class="navigation-sidebar-group__items">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.navigation-sidebar-group {
  display: flex;
  flex-direction: column;
}

.navigation-sidebar-group__eyebrow {
  font-size: 0.5625rem;            // 9px
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bs-tertiary-color);
  font-weight: 600;
  padding: 0.375rem 0.5rem 0.25rem;
}

.navigation-sidebar-group__items {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
