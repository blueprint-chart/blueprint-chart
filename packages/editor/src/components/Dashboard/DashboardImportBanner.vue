<template>
  <div
    v-if="count > 0 && !dismissed"
    class="dashboard-import-banner alert alert-info d-flex align-items-center justify-content-between"
    role="status"
  >
    <span>
      You have <strong>{{ count }}</strong> chart{{ count === 1 ? '' : 's' }} saved on this device.
      Import {{ count === 1 ? 'it' : 'them' }} into your account?
    </span>
    <span class="d-flex gap-2">
      <button
        type="button"
        class="btn btn-primary btn-sm"
        :disabled="importing"
        @click="onImport"
      >
        {{ importing ? 'Importing…' : `Import ${count}` }}
      </button>
      <button
        type="button"
        class="btn btn-link btn-sm"
        @click="dismissed = true"
      >
        Not now
      </button>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ count: number, importing: boolean }>()
const emit = defineEmits<{ import: [] }>()
const dismissed = ref(false)

function onImport() {
  emit('import')
}

// Auto-hide once everything has been imported away.
watch(() => props.count, (n) => {
  if (n === 0) {
    dismissed.value = true
  }
})
</script>
