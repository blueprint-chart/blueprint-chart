<script setup lang="ts">
import { computed, nextTick, useId, useTemplateRef } from 'vue'
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

const { navbar = false } = defineProps<{ navbar?: boolean }>()

const router = useRouter()
const { user, isSignedIn, signOut, init, signInModalOpen } = useAccount()
const { theme, cycleTheme } = useTheme()
const showAccount = accountsEnabled()

if (showAccount) {
  void init()
}

const email = computed(() => user.value?.email ?? '')
const showSignIn = computed(() => showAccount && !isSignedIn.value)
const themeIcon = computed(() => THEME_OPTIONS.find(option => option.key === theme.value)?.icon ?? IPhMonitor)
const placement = computed(() => navbar ? 'bottom-end' : 'top-start')
const wrapperClass = computed(() => navbar ? undefined : 'account-menu__trigger-wrapper')
// Lands the menu's bottom edge on the footer's top edge: the footer's
// 0.375rem top padding (NavigationSidebar.vue).
const MENU_OFFSET_TO_FOOTER_EDGE = 6

const root = useTemplateRef<HTMLElement>('root')
const dropdownId = useId()

async function matchTriggerWidth() {
  if (navbar) {
    return
  }
  await nextTick()
  const trigger = root.value?.querySelector<HTMLElement>('.account-menu__trigger')
  const menu = document.getElementById(`${dropdownId}-menu`)
  if (trigger && menu) {
    menu.style.minWidth = `${trigger.offsetWidth}px`
  }
}

const toggleClass = computed(() => navbar ? 'account-menu__more' : 'account-menu__trigger')
const signInClass = computed(() => navbar ? 'account-menu__sign-in' : 'account-menu__sign-in account-menu__sign-in--fill')

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
  <div
    ref="root"
    class="account-menu"
  >
    <ButtonIcon
      v-if="!isSignedIn"
      :icon-left="themeIcon"
      label="Toggle theme"
      hide-label
      square
      variant="primary"
      size="sm"
      @click="cycleTheme"
    />

    <ButtonIcon
      v-if="showSignIn"
      :class="signInClass"
      :icon-left="IPhSignIn"
      label="Sign in"
      variant="strong"
      size="sm"
      @click="signInModalOpen = true"
    />

    <BDropdown
      v-if="isSignedIn"
      :id="dropdownId"
      variant="outline-secondary"
      size="sm"
      no-caret
      aria-label="More options"
      :placement="placement"
      :offset="MENU_OFFSET_TO_FOOTER_EDGE"
      teleport-to="body"
      :wrapper-class="wrapperClass"
      :toggle-class="toggleClass"
      menu-class="account-menu__menu"
      @show="matchTriggerWidth"
    >
      <template #button-content>
        <AccountAvatar
          :email="email"
          :size="navbar ? 'sm' : 'md'"
        />
        <AppIcon
          v-if="!navbar"
          :name="IPhDotsThree"
        />
      </template>

      <BDropdownText>
        <span class="account-menu__menu__header">
          <AccountAvatar
            :email="email"
            size="md"
          />
          <span class="account-menu__menu__header__id">
            <span class="account-menu__menu__header__label">Signed in as</span>
            <span class="account-menu__menu__header__email">{{ email }}</span>
          </span>
        </span>
      </BDropdownText>
      <BDropdownDivider />
      <BDropdownItem @click="goToCharts">
        <span class="account-menu__menu__item">
          <AppIcon
            :name="IPhSquaresFour"
            size="sm"
          />
          My charts
        </span>
      </BDropdownItem>
      <BDropdownDivider />

      <li
        class="account-menu__menu__theme"
        @click.stop
      >
        <span class="account-menu__menu__theme__label">
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

      <BDropdownDivider />
      <BDropdownItem @click="onSignOut">
        <span class="account-menu__menu__item">
          <AppIcon
            :name="IPhSignOut"
            size="sm"
          />
          Sign out
        </span>
      </BDropdownItem>
    </BDropdown>

    <AccountSignInModal
      v-if="showAccount"
      v-model:open="signInModalOpen"
    />
  </div>
</template>

<style scoped lang="scss">
.account-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  &__sign-in--fill {
    flex: 1;
  }

  :deep(.account-menu__trigger-wrapper) {
    flex: 1;
    min-width: 0;
  }

  :deep(.account-menu__trigger) {
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
    --bs-btn-hover-bg: var(--bc-wash-soft);
    --bs-btn-active-color: var(--bs-emphasis-color);
    --bs-btn-active-bg: var(--bc-wash-soft);
  }

  :deep(.account-menu__more) {
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
}

:global(.account-menu__menu) {
  min-width: 15rem;
}

:global(.account-menu__menu__header) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

:global(.account-menu__menu__header__id) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

:global(.account-menu__menu__header__label) {
  font-size: var(--bs-font-size-xs);
  color: var(--bs-secondary-color);
}

:global(.account-menu__menu__header__email) {
  font-weight: 500;
  color: var(--bs-emphasis-color);
  overflow-wrap: anywhere;
}

:global(.account-menu__menu__item) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.account-menu__menu__theme {
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
