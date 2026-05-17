<script setup lang="ts">
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

defineProps<{
  placeholder: string
  shortcutLabel: string
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="navigation-command-bar"
    :aria-label="placeholder"
    @click="$emit('click')"
  >
    <IPhMagnifyingGlass
      class="navigation-command-bar__icon"
      aria-hidden="true"
    />
    <span class="navigation-command-bar__placeholder">{{ placeholder }}</span>
    <span
      v-if="shortcutLabel"
      class="navigation-command-bar__kbd"
    >{{ shortcutLabel }}</span>
  </button>
</template>

<style scoped lang="scss">
.navigation-command-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 14rem;
  height: 1.75rem;
  padding: 0 0.625rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-sm);
  color: var(--bs-tertiary-color);
  font-size: var(--bs-font-size-xs);
  cursor: pointer;
  transition: background var(--bc-duration-base) var(--bc-ease),
              border-color var(--bc-duration-base) var(--bc-ease);

  [data-bs-theme="light"] & {
    background: rgba(0, 0, 0, 0.03);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--bc-hairline-strong);

    [data-bs-theme="light"] & { background: rgba(0, 0, 0, 0.05); }
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--bc-focus-ring);
  }
}

.navigation-command-bar__icon {
  flex-shrink: 0;
  font-size: 0.75rem;
  opacity: 0.7;
}

.navigation-command-bar__placeholder {
  flex: 1;
  text-align: left;
}

.navigation-command-bar__kbd {
  margin-left: auto;
  font-family: var(--bs-font-monospace, "Geist Mono", ui-monospace, monospace);
  font-size: 0.625rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 1px 5px;
  border-radius: 3px;

  [data-bs-theme="light"] & {
    background: rgba(0, 0, 0, 0.06);
  }
}
</style>
