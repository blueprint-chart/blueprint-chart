import { existsSync } from 'node:fs'
import { join } from 'node:path'

const RELATIVE_SPECIFIER = /(\bfrom\s+|\bimport\s*\(\s*|^\s*import\s+|\bdeclare\s+module\s+)(['"])(\.{1,2}\/[^'"]*)\2/gm
const MODULE_EXTENSIONS = ['.ts', '.d.ts', '.js']

function hasModule(basePath: string): boolean {
  return MODULE_EXTENSIONS.some(extension => existsSync(`${basePath}${extension}`))
}

function resolveSpecifier(sourceDir: string, specifier: string): string {
  const trimmed = specifier.replace(/\/$/, '')
  const target = join(sourceDir, trimmed)
  const targetWithoutJs = target.replace(/\.js$/, '')
  if (trimmed.endsWith('.js') && hasModule(targetWithoutJs)) {
    return specifier
  }
  if (hasModule(target)) {
    return `${trimmed}.js`
  }
  if (hasModule(join(target, 'index'))) {
    return `${trimmed}/index.js`
  }
  throw new Error(`Cannot resolve declaration import '${specifier}' from ${sourceDir}`)
}

export function addDtsExtensions(content: string, sourceDir: string): string {
  return content.replace(RELATIVE_SPECIFIER, (_match, prefix: string, quote: string, specifier: string) => {
    const resolved = resolveSpecifier(sourceDir, specifier)
    return `${prefix}${quote}${resolved}${quote}`
  })
}
