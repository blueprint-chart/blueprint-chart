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

.account-avatar--sm { width: 1.75rem;  height: 1.75rem;  font-size: 0.8125rem; }
.account-avatar--md { width: 2.125rem; height: 2.125rem; font-size: 0.9375rem; }
</style>
