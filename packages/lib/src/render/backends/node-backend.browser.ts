import type { RenderBackend } from './types'
import { MissingNodeRenderDepsError } from '../errors'

/** Browser build resolves the node backend to this throwing stub — the heavy
 *  native deps must never enter a browser bundle. Reached only if a browser
 *  caller forces the Node path. */
export function createNodeBackend(): RenderBackend {
  throw new MissingNodeRenderDepsError('The Node render backend is not available in browser environments.')
}
