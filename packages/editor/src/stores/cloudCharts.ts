import { getSupabaseClient } from '@/lib/supabaseClient'
import { generateId, storageKey, useChartSessionStore } from '@/stores/chartSession'
import { deletePreview } from '@/composables/useChartThumbnail'

const CLOUD_INDEX_KEY = 'blueprint-chart:cloud-index'

function readCloudIndex(): Set<string> {
  try {
    const raw = localStorage.getItem(CLOUD_INDEX_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  }
  catch {
    return new Set()
  }
}

function writeCloudIndex(ids: Set<string>): void {
  localStorage.setItem(CLOUD_INDEX_KEY, JSON.stringify([...ids]))
}

export interface CloudChartSummary {
  id: string
  title: string
  chartType: string
  published: boolean
  updatedAt: string | null
}

export interface CloudChartInput {
  /** Omit to insert a new row (a fresh 11-char id is minted); supply to update. */
  id?: string
  dsl: string
  meta: Record<string, unknown>
  title: string
  chartType: string
}

export const useCloudChartsStore = defineStore('cloudCharts', () => {
  async function listCloud(): Promise<CloudChartSummary[]> {
    const client = await getSupabaseClient()
    if (!client) {
      return []
    }
    const { data, error } = await client
      .from('charts')
      .select('id, title, chart_type, published, updated_at')
      .order('updated_at', { ascending: false })
    if (error || !data) {
      return []
    }
    return data.map(row => ({
      id: row.id as string,
      title: (row.title as string) ?? '',
      chartType: (row.chart_type as string) ?? '',
      published: Boolean(row.published),
      updatedAt: (row.updated_at as string) ?? null,
    }))
  }

  async function loadCloud(id: string): Promise<{ dsl: string, meta: Record<string, unknown>, owner: string } | null> {
    const client = await getSupabaseClient()
    if (!client) {
      return null
    }
    const { data, error } = await client
      .from('charts')
      .select('dsl, meta, owner')
      .eq('id', id)
      .single()
    if (error || !data) {
      return null
    }
    return { dsl: data.dsl as string, meta: (data.meta as Record<string, unknown>) ?? {}, owner: data.owner as string }
  }

  /** Insert (no id) or update (id given). Returns the row id, or null on failure. */
  async function pushCloud(input: CloudChartInput): Promise<string | null> {
    const client = await getSupabaseClient()
    if (!client) {
      return null
    }
    const now = new Date().toISOString()
    if (input.id) {
      const { error } = await client
        .from('charts')
        .update({
          dsl: input.dsl,
          meta: input.meta,
          title: input.title,
          chart_type: input.chartType,
          updated_at: now,
        })
        .eq('id', input.id)
      return error ? null : input.id
    }
    // Insert with collision-retry on the text primary key.
    for (let attempt = 0; attempt < 5; attempt++) {
      const id = generateId()
      const { error } = await client.from('charts').insert({
        id,
        dsl: input.dsl,
        meta: input.meta,
        title: input.title,
        chart_type: input.chartType,
        updated_at: now,
      })
      if (!error) {
        return id
      }
      // 23505 = unique_violation; retry with a new id. Anything else: give up.
      if ((error as { code?: string }).code !== '23505') {
        return null
      }
    }
    return null
  }

  async function deleteCloud(id: string): Promise<boolean> {
    const client = await getSupabaseClient()
    if (!client) {
      return false
    }
    const { error } = await client.from('charts').delete().eq('id', id)
    return !error
  }

  async function publish(id: string, published: boolean): Promise<boolean> {
    const client = await getSupabaseClient()
    if (!client) {
      return false
    }
    // .select() so a zero-row update (no such row / not owned) is detectable —
    // a PATCH matching nothing otherwise returns {error:null} and looks like success.
    const { data, error } = await client
      .from('charts')
      .update({ published, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
    return !error && Array.isArray(data) && data.length > 0
  }

  /** True iff a chart row exists for this id and is currently published. */
  async function isPublished(id: string): Promise<boolean> {
    const client = await getSupabaseClient()
    if (!client) {
      return false
    }
    const { data, error } = await client
      .from('charts')
      .select('published')
      .eq('id', id)
      .single()
    if (error || !data) {
      return false
    }
    return Boolean(data.published)
  }

  /** Anon-readable fetch of a PUBLISHED chart's DSL (used by the render route). */
  async function fetchPublished(id: string): Promise<string | null> {
    const client = await getSupabaseClient()
    if (!client) {
      return null
    }
    const { data, error } = await client
      .from('charts')
      .select('dsl')
      .eq('id', id)
      .eq('published', true)
      .single()
    if (error || !data) {
      return null
    }
    return (data.dsl as string) ?? null
  }

  function markCloudBacked(id: string): void {
    const ids = readCloudIndex()
    ids.add(id)
    writeCloudIndex(ids)
  }

  function isCloudBacked(id: string): boolean {
    return readCloudIndex().has(id)
  }

  function unmarkCloudBacked(id: string): void {
    const ids = readCloudIndex()
    ids.delete(id)
    writeCloudIndex(ids)
  }

  /** Remove the local copies (DSL, meta, thumbnail, preview) of every synced
   *  chart — i.e. cloud-backed charts that still have a local entry — and clear
   *  the cloud index. Local-only charts (absent from the index) are untouched.
   *  Used on sign-out so synced charts don't linger on a shared device. */
  function clearLocalSynced(): void {
    const session = useChartSessionStore()
    for (const id of readCloudIndex()) {
      if (localStorage.getItem(storageKey(id)) !== null) {
        session.deleteChart(id)
        deletePreview(id)
      }
    }
    writeCloudIndex(new Set())
  }

  async function syncCloud(input: CloudChartInput): Promise<string | null> {
    const client = await getSupabaseClient()
    if (!client || !input.id) {
      return null
    }
    const { error } = await client
      .from('charts')
      .upsert({
        id: input.id,
        dsl: input.dsl,
        meta: input.meta,
        title: input.title,
        chart_type: input.chartType,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    return error ? null : input.id
  }

  return { listCloud, loadCloud, pushCloud, deleteCloud, publish, isPublished, fetchPublished, markCloudBacked, isCloudBacked, unmarkCloudBacked, clearLocalSynced, syncCloud }
})

export function useCloudCharts() {
  const store = useCloudChartsStore()
  return {
    listCloud: store.listCloud,
    loadCloud: store.loadCloud,
    pushCloud: store.pushCloud,
    deleteCloud: store.deleteCloud,
    publish: store.publish,
    isPublished: store.isPublished,
    fetchPublished: store.fetchPublished,
    markCloudBacked: store.markCloudBacked,
    isCloudBacked: store.isCloudBacked,
    unmarkCloudBacked: store.unmarkCloudBacked,
    clearLocalSynced: store.clearLocalSynced,
    syncCloud: store.syncCloud,
  }
}
