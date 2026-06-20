import * as d3 from 'd3'
import { D3Blueprint } from 'd3-blueprint'

/**
 * Minimal D3Blueprint host whose only job is to carry the legacy plugins
 * (tooltip, crosshair, annotations) that consume the `.use()` / `.draw()` API.
 *
 * Marks are rendered through the SceneTransition orchestrator's featureJoin, not
 * this class — so `initialize` defines no layers. Renderers that have migrated
 * their marks but still host plugins use `createPluginHost` instead of declaring
 * a per-file empty subclass.
 */
class PluginHost extends D3Blueprint<unknown> {
  initialize(): void {}
}

export function createPluginHost(
  selection: d3.Selection<SVGGElement, unknown, null, undefined>,
): PluginHost {
  return new PluginHost(selection)
}
