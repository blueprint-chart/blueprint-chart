import type { Selection } from 'd3-selection'
import type { D3Selection } from 'd3-blueprint'

/**
 * Widen a typed d3 `Selection<E, D, P, PD>` into the broader `D3Selection`
 * shape that d3-blueprint's class/method APIs accept.
 *
 * d3-blueprint defines `D3Selection = Selection<BaseType, unknown, BaseType, unknown>`,
 * but d3's `Selection` is invariant in its generics, so calls like
 * `new ChartClass(d3.select(group))` don't structurally unify even though
 * the underlying runtime value is identical. The return type uses `any` for
 * the data/parent generics so callers can still chain typed `.data()` and
 * `.selectAll()` calls without forcing `unknown` everywhere.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function widen(selection: Selection<any, any, any, any>): Selection<any, any, any, any> & D3Selection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return selection as unknown as Selection<any, any, any, any> & D3Selection
}
