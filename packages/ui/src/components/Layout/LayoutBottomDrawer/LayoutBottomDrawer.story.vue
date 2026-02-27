<script setup lang="ts">
import Drawer from './LayoutBottomDrawer.vue'
</script>

<template>
  <Story title="Layout/LayoutBottomDrawer">
    <Variant
      title="Default"
      :init-state="() => ({ open: true, title: 'Editor Panel' })"
    >
      <template #default="{ state }">
        <button @click="state.open = true">
          Open Drawer
        </button>
        <Drawer
          v-model="state.open"
          :title="state.title"
        >
          <p>Drawer body content goes here.</p>
          <p>Scroll down for more content.</p>
        </Drawer>
      </template>
      <template #controls="{ state }">
        <HstCheckbox
          v-model="state.open"
          title="open"
        />
        <HstText
          v-model="state.title"
          title="title"
        />
      </template>
    </Variant>
  </Story>
</template>
