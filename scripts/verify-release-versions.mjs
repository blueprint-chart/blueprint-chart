// scripts/verify-release-versions.mjs
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { argv, env, exit } from 'node:process'

const tag = env.TAG || argv[2]
if (!tag) {
  console.error('Usage: TAG=v0.2.0 node scripts/verify-release-versions.mjs  (or pass tag as arg)')
  exit(1)
}

const expected = tag.startsWith('v') ? tag.slice(1) : tag

const packages = ['lib', 'ui', 'editor']
const mismatches = []

for (const pkg of packages) {
  const manifestPath = join('packages', pkg, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.version !== expected) {
    mismatches.push(`${manifestPath}: version=${manifest.version}, expected=${expected}`)
  }
  else {
    console.log(`OK  ${manifestPath}: ${manifest.version}`)
  }
}

if (mismatches.length > 0) {
  console.error('\nVersion mismatch:')
  for (const m of mismatches) {
    console.error(`  ${m}`)
  }
  exit(1)
}

console.log(`\nAll three packages at version ${expected} — matches tag ${tag}.`)
