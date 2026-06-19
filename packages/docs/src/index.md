---
layout: page
title: Blueprint Chart Docs
aside: false
outline: false
editLink: false
lastUpdated: false
prev: false
next: false
head:
  - - meta
    - http-equiv: refresh
      content: 0; url=/guide/getting-started
  - - meta
    - name: robots
      content: noindex
---

<script setup>
import { onMounted } from 'vue'

// SPA navigations never trigger the <meta http-equiv="refresh"> above, so
// drive the redirect from the client too. Use location.replace (not the
// VitePress router, which pushState's) so '/' is not left on the history
// stack — otherwise Back would land on '/' and bounce forward forever.
// The meta tag still covers no-JS / hard page loads.
onMounted(() => {
  window.location.replace('/guide/getting-started')
})
</script>

<div style="max-width: 48rem; margin: 6rem auto; padding: 0 1.5rem; text-align: center;">

Redirecting to [**Getting Started**](/guide/getting-started)…

</div>
