<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

defineEmits<{ click: [] }>()

const initial = computed(() => props.name.trim().charAt(0).toUpperCase())
</script>

<template>
  <button
    type="button"
    class="navigation-workspace-switcher"
    @click="$emit('click')"
  >
    <span
      class="navigation-workspace-switcher__badge"
      aria-hidden="true"
    >{{ initial }}</span>
    <span class="navigation-workspace-switcher__name">{{ name }}</span>
  </button>
</template>

<style scoped lang="scss">
.navigation-workspace-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  background: transparent;
  border: none;
  border-radius: var(--bc-radius-sm);
  color: var(--bs-body-color);
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: rgba(255, 255, 255, 0.04);

    [data-bs-theme="light"] & { background: rgba(0, 0, 0, 0.04); }
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--bc-focus-ring);
  }
}

.navigation-workspace-switcher__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--bc-radius-sm);
  background: linear-gradient(135deg, #2563A0, #7AB0E2);
  color: #ffffff;
  font-family: "DM Serif Display", Georgia, serif;
  font-size: 0.75rem;
  font-weight: 400;
}

.navigation-workspace-switcher__name {
  line-height: 1;
}
</style>
