<template>
  <!-- No UI: this route only exists to hydrate a session from a base64-encoded
       BPC payload, then swap the URL for the canonical editing route. -->
  <div
    class="copy-redirect"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// beforeEnter stashes the resolved target on route.meta; replace() so the
// /copy/<base64> URL is removed from history instead of pushed onto it.
router.replace(route.meta.copyTarget ?? '/')
</script>
