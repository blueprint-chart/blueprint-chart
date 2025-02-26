<script setup lang="ts">
import AppIconLayers from './AppIconLayers.vue'
import AppIcon from '../AppIcon/AppIcon.vue'
</script>

<template>
  <Story title="App/AppIconLayers">
    <Variant title="Layered icons">
      <div style="display: flex; gap: 2rem; align-items: center;">
        <AppIconLayers size="lg">
          <AppIcon variant="secondary"><IconPhCircle /></AppIcon>
          <AppIcon size="xs" variant="warning"><IconPhStar /></AppIcon>
        </AppIconLayers>
        <AppIconLayers size="xl">
          <AppIcon variant="secondary"><IconPhCircle /></AppIcon>
          <AppIcon size="sm" variant="warning"><IconPhStar /></AppIcon>
        </AppIconLayers>
        <AppIconLayers size="2xl">
          <AppIcon variant="secondary"><IconPhCircle /></AppIcon>
          <AppIcon size="md" variant="warning"><IconPhStar /></AppIcon>
        </AppIconLayers>
      </div>
    </Variant>
    <Variant title="Raw size">
      <AppIconLayers size="64px">
        <AppIcon variant="primary"><IconPhCircle /></AppIcon>
        <AppIcon size="sm" variant="warning"><IconPhStar /></AppIcon>
      </AppIconLayers>
    </Variant>
  </Story>
</template>
