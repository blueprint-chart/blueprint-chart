<script setup lang="ts">
import NavigationWorkspaceSwitcher from './NavigationWorkspaceSwitcher.vue'
</script>

<template>
  <Story title="Navigation/NavigationWorkspaceSwitcher">
    <Variant title="Default">
      <NavigationWorkspaceSwitcher name="Blueprint" />
    </Variant>
    <Variant title="Longer name">
      <NavigationWorkspaceSwitcher name="Acme Newsroom" />
    </Variant>
  </Story>
</template>
