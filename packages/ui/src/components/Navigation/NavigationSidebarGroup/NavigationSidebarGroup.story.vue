<script setup lang="ts">
import NavigationSidebarGroup from './NavigationSidebarGroup.vue'
import NavigationSidebarItem from '../NavigationSidebarItem/NavigationSidebarItem.vue'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhCopy from '~icons/ph/copy'
</script>

<template>
  <Story title="Navigation/NavigationSidebarGroup">
    <Variant title="With eyebrow">
      <NavigationSidebarGroup eyebrow="Workspace">
        <NavigationSidebarItem to="/" label="Home">
          <template #icon><IPhSquaresFour /></template>
        </NavigationSidebarItem>
        <NavigationSidebarItem to="/charts" label="My Charts" :active="true">
          <template #icon><IPhCopy /></template>
        </NavigationSidebarItem>
      </NavigationSidebarGroup>
    </Variant>

    <Variant title="Without eyebrow">
      <NavigationSidebarGroup>
        <NavigationSidebarItem to="/" label="Home" />
        <NavigationSidebarItem to="/charts" label="My Charts" />
      </NavigationSidebarGroup>
    </Variant>
  </Story>
</template>
