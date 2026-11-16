import { existsSync } from 'node:fs'
import { join } from 'node:path'

const RELATIVE_SPECIFIER = /(\bfrom\s+|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]+)\2/g

function resolveSpecifier(sourceDir: string, specifier: string): string {
  const target = join(sourceDir, specifier)
  if (existsSync(`${target}.ts`)) {
    return `${specifier}.js`
  }
  if (existsSync(join(target, 'index.ts'))) {
    return `${specifier}/index.js`
  }
  return specifier
}

export function addDtsExtensions(content: string, sourceDir: string): string {
  return content.replace(RELATIVE_SPECIFIER, (_match, prefix: string, quote: string, specifier: string) => {
    const resolved = resolveSpecifier(sourceDir, specifier)
    return `${prefix}${quote}${resolved}${quote}`
  })
}
