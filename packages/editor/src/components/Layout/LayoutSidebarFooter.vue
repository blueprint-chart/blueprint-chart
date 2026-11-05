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
import IPhCircleHalf from '~icons/ph/circle-half'
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
const showSignIn = computed(() => showAccount && !isSignedIn.value)
const wrapperClass = computed(() => isSignedIn.value ? 'layout-sidebar-footer__trigger-wrapper' : 'layout-sidebar-footer__more-wrapper')
// Lands the menu's bottom edge on the footer's top edge: the footer's
// 0.375rem top padding (NavigationSidebar.vue).
const MENU_OFFSET_TO_FOOTER_EDGE = 6

const toggleClass = computed(() => isSignedIn.value ? 'layout-sidebar-footer__trigger' : 'layout-sidebar-footer__more')

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
    <ButtonIcon
      v-if="showSignIn"
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
      :placement="isSignedIn ? 'top-start' : 'top-end'"
      :offset="MENU_OFFSET_TO_FOOTER_EDGE"
      teleport-to="body"
      :wrapper-class="wrapperClass"
      :toggle-class="toggleClass"
      menu-class="layout-sidebar-footer__menu"
    >
      <template #button-content>
        <AccountAvatar
          v-if="isSignedIn"
          :email="email"
          size="md"
        />
        <AppIcon :name="IPhDotsThree" />
      </template>

      <template v-if="isSignedIn">
        <BDropdownText>
          <span class="layout-sidebar-footer__menu__header">
            <AccountAvatar
              :email="email"
              size="md"
            />
            <span class="layout-sidebar-footer__menu__header__id">
              <span class="layout-sidebar-footer__menu__header__label">Signed in as</span>
              <span class="layout-sidebar-footer__menu__header__email">{{ email }}</span>
            </span>
          </span>
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
        <BDropdownDivider />
      </template>

      <li
        class="layout-sidebar-footer__theme"
        @click.stop
      >
        <span class="layout-sidebar-footer__theme__label">
          <AppIcon
            :name="IPhCircleHalf"
            size="sm"
          />
          Theme
        </span>
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

  :deep(.layout-sidebar-footer__trigger-wrapper) {
    flex: 1;
    min-width: 0;
  }

  :deep(.layout-sidebar-footer__trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.375rem;
    border: 0;
    border-radius: var(--bs-border-radius);
    --bs-btn-color: var(--bs-secondary-color);
    --bs-btn-bg: transparent;
    --bs-btn-hover-color: var(--bs-emphasis-color);
    --bs-btn-hover-bg: var(--bs-tertiary-bg);
    --bs-btn-active-color: var(--bs-emphasis-color);
    --bs-btn-active-bg: var(--bs-tertiary-bg);
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

  :deep(.layout-sidebar-footer__more-wrapper) {
    margin-left: auto;
  }
}

:global(.layout-sidebar-footer__menu) {
  min-width: 15rem;
}

:global(.layout-sidebar-footer__menu__header) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

:global(.layout-sidebar-footer__menu__header__id) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

:global(.layout-sidebar-footer__menu__header__label) {
  font-size: var(--bs-font-size-xs);
  color: var(--bs-secondary-color);
}

:global(.layout-sidebar-footer__menu__header__email) {
  font-weight: 500;
  color: var(--bs-emphasis-color);
  overflow-wrap: anywhere;
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
  padding: var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);

  &__label {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    color: var(--bs-body-color);
  }
}
</style>
