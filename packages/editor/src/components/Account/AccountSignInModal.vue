<template>
  <BModal
    :model-value="open"
    title="Sign in"
    no-footer
    centered
    @update:model-value="$emit('update:open', $event)"
  >
    <div
      v-if="status === 'link-sent'"
      class="account-sign-in__sent"
    >
      <p class="mb-1 fw-semibold">
        Check your inbox
      </p>
      <p class="mb-0 text-secondary">
        We sent a magic link to <strong>{{ email }}</strong>. Open it on this device to finish signing in.
      </p>
    </div>

    <form
      v-else
      class="account-sign-in"
      @submit.prevent="onSubmit"
    >
      <label
        for="account-email"
        class="form-label"
      >Email address</label>
      <input
        id="account-email"
        v-model="email"
        type="email"
        class="form-control"
        placeholder="you@newsroom.org"
        required
        autocomplete="email"
      >
      <p
        v-if="status === 'error'"
        class="text-danger small mt-2 mb-0"
      >
        {{ errorMessage || 'Something went wrong. Try again.' }}
      </p>
      <button
        type="submit"
        class="btn btn-primary w-100 mt-3"
        :disabled="status === 'sending'"
      >
        {{ status === 'sending' ? 'Sending…' : 'Send magic link' }}
      </button>
      <p class="text-secondary small mt-3 mb-0">
        Passwordless sign-in. We email you a one-time link — no password to remember.
      </p>
    </form>
  </BModal>
</template>

<script setup lang="ts">
import { useAccount, useAccountStore } from '@/stores/account'

defineProps<{ open: boolean }>()
defineEmits<{ 'update:open': [value: boolean] }>()

const store = useAccountStore()
const { status, errorMessage } = useAccount()
const email = ref('')

async function onSubmit() {
  if (!email.value) {
    return
  }
  await store.signInWithEmail(email.value)
}
</script>
