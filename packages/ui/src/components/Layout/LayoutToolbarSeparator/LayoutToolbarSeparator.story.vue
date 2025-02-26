<script setup lang="ts">
import ToolbarSeparator from './LayoutToolbarSeparator.vue'
</script>

<template>
  <Story title="Layout/LayoutToolbarSeparator">
    <Variant title="Default">
      <template #default>
        <div class="toolbar-separator-story__row">
          <span>Left</span>
          <ToolbarSeparator />
          <span>Right</span>
        </div>
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.toolbar-separator-story__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
