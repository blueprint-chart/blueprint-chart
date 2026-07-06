// Blueprint Chart narrow embed entry.
//
// Exposes just the helpers a host needs to BUILD and drive an embed iframe,
// without pulling the full chart engine (D3, the chart registry, renderers)
// into the host bundle. The engine runs inside the iframe from the separate
// self-contained IIFE bundle, so consumers of this entry only need the srcdoc
// builder and the resize/error message contract.

export { buildSrcdoc } from './runtime/runtime'
export type { EmbedTheme } from './runtime/runtime'
export { readResizeHeight, isErrorMessage, RESIZE_MESSAGE, ERROR_MESSAGE } from './runtime/messages'
