<template>
  <LayoutShell>
    <LayoutSidebar>
      <EditorPanel />
    </LayoutSidebar>
    <PreviewPanel />
    <LayoutSidebar :width="300">
      <ExportPanel />
    </LayoutSidebar>
  </LayoutShell>
</template>

<script setup lang="ts">
import LayoutShell from '@/components/Layout/LayoutShell.vue'
import LayoutSidebar from '@/components/Layout/LayoutSidebar.vue'
import EditorPanel from '@/components/Editor/EditorPanel.vue'
import PreviewPanel from '@/components/Preview/PreviewPanel.vue'
import ExportPanel from '@/components/Export/ExportPanel.vue'
</script>
