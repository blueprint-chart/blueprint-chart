<script setup lang="ts">
import NavigationSearchPill from './NavigationSearchPill.vue'
</script>

<template>
  <Story title="Navigation/NavigationSearchPill">
    <Variant title="Default (mac)">
      <NavigationSearchPill
        placeholder="Search…"
        shortcut-label="⌘ K"
        shortcut-keys="Meta+K"
      />
    </Variant>

    <Variant title="Non-mac">
      <NavigationSearchPill
        placeholder="Search…"
        shortcut-label="Ctrl K"
        shortcut-keys="Control+K"
      />
    </Variant>

    <Variant title="Compact">
      <NavigationSearchPill
        placeholder="Search…"
        shortcut-label="⌘ K"
        shortcut-keys="Meta+K"
        :compact="true"
      />
    </Variant>
  </Story>
</template>
