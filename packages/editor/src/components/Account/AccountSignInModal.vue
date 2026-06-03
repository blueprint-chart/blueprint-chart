<template>
  <BModal
    :model-value="open"
    no-header
    no-footer
    centered
    body-class="account-sign-in__body"
    @update:model-value="$emit('update:open', $event)"
  >
    <button
      type="button"
      class="account-sign-in__close"
      aria-label="Close"
      @click="$emit('update:open', false)"
    >
      <AppIcon
        :name="IPhX"
        size="sm"
      />
    </button>

    <div
      v-if="status === 'link-sent'"
      class="account-sign-in__sent"
    >
      <p class="mb-1 fw-semibold">
        Check your inbox
      </p>
      <p class="mb-0 text-secondary">
        We sent a link to <strong>{{ email }}</strong>. Open it on this device to finish.
      </p>
      <button
        type="button"
        class="account-sign-in__again"
        @click="store.resetStatus()"
      >
        Use a different email
      </button>
    </div>

    <form
      v-else
      class="account-sign-in"
      @submit.prevent="onSubmit"
    >
      <h2 class="account-sign-in__title">
        Keep your charts in sync
      </h2>
      <p class="account-sign-in__sub">
        Your work, safe and ready wherever you sign in.
      </p>

      <ul class="account-sign-in__benefits">
        <li>
          <span class="account-sign-in__benefit-icon">
            <AppIcon
              :name="IPhCloudArrowUp"
              size="sm"
            />
          </span>
          Charts save to the cloud as you edit
        </li>
        <li>
          <span class="account-sign-in__benefit-icon">
            <AppIcon
              :name="IPhSquaresFour"
              size="sm"
            />
          </span>
          Open your full library from any device
        </li>
      </ul>

      <label
        for="account-email"
        class="form-label"
      >Email address</label>
      <input
        id="account-email"
        v-model="email"
        type="email"
        class="form-control"
        :class="{ 'is-invalid': status === 'error' }"
        placeholder="you@example.com"
        required
        autocomplete="email"
      >
      <p
        v-if="status === 'error'"
        class="account-sign-in__error"
        role="alert"
      >
        <AppIcon
          :name="IPhWarningCircle"
          size="sm"
        />
        {{ errorMessage || 'Something went wrong. Try again.' }}
      </p>
      <button
        type="submit"
        class="btn btn-primary w-100 mt-3"
        :disabled="status === 'sending'"
      >
        <AppIcon
          v-if="status === 'sending'"
          :name="IPhCircleNotch"
          size="sm"
          spin
          spin-duration="0.7s"
        />
        {{ status === 'sending' ? 'Sending link…' : 'Email me a magic link' }}
      </button>
      <p class="account-sign-in__fine">
        No password required. The link arrives in seconds.
      </p>
    </form>
  </BModal>
</template>

<script setup lang="ts">
import { AppIcon } from '@blueprint-chart/ui'
import IPhX from '~icons/ph/x'
import IPhCloudArrowUp from '~icons/ph/cloud-arrow-up'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhWarningCircle from '~icons/ph/warning-circle'
import IPhCircleNotch from '~icons/ph/circle-notch'
import { useAccount, useAccountStore } from '@/stores/account'

const props = defineProps<{ open: boolean }>()
defineEmits<{ 'update:open': [value: boolean] }>()

const store = useAccountStore()
const { status, errorMessage } = useAccount()
const email = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      store.resetStatus()
    }
  },
)

async function onSubmit() {
  if (!email.value) {
    return
  }
  await store.signInWithEmail(email.value)
}
</script>

<style scoped lang="scss">
:deep(.account-sign-in__body) {
  position: relative;
}

.account-sign-in__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--bs-secondary-color);

  cursor: pointer;

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--bs-primary);
    outline-offset: 1px;
  }
}

.account-sign-in__title {
  font-family: "DM Serif Display", Georgia, serif;
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1.15;
  margin: 0;
}

.account-sign-in__sub {
  color: var(--bs-secondary-color);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0.5rem 0 0;
}

.account-sign-in__benefits {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6875rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.6875rem;
    font-size: 0.875rem;
  }
}

.account-sign-in__benefit-icon {
  flex: 0 0 1.875rem;
  width: 1.875rem;
  height: 1.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
}

// Deliberate override of Bootstrap's .form-label top margin inside this form.
.account-sign-in .form-label {
  margin-top: 1.125rem;
}

.account-sign-in__error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--bs-danger);
  font-size: 0.8125rem;
  margin: 0.5rem 0 0;
}

.account-sign-in__fine {
  color: var(--bs-secondary-color);
  font-size: 0.75rem;
  line-height: 1.5;
  margin: 0.875rem 0 0;
  text-align: center;
}

.account-sign-in__again {
  margin-top: 1rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--bs-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--bs-primary);
    outline-offset: 1px;
  }
}
</style>
