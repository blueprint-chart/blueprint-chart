<template>
  <div class="account-menu">
    <template v-if="isSignedIn">
      <BDropdown
        :text="user?.email || 'Account'"
        variant="outline-secondary"
        size="sm"
        end
      >
        <BDropdownItem @click="goToCharts">
          My charts
        </BDropdownItem>
        <BDropdownItem @click="onSignOut">
          Sign out
        </BDropdownItem>
      </BDropdown>
    </template>
    <template v-else>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="modalOpen = true"
      >
        Sign in
      </button>
    </template>
    <AccountSignInModal v-model:open="modalOpen" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AccountSignInModal from '@/components/Account/AccountSignInModal.vue'
import { useAccount } from '@/stores/account'

const router = useRouter()
const { user, isSignedIn, signOut } = useAccount()
const modalOpen = ref(false)

function goToCharts() {
  router.push('/charts')
}

async function onSignOut() {
  await signOut()
  router.push('/charts')
}
</script>
