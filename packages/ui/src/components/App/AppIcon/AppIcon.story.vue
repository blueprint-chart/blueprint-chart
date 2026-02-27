<script setup lang="ts">
import AppIcon from './AppIcon.vue'
</script>

<template>
  <Story title="App/AppIcon">
    <Variant title="Default">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <AppIcon size="sm">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="md">
          <IconPhHeart />
        </AppIcon>
        <AppIcon size="lg">
          <IconPhWarning />
        </AppIcon>
      </div>
    </Variant>
    <Variant title="Preset sizes">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <AppIcon size="2xs">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="xs">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="sm">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="md">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="lg">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="xl">
          <IconPhStar />
        </AppIcon>
        <AppIcon size="2xl">
          <IconPhStar />
        </AppIcon>
      </div>
    </Variant>
    <Variant title="Raw CSS size">
      <AppIcon size="48px">
        <IconPhStar />
      </AppIcon>
    </Variant>
    <Variant title="Color variants">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <AppIcon
          size="lg"
          variant="primary"
        >
          <IconPhHeart />
        </AppIcon>
        <AppIcon
          size="lg"
          variant="success"
        >
          <IconPhHeart />
        </AppIcon>
        <AppIcon
          size="lg"
          variant="danger"
        >
          <IconPhHeart />
        </AppIcon>
        <AppIcon
          size="lg"
          variant="warning"
        >
          <IconPhHeart />
        </AppIcon>
        <AppIcon
          size="lg"
          variant="info"
        >
          <IconPhHeart />
        </AppIcon>
      </div>
    </Variant>
    <Variant title="Animations">
      <div style="display: flex; gap: 2rem; align-items: center;">
        <AppIcon
          size="lg"
          spin
        >
          <IconPhStar />
        </AppIcon>
        <AppIcon
          size="lg"
          spin
          spin-reverse
        >
          <IconPhStar />
        </AppIcon>
        <AppIcon
          size="lg"
          beat
        >
          <IconPhHeart />
        </AppIcon>
        <AppIcon
          size="lg"
          fade
        >
          <IconPhWarning />
        </AppIcon>
      </div>
    </Variant>
    <Variant title="Hover variant">
      <p style="margin-bottom: 0.5rem; color: var(--bs-secondary-color);">
        Hover over the icon:
      </p>
      <AppIcon
        size="xl"
        variant="secondary"
        hover-variant="danger"
      >
        <IconPhHeart />
      </AppIcon>
    </Variant>
  </Story>
</template>
