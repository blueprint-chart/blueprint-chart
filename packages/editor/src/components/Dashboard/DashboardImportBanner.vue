<template>
  <div
    v-if="count > 0 && !dismissed"
    class="dashboard-import-banner alert alert-info d-flex align-items-center justify-content-between"
    role="status"
  >
    <span>
      You have <strong>{{ count }}</strong> chart{{ count === 1 ? '' : 's' }} saved only on this device.
      Sync {{ count === 1 ? 'it' : 'them' }} to your account?
    </span>
    <span class="d-flex gap-2">
      <button
        type="button"
        class="btn btn-primary btn-sm"
        :disabled="syncing"
        @click="onSync"
      >
        {{ syncing ? 'Syncing…' : `Sync all to cloud` }}
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
const props = defineProps<{ count: number, syncing: boolean }>()
const emit = defineEmits<{ sync: [] }>()
const dismissed = ref(false)

function onSync() {
  emit('sync')
}

// Auto-hide once everything has been synced away.
watch(() => props.count, (n) => {
  if (n === 0) {
    dismissed.value = true
  }
})
</script>
