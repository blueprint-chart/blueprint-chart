<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  name: string
  logoSrc?: string
  hideName?: boolean
  to?: RouteLocationRaw
}>(), {
  logoSrc: undefined,
  hideName: false,
  to: undefined,
})

defineEmits<{ click: [] }>()

const initial = computed(() => props.name.trim().charAt(0).toUpperCase())
</script>

<template>
  <router-link
    v-if="to"
    :to="to"
    custom
  >
    <template #default="{ navigate, href }">
      <a
        :href="href"
        class="navigation-workspace-switcher"
        :aria-label="name"
        @click="navigate"
      >
        <img
          v-if="logoSrc"
          :src="logoSrc"
          :alt="name"
          class="navigation-workspace-switcher__logo"
        >
        <span
          v-else
          class="navigation-workspace-switcher__badge"
          aria-hidden="true"
        >{{ initial }}</span>
        <span
          v-if="!hideName"
          class="navigation-workspace-switcher__name"
        >{{ name }}</span>
      </a>
    </template>
  </router-link>
  <button
    v-else
    type="button"
    class="navigation-workspace-switcher"
    :aria-label="name"
    @click="$emit('click')"
  >
    <img
      v-if="logoSrc"
      :src="logoSrc"
      :alt="name"
      class="navigation-workspace-switcher__logo"
    >
    <span
      v-else
      class="navigation-workspace-switcher__badge"
      aria-hidden="true"
    >{{ initial }}</span>
    <span
      v-if="!hideName"
      class="navigation-workspace-switcher__name"
    >{{ name }}</span>
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
  text-decoration: none;
  transition: background var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: var(--bc-wash-soft);
    text-decoration: none;
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

.navigation-workspace-switcher__logo {
  height: 1.25rem;
  width: auto;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.navigation-workspace-switcher__name {
  line-height: 1;
}
</style>
