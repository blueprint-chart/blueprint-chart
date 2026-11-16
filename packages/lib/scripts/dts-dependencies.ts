import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const BARE_SPECIFIER = /(?:\bfrom\s+|\bimport\s*\(\s*)['"]([^'".][^'"]*)['"]/g

function readManifest(path: string) {
  const text = readFileSync(path, 'utf8')
  return JSON.parse(text)
}

function packageName(specifier: string): string {
  const segments = specifier.split('/')
  const nameLength = specifier.startsWith('@') ? 2 : 1
  const nameSegments = segments.slice(0, nameLength)
  return nameSegments.join('/')
}

function typesPackageName(name: string): string {
  const flatName = name.replace(/^@/, '').replace('/', '__')
  return `@types/${flatName}`
}

function hasOwnTypes(packageDir: string, name: string): boolean {
  const installDir = join(packageDir, 'node_modules', name)
  const manifest = readManifest(join(installDir, 'package.json'))
  const declared = Boolean(manifest.types ?? manifest.typings)
  return declared || existsSync(join(installDir, 'index.d.ts'))
}

function importedPackages(contents: Iterable<string>): Set<string> {
  const names = new Set<string>()
  for (const content of contents) {
    for (const match of content.matchAll(BARE_SPECIFIER)) {
      const name = packageName(match[1])
      names.add(name)
    }
  }
  return names
}

export function findUntypedDependencies(contents: Iterable<string>, packageDir: string): string[] {
  const manifest = readManifest(join(packageDir, 'package.json'))
  const shipped = { ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies }
  const problems: string[] = []
  for (const name of importedPackages(contents)) {
    const typesPackage = typesPackageName(name)
    if (!(name in shipped)) {
      problems.push(`${name} is imported by the published types but is not a dependency`)
    }
    else if (!hasOwnTypes(packageDir, name) && !(typesPackage in shipped)) {
      problems.push(`${name} ships no types and ${typesPackage} is not a dependency`)
    }
  }
  return problems
}
