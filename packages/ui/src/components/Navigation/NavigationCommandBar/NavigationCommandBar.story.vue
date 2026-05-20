<script setup lang="ts">
import NavigationCommandBar from './NavigationCommandBar.vue'
</script>

<template>
  <Story title="Navigation/NavigationCommandBar">
    <Variant title="Default">
      <NavigationCommandBar
        placeholder="Search or jump to…"
        shortcut-label="⌘K"
      />
    </Variant>
    <Variant title="Without shortcut">
      <NavigationCommandBar
        placeholder="Search charts…"
        shortcut-label=""
      />
    </Variant>
    <Variant title="Collapsed (icon only)">
      <NavigationCommandBar
        placeholder="Search charts…"
        shortcut-label="⌘K"
        collapsed
      />
    </Variant>
  </Story>
</template>
