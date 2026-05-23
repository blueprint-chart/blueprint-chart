import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

export type DocGroup = 'handbook' | 'guide' | 'charts' | 'reference/dsl' | 'reference/api'

export interface DocEntry {
  slug: string
  group: DocGroup
  title: string
  blurb: string
  mdPath: string
}

interface Manifest {
  entries: DocEntry[]
}

let cached: Manifest | undefined

function loadManifest(): Manifest {
  if (cached) {
    return cached
  }
  const manifestPath = join(PKG_ROOT, 'dist', 'manifest.json')
  if (!existsSync(manifestPath)) {
    throw new Error(
      `@blueprint-chart/docs: manifest.json not found at ${manifestPath}. `
      + `Did you run \`pnpm --filter @blueprint-chart/docs build\`?`,
    )
  }
  cached = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  return cached
}

export function listDocs(group?: DocGroup): DocEntry[] {
  const all = loadManifest().entries
  return group ? all.filter(e => e.group === group) : all
}

export function getDoc(group: DocGroup, slug: string): { entry: DocEntry, content: string } {
  const entry = loadManifest().entries.find(e => e.group === group && e.slug === slug)
  if (!entry) {
    throw new Error(`@blueprint-chart/docs: no doc at ${group}/${slug}`)
  }
  const content = readFileSync(join(PKG_ROOT, 'src', entry.mdPath), 'utf8')
  return { entry, content }
}
