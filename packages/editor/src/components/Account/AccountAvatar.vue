<template>
  <span
    class="account-avatar"
    :class="`account-avatar--${size}`"
    aria-hidden="true"
  >{{ initial }}</span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ email?: string, size?: 'sm' | 'md' }>(), {
  email: '',
  size: 'md',
})

const initial = computed(() => props.email.trim().charAt(0).toUpperCase() || '?')
</script>

<style scoped lang="scss">
.account-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bs-primary);
  color: #fff;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}

// sm is the navbar toggle avatar — sized to sit inside the btn-sm toggle with
// a hairline gap to the button border (toggle inner height ≈ 1.8rem).
.account-avatar--sm { width: 1.375rem; height: 1.375rem; font-size: 0.6875rem; }
.account-avatar--md { width: 2.125rem; height: 2.125rem; font-size: 0.9375rem; }
</style>
