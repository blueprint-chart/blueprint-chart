<script setup lang="ts">
import NavigationSidebarItem from './NavigationSidebarItem.vue'
import IPhInbox from '~icons/ph/tray'
import IPhSquaresFour from '~icons/ph/squares-four'
</script>

<template>
  <Story title="Navigation/NavigationSidebarItem">
    <Variant title="Default">
      <NavigationSidebarItem to="/charts" label="My Charts">
        <template #icon><IPhSquaresFour /></template>
      </NavigationSidebarItem>
    </Variant>

    <Variant title="Active">
      <NavigationSidebarItem to="/charts" label="My Charts" :active="true">
        <template #icon><IPhSquaresFour /></template>
      </NavigationSidebarItem>
    </Variant>

    <Variant title="With count">
      <NavigationSidebarItem to="/inbox" label="Inbox" :count="3">
        <template #icon><IPhInbox /></template>
      </NavigationSidebarItem>
    </Variant>

    <Variant title="Without icon">
      <NavigationSidebarItem to="/charts/offshore-flows" label="Offshore flows" />
    </Variant>
  </Story>
</template>
