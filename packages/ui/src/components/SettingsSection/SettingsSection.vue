<template>
  <section class="settings-section">
    <div class="settings-section__header">
      <SettingsSectionIcon
        v-if="icon"
        :icon="icon"
      />
      <div class="settings-section__header__text">
        <SettingsSectionTitle>
          {{ title }}
        </SettingsSectionTitle>
      </div>
    </div>
    <SettingsSectionDescription
      v-if="$slots.description || description"
    >
      <slot name="description">
        {{ description }}
      </slot>
    </SettingsSectionDescription>
    <div
      v-if="$slots.default"
      class="settings-section__body"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  title: string
  icon?: Component
  description?: string
}>(), {
  icon: undefined,
  description: undefined,
})
</script>

<style scoped lang="scss">
.settings-section {
  padding-bottom: 2rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
  }
}
</style>
