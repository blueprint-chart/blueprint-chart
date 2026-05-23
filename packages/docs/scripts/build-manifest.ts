import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, relative, basename } from 'node:path'
import { existsSync } from 'node:fs'
import matter from 'gray-matter'

const SRC = join(import.meta.dirname, '..', 'src')
const DIST = join(import.meta.dirname, '..', 'dist')

const GROUPS = ['handbook', 'guide', 'charts', 'reference/dsl', 'reference/api'] as const

interface DocEntry {
  slug: string
  group: typeof GROUPS[number]
  title: string
  blurb: string
  mdPath: string
}

async function main() {
  const entries: DocEntry[] = []

  for (const group of GROUPS) {
    const dir = join(SRC, group)
    if (!existsSync(dir)) continue
    const files = (await readdir(dir)).filter(f => f.endsWith('.md') && f !== 'index.md')
    for (const file of files) {
      const path = join(dir, file)
      const raw = await readFile(path, 'utf8')
      const parsed = matter(raw)
      const slug = basename(file, '.md')
      const title = (parsed.data.title as string) ?? slug.replace(/-/g, ' ')
      const blurb = parsed.content.split('\n').find(l => l.trim() && !l.startsWith('#'))?.slice(0, 200) ?? ''
      entries.push({ slug, group, title, blurb, mdPath: relative(SRC, path) })
    }
  }

  if (!existsSync(DIST)) await mkdir(DIST, { recursive: true })
  await writeFile(join(DIST, 'manifest.json'), JSON.stringify({ entries }, null, 2))
  console.log(`Wrote ${entries.length} entries to dist/manifest.json`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
