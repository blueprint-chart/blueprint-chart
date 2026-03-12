<script setup lang="ts">
import GalleryGrid from './GalleryGrid.vue'
</script>

<template>
  <Story title="Gallery/GalleryGrid">
    <Variant title="Grid layout">
      <GalleryGrid layout="grid">
        <div
          v-for="n in 6"
          :key="n"
          style="background: var(--bs-tertiary-bg); border: 1px solid var(--bs-border-color); border-radius: 8px; height: 200px; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; color: var(--bs-secondary-color);"
        >
          Card {{ n }}
        </div>
      </GalleryGrid>
    </Variant>
    <Variant title="Row layout">
      <GalleryGrid layout="row">
        <div
          v-for="n in 4"
          :key="n"
          style="background: var(--bs-tertiary-bg); border: 1px solid var(--bs-border-color); border-radius: 8px; height: 72px; display: flex; align-items: center; padding: 0 1rem; font-size: 0.875rem; color: var(--bs-secondary-color);"
        >
          Row {{ n }}
        </div>
      </GalleryGrid>
    </Variant>
  </Story>
</template>
