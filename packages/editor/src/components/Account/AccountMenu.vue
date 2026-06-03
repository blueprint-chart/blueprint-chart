<template>
  <div class="account-menu">
    <template v-if="isSignedIn">
      <BDropdown
        variant="outline-secondary"
        size="sm"
        end
        teleport-to="body"
        menu-class="account-menu__menu"
      >
        <template #button-content>
          <AccountAvatar
            :email="email"
            size="sm"
          />
          <span class="visually-hidden">Account menu, {{ email }}</span>
        </template>

        <BDropdownText>
          <!-- Flex lives on this inner div: BDropdownText puts a class on its
               outer <li> but wraps content in a .dropdown-item-text span, so a
               class on the component wouldn't lay out the avatar + text as a row. -->
          <div class="account-menu__header">
            <AccountAvatar
              :email="email"
              size="md"
            />
            <span class="account-menu__header__id">
              <span class="account-menu__header__label">Signed in as</span>
              <span class="account-menu__header__email">{{ email }}</span>
            </span>
          </div>
        </BDropdownText>

        <BDropdownDivider />

        <BDropdownItem @click="goToCharts">
          <span class="account-menu__item">
            <AppIcon
              :name="IPhSquaresFour"
              size="sm"
            />
            My charts
          </span>
        </BDropdownItem>

        <BDropdownDivider />

        <BDropdownItem @click="onSignOut">
          <span class="account-menu__item">
            <AppIcon
              :name="IPhSignOut"
              size="sm"
            />
            Sign out
          </span>
        </BDropdownItem>
      </BDropdown>
    </template>

    <template v-else>
      <ButtonIcon
        :icon-left="IPhSignIn"
        label="Sign in"
        variant="primary"
        size="sm"
        @click="modalOpen = true"
      />
    </template>

    <AccountSignInModal v-model:open="modalOpen" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AppIcon, ButtonIcon } from '@blueprint-chart/ui'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhSignOut from '~icons/ph/sign-out'
import IPhSignIn from '~icons/ph/sign-in'
import AccountAvatar from '@/components/Account/AccountAvatar.vue'
import AccountSignInModal from '@/components/Account/AccountSignInModal.vue'
import { useAccount } from '@/stores/account'

const router = useRouter()
const { user, isSignedIn, signOut, init } = useAccount()
const modalOpen = ref(false)
const email = computed(() => user.value?.email ?? '')

// Self-contained: load the session wherever this is mounted (navbar OR landing).
// init() is memoized in the store, so repeat/concurrent calls are safe.
void init()

function goToCharts() {
  router.push('/charts')
}

async function onSignOut() {
  await signOut()
  router.push('/charts')
}
</script>

<style scoped lang="scss">
.account-menu__header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.account-menu__header__id {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.account-menu__header__label {
  font-size: var(--bs-font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  font-weight: 600;
}

.account-menu__header__email {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 1.5rem;
}

// The avatar (1.75rem) is taller than the sm button's line-box, which would
// inflate the toggle past the navbar's other btn-sm controls. Pin the toggle
// to the same natural button height ButtonIcon uses for its square buttons and
// center the avatar within it, so all navbar controls line up.
.account-menu :deep(.dropdown-toggle) {
  display: inline-flex;
  align-items: center;
  height: calc(
    var(--bs-btn-line-height) * var(--bs-btn-font-size)
    + var(--bs-btn-padding-y) * 2
    + var(--bs-btn-border-width) * 2
  );
  padding-block: 0;
}
</style>
