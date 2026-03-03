import { buildParserFile } from '@lezer/generator'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const grammar = readFileSync(join(dir, 'bpc.grammar'), 'utf-8')
const { parser } = buildParserFile(grammar)

writeFileSync(join(dir, 'bpc-parser.js'), parser)
console.log('Built bpc-parser.js')
