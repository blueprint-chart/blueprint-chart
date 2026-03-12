<script setup lang="ts">
import GalleryCard from './GalleryCard.vue'

const thumbSvg = '<svg viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="20" width="8" height="14" fill="#2563A0" rx="1"/><rect x="14" y="12" width="8" height="22" fill="#D4A63A" rx="1"/><rect x="24" y="16" width="8" height="18" fill="#C94044" rx="1"/><rect x="34" y="8" width="8" height="26" fill="#2D8659" rx="1"/></svg>'
const thumbSrc = `data:image/svg+xml;base64,${globalThis.btoa(thumbSvg)}`
</script>

<template>
  <Story title="Gallery/GalleryCard">
    <Variant title="Grid (default)">
      <div style="width: 280px;">
        <GalleryCard
          title="Global energy mix shift"
          subtitle="Share of primary energy by source"
          :thumb-src="thumbSrc"
        >
          <template #footer>
            <span style="font-size: 0.6875rem; color: var(--bs-secondary-color);">12 Mar 2026</span>
          </template>
        </GalleryCard>
      </div>
    </Variant>
    <Variant title="Grid selected">
      <div style="width: 280px;">
        <GalleryCard
          title="Global energy mix shift"
          subtitle="Share of primary energy by source"
          :thumb-src="thumbSrc"
          :selected="true"
        />
      </div>
    </Variant>
    <Variant title="Row layout">
      <div style="width: 600px;">
        <GalleryCard
          title="Global energy mix shift"
          subtitle="Share of primary energy by source"
          :thumb-src="thumbSrc"
          layout="row"
        >
          <template #footer>
            <span style="font-size: 0.6875rem; color: var(--bs-secondary-color);">12 Mar 2026</span>
          </template>
        </GalleryCard>
      </div>
    </Variant>
    <Variant title="Row selected">
      <div style="width: 600px;">
        <GalleryCard
          title="Global energy mix shift"
          subtitle="Share of primary energy by source"
          :thumb-src="thumbSrc"
          layout="row"
          :selected="true"
        />
      </div>
    </Variant>
  </Story>
</template>
