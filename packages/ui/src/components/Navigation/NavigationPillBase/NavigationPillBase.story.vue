<script setup lang="ts">
import NavigationPillBase from './NavigationPillBase.vue'
</script>

<template>
  <Story title="Navigation/NavigationPillBase">
    <Variant
      title="Default"
      :init-state="() => ({ activeIndex: 1 })"
    >
      <template #default="{ state }">
        <NavigationPillBase
          :items="[
            { key: '0', text: 'Upload', active: state.activeIndex === 0 },
            { key: '1', text: 'Check', active: state.activeIndex === 1 },
            { key: '2', text: 'Edit', active: state.activeIndex === 2 },
            { key: '3', text: 'Export', active: state.activeIndex === 3 },
          ]"
          @select="state.activeIndex = Number($event)"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.activeIndex"
          title="activeIndex"
          :min="0"
          :max="3"
        />
      </template>
    </Variant>

    <Variant
      title="Two options"
      :init-state="() => ({ active: 'preview' })"
    >
      <template #default="{ state }">
        <NavigationPillBase
          :items="[
            { key: 'preview', text: 'Preview', active: state.active === 'preview' },
            { key: 'dsl', text: 'DSL', active: state.active === 'dsl' },
          ]"
          @select="state.active = $event"
        />
      </template>
    </Variant>
  </Story>
</template>
