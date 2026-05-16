<script setup lang="ts">
import NavigationSidebar from './NavigationSidebar.vue'
import NavigationSidebarGroup from '../NavigationSidebarGroup/NavigationSidebarGroup.vue'
import NavigationSidebarItem from '../NavigationSidebarItem/NavigationSidebarItem.vue'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhCopy from '~icons/ph/copy'
</script>

<template>
  <Story title="Navigation/NavigationSidebar">
    <Variant title="Editor layout">
      <NavigationSidebar style="height: 480px">
        <template #header>
          <strong>Blueprint</strong>
        </template>
        <NavigationSidebarGroup eyebrow="Workspace">
          <NavigationSidebarItem to="/" label="Home">
            <template #icon><IPhSquaresFour /></template>
          </NavigationSidebarItem>
          <NavigationSidebarItem to="/charts" label="My Charts" :active="true">
            <template #icon><IPhCopy /></template>
          </NavigationSidebarItem>
        </NavigationSidebarGroup>
        <NavigationSidebarGroup eyebrow="Recent">
          <NavigationSidebarItem to="/charts/offshore-flows" label="Offshore flows" />
          <NavigationSidebarItem to="/charts/asylum-decisions" label="Asylum decisions" />
        </NavigationSidebarGroup>
      </NavigationSidebar>
    </Variant>
  </Story>
</template>
