<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon, ButtonIcon, NavigationSegmentedControl, type NavigationSegmentedControlItem } from '@blueprint-chart/ui'
import IPhDotsThree from '~icons/ph/dots-three'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhSignOut from '~icons/ph/sign-out'
import IPhSignIn from '~icons/ph/sign-in'
import IPhMonitor from '~icons/ph/monitor'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import AccountAvatar from '@/components/Account/AccountAvatar.vue'
import AccountSignInModal from '@/components/Account/AccountSignInModal.vue'
import { useAccount } from '@/stores/account'
import { useTheme, type ThemeMode } from '@/stores/theme'
import { accountsEnabled } from '@/config/runtimeConfig'

const THEME_OPTIONS = [
  { key: 'auto', text: 'System', icon: IPhMonitor },
  { key: 'light', text: 'Light', icon: IPhSun },
  { key: 'dark', text: 'Dark', icon: IPhMoon },
] as const

const router = useRouter()
const { user, isSignedIn, signOut, init, signInModalOpen } = useAccount()
const { theme } = useTheme()
const showAccount = accountsEnabled()

if (showAccount) {
  void init()
}

const email = computed(() => user.value?.email ?? '')
const displayName = computed(() => email.value.split('@')[0])
const showSignIn = computed(() => showAccount && !isSignedIn.value)

const themeItems = computed<NavigationSegmentedControlItem[]>(() => THEME_OPTIONS.map(option => ({
  ...option,
  title: option.text,
  active: theme.value === option.key,
})))

function onSelectTheme(key: string) {
  theme.value = key as ThemeMode
}

function goToCharts() {
  router.push('/charts')
}

async function onSignOut() {
  await signOut()
  router.push('/charts')
}
</script>

<template>
  <div class="layout-sidebar-footer">
    <div
      v-if="isSignedIn"
      class="layout-sidebar-footer__identity"
    >
      <AccountAvatar
        :email="email"
        size="md"
      />
      <span class="layout-sidebar-footer__identity__name">{{ displayName }}</span>
    </div>
    <ButtonIcon
      v-else-if="showSignIn"
      :icon-left="IPhSignIn"
      label="Sign in"
      variant="strong"
      size="sm"
      @click="signInModalOpen = true"
    />

    <BDropdown
      variant="outline-secondary"
      size="sm"
      no-caret
      aria-label="More options"
      placement="top-end"
      :offset="8"
      teleport-to="body"
      toggle-class="layout-sidebar-footer__more"
      menu-class="layout-sidebar-footer__menu"
    >
      <template #button-content>
        <AppIcon :name="IPhDotsThree" />
      </template>

      <template v-if="isSignedIn">
        <BDropdownText>
          <span class="layout-sidebar-footer__menu__email">{{ email }}</span>
        </BDropdownText>
        <BDropdownDivider />
        <BDropdownItem @click="goToCharts">
          <span class="layout-sidebar-footer__menu__item">
            <AppIcon
              :name="IPhSquaresFour"
              size="sm"
            />
            My charts
          </span>
        </BDropdownItem>
      </template>

      <li
        class="layout-sidebar-footer__theme"
        @click.stop
      >
        <span class="layout-sidebar-footer__theme__label">Theme</span>
        <NavigationSegmentedControl
          :items="themeItems"
          aria-label="Theme"
          size="sm"
          icon-only
          @select="onSelectTheme"
        />
      </li>

      <template v-if="isSignedIn">
        <BDropdownDivider />
        <BDropdownItem @click="onSignOut">
          <span class="layout-sidebar-footer__menu__item">
            <AppIcon
              :name="IPhSignOut"
              size="sm"
            />
            Sign out
          </span>
        </BDropdownItem>
      </template>
    </BDropdown>

    <AccountSignInModal
      v-if="showAccount"
      v-model:open="signInModalOpen"
    />
  </div>
</template>

<style scoped lang="scss">
.layout-sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  &__identity {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;

    &__name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
      color: var(--bs-emphasis-color);
    }
  }

  :deep(.layout-sidebar-footer__more) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border-radius: 50%;
    --bs-btn-color: var(--bs-secondary-color);
    --bs-btn-border-color: var(--bs-border-color);
    --bs-btn-hover-color: var(--bs-emphasis-color);
    --bs-btn-hover-bg: var(--bs-tertiary-bg);
    --bs-btn-hover-border-color: var(--bs-border-color);
    --bs-btn-active-color: var(--bs-emphasis-color);
    --bs-btn-active-bg: var(--bs-tertiary-bg);
    --bs-btn-active-border-color: var(--bs-border-color);
  }

  :deep(.dropdown) {
    margin-left: auto;
  }
}

:global(.layout-sidebar-footer__menu) {
  min-width: 15rem;
}

:global(.layout-sidebar-footer__menu__email) {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--bs-secondary-color);
}

:global(.layout-sidebar-footer__menu__item) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.layout-sidebar-footer__theme {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 1rem;

  &__label {
    color: var(--bs-body-color);
  }
}
</style>
