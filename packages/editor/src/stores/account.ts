import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useCloudChartsStore } from '@/stores/cloudCharts'

export interface AccountUser {
  id: string
  email: string
}

export type AccountStatus = 'idle' | 'sending' | 'link-sent' | 'error'

function toAccountUser(user: User | null | undefined): AccountUser | null {
  if (!user) {
    return null
  }
  return { id: user.id, email: user.email ?? '' }
}

/** Redirect target for the magic link: site root WITHOUT the router hash, so
 *  Supabase appends `?code=...` as a query param the boot step can exchange. */
function redirectTarget(): string {
  return `${window.location.origin}${window.location.pathname}`
}

export const useAccountStore = defineStore('account', () => {
  const user = shallowRef<AccountUser | null>(null)
  const status = shallowRef<AccountStatus>('idle')
  const errorMessage = shallowRef<string | null>(null)
  // Memoized in-flight init() promise so concurrent callers await the SAME
  // session restore instead of a second caller returning before user is set.
  let initPromise: Promise<void> | null = null

  const isSignedIn = computed(() => user.value !== null)

  async function init(): Promise<void> {
    if (initPromise) {
      return initPromise
    }
    initPromise = (async () => {
      const client = await getSupabaseClient()
      if (!client) {
        return
      }
      const { data } = await client.auth.getSession()
      user.value = toAccountUser((data.session as Session | null)?.user)
      client.auth.onAuthStateChange((_event, session) => {
        user.value = toAccountUser((session as Session | null)?.user)
      })
    })()
    return initPromise
  }

  async function signInWithEmail(email: string): Promise<void> {
    const client = await getSupabaseClient()
    if (!client) {
      return
    }
    status.value = 'sending'
    errorMessage.value = null
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTarget() },
    })
    if (error) {
      status.value = 'error'
      errorMessage.value = error.message
      return
    }
    status.value = 'link-sent'
  }

  async function signOut(): Promise<void> {
    const client = await getSupabaseClient()
    if (!client) {
      return
    }
    // Drop synced charts from this device BEFORE auth.signOut() — that call
    // fires onAuthStateChange('SIGNED_OUT') which flips showCloud and triggers
    // the dashboard's refresh. Purging first guarantees that refresh re-reads
    // local storage AFTER the synced charts are gone (otherwise it shows a stale
    // list). They live in the cloud and return on next sign-in; local-only
    // charts are kept.
    useCloudChartsStore().clearLocalSynced()
    await client.auth.signOut()
    user.value = null
    status.value = 'idle'
  }

  function resetStatus(): void {
    status.value = 'idle'
    errorMessage.value = null
  }

  return { user, status, errorMessage, isSignedIn, init, signInWithEmail, signOut, resetStatus }
})

export function useAccount() {
  const store = useAccountStore()
  const { user, status, errorMessage, isSignedIn } = storeToRefs(store)
  return {
    user,
    status,
    errorMessage,
    isSignedIn,
    init: store.init,
    signInWithEmail: store.signInWithEmail,
    signOut: store.signOut,
    resetStatus: store.resetStatus,
  }
}
